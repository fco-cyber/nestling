# Deploying Nestling to GitHub Pages

Repository: **github.com/fco-cyber/nestling** (create it first on GitHub: **New repository**, name `nestling`, Public, then **Create repository**)
Live address once published: **https://fco-cyber.github.io/nestling/**

If you choose a different repository name, tell Claude, so the address written into the app's sharing details can be updated with `python3 tools/build_site.py --base-url https://fco-cyber.github.io/<name>`.

If you see a plain page with just the repository name and a one-line description, the app files are not in the repository yet. That page is GitHub's default, made from the README when there is no `index.html` at the top level.

**The single thing that must be true: `index.html` sits at the top level of the repository, not inside a folder.**

---

## Option A: GitHub website, no software needed

1. Go to the repository on GitHub, then **Add file › Upload files**.

2. **Open the `nestling-pwa` folder and select everything inside it.**
   Drag *the contents* into the browser, **not** the folder itself.

   - Correct: `index.html` appears in the repository's file list.
   - Wrong: a single folder appears, and the site stays broken.

   On a Mac, open the folder, press **⌘A** to select all, then drag. Folders inside it (`icons`, `screenshots`, `versions`, `tools`) keep their structure.

3. Press **Commit changes**. The `README.md` from the folder replaces the one GitHub made when the repository was created.

4. One file will not survive a browser upload, because macOS hides it. Add it by hand: **Add file › Create new file**, type the name exactly as `.nojekyll`, leave the file completely empty, and commit. It stops GitHub trying to build the app as a blog.

5. **Settings › Pages.** Under *Build and deployment*, set **Source: Deploy from a branch**, branch `main`, folder `/ (root)`, and press **Save**. (If you set it to *GitHub Actions* earlier, change it to this.)

6. Wait a minute or two, then open https://fco-cyber.github.io/nestling/. If you see an old page, hard-refresh with **⌘⇧R**.

## Option B: command line

```bash
cd path/to/nestling-pwa
git init
git add -A                       # -A includes .nojekyll
git commit -m "Publish Nestling"
git branch -M main
git remote add origin https://github.com/fco-cyber/nestling.git
git push -u origin main --force
```

Then set **Settings › Pages › Source: Deploy from a branch**, `main`, `/ (root)`. Here `--force` replaces the README that GitHub made.

---

## Checking it worked

The repository's file list should show:

```
index.html            <- this one matters most
sw.js
pwa.js
manifest.webmanifest
version.json
icons/
screenshots/
versions/
tools/
README.md
DEPLOY.md
LICENSE
.nojekyll
```

Then open the site, choose **Colours and display** (the ring button at the top right; on a small phone, open the menu and choose **Colours, text size and motion**), and look under **On this device**. After a few seconds it should say *Saved on this device. Opens without internet.*

## Publishing a new version

1. Claude prepares the update in this folder: the new version's file goes into `versions/`, and `index.html`, `sw.js` and `version.json` are rebuilt from it with `tools/build_site.py`.
2. Upload the folder's contents again exactly as in Option A, step 2. Files that haven't changed are simply left as they are.
3. A minute or two later the new version is live.

Installed copies load the new version the next time they're opened with internet, and keep it for offline use. A copy that is already open shows *A new version of Nestling is ready* with a **Refresh** button. Nothing needs changing by hand in `sw.js`: each build stamps it with the new version.

## If you only want it working, quickly

The whole app is one file. Upload **`index.html`** on its own and it works straight away: every section, every tool, every palette. You lose only the extras (working offline, installing it to a home screen, the app icon). Add the other files whenever you want those.

## Troubleshooting

**Still the plain README page.** There is no `index.html` at the top level. Recheck Option A, step 2.

**App icons or install previews missing.** The `icons` or `screenshots` folders didn't upload. Check that they're in the repository.

**Works online but not offline.** Load the site once while connected, then wait a few seconds for it to save. Working offline needs the `https://` address, which GitHub Pages provides. The copy in your folder still opens offline by double-clicking it; it just isn't installed.

**Changes don't appear.** Wait a minute or two, then hard-refresh with **⌘⇧R**. `https://fco-cyber.github.io/nestling/version.json` shows which version is live.

**Pages reports a build error.** Usually `.nojekyll` is missing. Add it as in Option A, step 4.
