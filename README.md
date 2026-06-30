# carlescivit.github.io

Personal portfolio site, password-gated for casual privacy (not real security —
anyone who opens dev tools and is determined can get past it; this just keeps
it off search engines and out of casual view).

## How it works

- `content.html` — the actual portfolio markup. **Not deployed as-is.**
- `build_encrypt.py` — encrypts `content.html` with a password (PBKDF2-SHA256 +
  AES-256-GCM) and writes `encrypted.js`.
- `encrypted.js` — the only artifact that's actually shipped/committed. It's
  ciphertext; useless without the password.
- `app.js` — in the browser, takes the password you type, derives the same key
  (PBKDF2), and decrypts `encrypted.js` using the Web Crypto API. On success it
  injects the decrypted HTML into the page.
- `index.html` / `style.css` — shell page + styling.

Because decryption happens with the real `AES-GCM` cipher, "view source" on
the deployed page shows only ciphertext, not your resume in plaintext. This is
meaningfully more private than just hiding a `<div>` with CSS, while still
needing zero backend.

## Setting your real password

```bash
python3 build_encrypt.py "your-real-password"
```

This regenerates `encrypted.js`. Re-run it any time you:
- change the password
- edit `content.html`

## Editing content

Edit `content.html` (plain HTML, no build step needed) then re-run
`build_encrypt.py` with your password to regenerate `encrypted.js`.

## Deploying to GitHub Pages

1. Create a repo named `<your-username>.github.io`.
2. Push these files to the `main` branch (root of the repo):
   - `index.html`, `style.css`, `app.js`, `encrypted.js`, `build_encrypt.py`
   - **Do not commit `content.html`** if the repo is public. GitHub Pages
     serves files publicly regardless of repo visibility, and on a public
     repo anyone can browse straight to `content.html` in the file list and
     read your resume in plain text, bypassing the password entirely. A
     `.gitignore` is included to keep it out automatically. Keep your only
     copy of `content.html` locally (or in a private location), and re-run
     `build_encrypt.py` + push `encrypted.js` whenever you edit it.
3. In repo Settings → Pages, set source to "Deploy from branch", branch
   `main`, folder `/ (root)`.
4. Your site goes live at `https://<your-username>.github.io`.

## Notes

- The placeholder password is currently `changeme123` — change it before
  sharing the link with anyone.
- The unlock is cached in `sessionStorage` for the tab session only (closing
  the tab clears it), so you don't have to retype the password while
  browsing.
- Two "personal project" cards in the Interests section are placeholders —
  fill in `content.html` with real ones, then re-run the build script.
