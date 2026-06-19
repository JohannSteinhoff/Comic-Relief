import re, time, json, sys
from playwright.sync_api import sync_playwright

PLACE_URL = ("https://www.google.com/maps/place/Comic+Relief/@29.8922257,-97.9222687,17z/"
             "data=!4m6!3m5!1s0x865ca84929955c97:0x8a86320a6c99c5b3!8m2!3d29.8922257!4d-97.9222687"
             "!16s%2Fg%2F1tx15ssr?hl=en")

found = set()
URL_RE = re.compile(r"https://lh[0-9]\.googleusercontent\.com/[A-Za-z0-9_./=-]+|https://streetviewpixels[A-Za-z0-9.-]*\.googleapis\.com/[A-Za-z0-9_./=?&-]+")

def harvest(page):
    html = page.content()
    for m in URL_RE.findall(html):
        base = m.split("=w")[0].split("=s")[0]
        if "gps-cs" in base or "/p/" in base or "googleusercontent" in base or "streetview" in base:
            found.add(base)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        locale="en-US", viewport={"width":1280,"height":900})

    # capture image URLs from network traffic too
    def on_resp(resp):
        u = resp.url
        if "googleusercontent.com" in u and ("gps-cs" in u or "/p/" in u):
            found.add(u.split("=w")[0].split("=s")[0])
    ctx.on("response", on_resp)

    page = ctx.new_page()
    print("loading place...", flush=True)
    page.goto(PLACE_URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(4000)

    # dismiss consent if present
    for sel in ["button[aria-label*='Accept']","button:has-text('Accept all')","form[action*='consent'] button"]:
        try:
            el = page.query_selector(sel)
            if el: el.click(); page.wait_for_timeout(1500); print("clicked consent", flush=True)
        except: pass

    harvest(page)
    print("after place page:", len(found), flush=True)

    # click the photos button / first photo to open gallery
    opened = False
    for sel in ["button[aria-label*='Photo']","button[jsaction*='heroHeaderImage']",
                "div[aria-label*='Photo'] button","img[decoding]"]:
        try:
            el = page.query_selector(sel)
            if el:
                el.click(); page.wait_for_timeout(3500); opened=True
                print("opened gallery via", sel, flush=True); break
        except Exception as e:
            pass

    # find the scrollable photo grid and scroll it repeatedly
    page.wait_for_timeout(2000)
    harvest(page)
    last = -1; stable = 0
    for i in range(120):
        try:
            page.mouse.wheel(0, 3000)
        except: pass
        # also try scrolling any scrollable container
        page.evaluate("""() => {
            document.querySelectorAll('div').forEach(d => {
                if (d.scrollHeight > d.clientHeight + 50) d.scrollTop = d.scrollHeight;
            });
        }""")
        page.wait_for_timeout(800)
        harvest(page)
        if len(found) == last:
            stable += 1
            if stable >= 8:
                print("no new photos, stopping at iter", i, flush=True); break
        else:
            stable = 0
        last = len(found)
        if i % 10 == 0: print(f"iter {i}: {len(found)} urls", flush=True)

    harvest(page)
    browser.close()

clean = sorted(found)
open("photo_urls.txt","w").write("\n".join(clean))
print("TOTAL UNIQUE:", len(clean), flush=True)
