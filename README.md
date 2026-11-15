# Nestling

*The first year, gently understood.*

A calm, evidence-graded guide for parents of babies from birth to 12 months: milestones, play and curiosity, breastfeeding, formula feeding, starting solids, hydration, safe sleep, sleep and crying, dummies, checks and vaccines, when to get help, and looking after yourself. Every claim carries an evidence grade and a link to its source.

**Open it:** https://fco-cyber.github.io/nestling/

General information only, not personal medical advice. Services and schedules are for Victoria, Australia. Evidence reviewed on 13 and 14 November 2026.

## Install it on your device

Once installed, Nestling opens like any other app, works without internet, and keeps itself up to date.

- **iPhone or iPad:** open the link in Safari, tap the Share button (the square with an arrow pointing up), then choose **Add to Home Screen**.
- **Android:** open the link in Chrome and tap **Install** when it's offered, or open the ⋮ menu and choose **Install app** (on some phones, **Add to Home screen**).
- **Mac:** in Safari, open the **File** menu and choose **Add to Dock**. In Chrome or Edge, click the install icon at the right-hand end of the address bar.
- **Windows or Chromebook:** in Chrome or Edge, click the install icon at the right-hand end of the address bar, or use the browser menu's install option.

Inside the app, **Colours and display › On this device** (on a small phone: the menu, then **Colours, text size and motion**) shows whether the offline copy is saved, offers **Install** where the browser allows it, and has a **Share this app** button.

## Updates

New versions reach every device by themselves. Whenever Nestling is opened with an internet connection, it loads the latest version and saves it for offline use. If it's already open when a new version is published, a small bar offers **Refresh**.

## Publishing a new version

1. Claude prepares the update: the new version's file goes into `versions/`, and `index.html`, `sw.js` and `version.json` are rebuilt from it by `tools/build_site.py`.
2. On GitHub, open the repository, choose **Add file › Upload files**, and drag in the updated files (dragging in everything again is fine too: unchanged files are simply left as they are).
3. Press **Commit changes** (a commit is GitHub's word for saving a change). About a minute later the new version is live.

The files in `versions/` are never altered, so each one still works when it's opened straight from a folder on a computer. Earlier versions stay there as a record.

## What's in this repository

A repository is a project's folder on GitHub, with every past change kept. This one is published as a website with GitHub Pages, GitHub's free website hosting.

| File or folder | What it is |
|---|---|
| `index.html` | The live app: the newest version, with the install and offline features added |
| `sw.js` | The service worker: a small background script that keeps the offline copy and picks up new versions |
| `pwa.js` | The install, share and update features inside the app |
| `manifest.webmanifest` | The app's name, colours, icons and shortcuts, used when it's installed |
| `version.json` | Which version is live |
| `icons/` and `screenshots/` | App icons, install previews, and the picture shown when the link is shared |
| `versions/` | Every version of the app, one self-contained file each |
| `tools/` | `build_site.py`, which prepares an update, and the service worker's template |
| `DEPLOY.md` | Step-by-step instructions for putting the site online and publishing updates |
| `LICENSE` | The licence: CC BY-NC-SA 4.0 |

## Privacy

No accounts, adverts, analytics or tracking. Your baby's details, ticks, timers and notes stay in the browser, on that device. GitHub, which hosts the site, keeps standard server logs, as any website host does.

## Licence

Shared under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0): anyone may share and adapt it with credit, not for commercial use, and under the same licence. See `LICENSE`.
