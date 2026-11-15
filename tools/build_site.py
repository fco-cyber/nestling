#!/usr/bin/env python3
"""Prepare a Nestling update for GitHub.

Takes the newest app file in versions/ (the highest number after "v" in its name,
for example "Nestling newborn and first year guide v2.html") and writes the three files that the
live site uses, in the folder above tools/:

    index.html     the app, with what makes it installable, shareable and usable offline
    sw.js          the service worker (offline copy and updates), stamped with this version
    version.json   which version is live

The files in versions/ are never changed: they stay identical to the master copies,
which still work when opened straight from a folder.

    python3 tools/build_site.py [--base-url https://fco-cyber.github.io/nestling]
"""
import argparse, datetime, hashlib, html, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://fco-cyber.github.io/nestling"


def version_of(path):
    m = re.search(r"v(\d+(?:\.\d+)*)\.html?$", path.name, re.I)
    return tuple(int(x) for x in m.group(1).split(".")) if m else (0,)


def today_melbourne():
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("Australia/Melbourne")).date().isoformat()
    except Exception:
        return datetime.date.today().isoformat()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default=BASE)
    a = ap.parse_args()

    files = sorted((ROOT / "versions").glob("*.htm*"), key=version_of)
    if not files:
        sys.exit("No app file found in versions/")
    src = files[-1]
    ver = ".".join(map(str, version_of(src)))
    page = src.read_text(encoding="utf-8")
    if "</head>" not in page or "</body>" not in page:
        sys.exit(f"{src.name} is not a complete web page")
    stamp = f"v{ver}-{hashlib.md5(page.encode('utf-8')).hexdigest()[:7]}"
    published = today_melbourne()

    base = a.base_url.rstrip("/")
    desc = re.search(r'<meta name="description" content="([^"]*)"', page)
    desc = desc.group(1) if desc else "Nestling: the first year, gently understood."
    head = [
        f'<meta name="app-version" content="{ver}">',
        f'<meta name="app-sw" content="{stamp}">',
        f'<meta name="app-published" content="{published}">',
                '<link rel="manifest" href="manifest.webmanifest">',
        '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-title" content="Nestling">',
        '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
        '<meta property="og:type" content="website">',
        '<meta property="og:title" content="Nestling: the first year, gently understood">',
        f'<meta property="og:description" content="{desc}">',
        f'<meta property="og:url" content="{html.escape(base)}/">',
        f'<meta property="og:image" content="{html.escape(base)}/screenshots/share.jpg">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    if 'rel="manifest"' not in page:
        i = page.index("</head>")
        page = page[:i] + "\n".join(head) + "\n" + page[i:]
    if 'src="pwa.js"' not in page:
        i = page.rindex("</body>")
        page = page[:i] + '<script src="pwa.js" defer></script>\n' + page[i:]
    (ROOT / "index.html").write_text(page, encoding="utf-8")

    sw = (ROOT / "tools" / "sw-template.js").read_text(encoding="utf-8")
    if "__VERSION__" not in sw:
        sys.exit("tools/sw-template.js is missing its __VERSION__ placeholder")
    (ROOT / "sw.js").write_text(sw.replace("__VERSION__", stamp), encoding="utf-8")

    (ROOT / "version.json").write_text(json.dumps(
        {"version": ver, "build": stamp, "published": published, "source": src.name}, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {src.name} as version {ver} ({stamp}): index.html, sw.js and version.json are ready to upload.")


if __name__ == "__main__":
    main()
