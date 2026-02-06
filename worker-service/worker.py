import redis
import json
import psycopg2
import time
from playwright.sync_api import sync_playwright

r = redis.Redis(host='localhost', port=6379, db=0)

# Database Connection
def get_db_connection():
    try:
        conn = psycopg2.connect("dbname=parcel_db user=admin password=password host=localhost")
        return conn
    except Exception as e:
        print(f"Connection Failed: {e}")
        return None

conn = get_db_connection()
cursor = conn.cursor()

def scrape_stable(tracking_no, mode):
    data = None
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False) 
        page = browser.new_page()
        try:
            print(f"   [Browser] Navigating to BlueDart...")
            page.goto("https://www.bluedart.com/", timeout=60000)
            
            if mode == 'ref':
                page.locator("label:has-text('Ref No')").click()
                time.sleep(2) 
            else:
                page.locator("label:has-text('Waybill')").click()
            
            page.get_by_role("textbox").nth(0).click()
            page.keyboard.type(tracking_no, delay=50) 
            page.locator("#goBtn").click()

            print("\n" + "="*50)
            print("   ⚠️  HUMAN HELP: Type Captcha in Chrome -> Click GO -> Wait for Table")
            print("   👉 THEN PRESS ENTER HERE...")
            print("="*50 + "\n")
            input("   [Press Enter] >> ")
            
            # Scrape logic
            rows = page.locator("tr")
            real_waybill = tracking_no
            origin_val = "Unknown"
            dest_val = "Unknown"
            status_val = "Status Not Found"

            for i in range(rows.count()):
                row_text = rows.nth(i).inner_text()
                cells = row_text.split('\t')
                if len(cells) < 2: cells = row_text.split('\n')
                cells = [c.strip() for c in cells if c.strip()]
                
                if len(cells) >= 2:
                    if "Waybill No" in cells[0]: real_waybill = cells[1]
                    if "From" == cells[0]: origin_val = cells[1]
                    if "To" == cells[0]: dest_val = cells[1]
                    if "Status" == cells[0]: status_val = cells[1]

            data = {
                "waybill": real_waybill,
                "origin": origin_val[:50],
                "destination": dest_val[:50],
                "status": status_val[:90]
            }

        except Exception as e:
            print(f"   [Browser Error] {e}")
        finally:
            browser.close()
    return data

print("WORKER READY...")

while True:
    try:
        queue_item = r.brpop('job_queue', timeout=0) 
        if queue_item:
            job_data = json.loads(queue_item[1])
            job_id = job_data['jobId']
            pattern = job_data['pattern']
            mode = job_data.get('mode', 'waybill') 
            
            print(f"\nProcessing: {pattern}")
            
            result = scrape_stable(pattern, mode)
            
            if result:
                print(f"-> SAVING...")
                try:
                    cursor.execute("""
                        INSERT INTO shipments (job_id, reference_no, waybill_no, origin, destination, status)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (job_id, pattern, result['waybill'], result['origin'], result['destination'], result['status']))
                    conn.commit()
                    print("-> DATA SAVED.")
                except psycopg2.errors.ForeignKeyViolation:
                    # THIS HANDLES YOUR ERROR
                    print("-> ERROR: Job ID missing in DB (Old Ghost Job). Skipping...")
                    conn.rollback() 
                except Exception as db_err:
                    print(f"-> DB ERROR: {db_err}")
                    conn.rollback() # Fixes 'transaction aborted' loop
            else:
                print("-> FAILED.")
            
    except Exception as e:
        print(f"Loop Error: {e}")
        # Reconnect if connection dropped
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
        except:
            pass
        time.sleep(1)