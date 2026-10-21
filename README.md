# Bungoma Agricultural Extension Communication Management System

Class-project prototype based on the problem statement and Milestones 1 and 2. This ZIP includes **two ways to run the project**:

1. **Static website (`index.html`)** — opens directly in Google Chrome and can be published using GitHub Pages. It is a front-end demonstration: data is saved in that browser's local storage, and SMS sending is simulated.
2. **PHP application (`public/index.php`)** — server-rendered application with a SQLite database for local testing or PHP hosting. It includes server-side records and an optional Africa's Talking SMS adapter. It is not a full Laravel/MySQL production deployment; see notes below.

## Option A — Open the HTML version in Chrome

1. Extract the ZIP file.
2. Open the extracted `bungoma-extension-communication` folder.
3. Double-click **`index.html`**. It should open in Google Chrome or your default browser.
4. Sign in using one of the demo accounts below.

This version is useful for showing the interface and demonstrating the workflow. Its sample records and changes are stored only in the current browser. **It does not send real SMS messages and it is not a secure production login system.**

## Option B — Publish the HTML demo on GitHub Pages

1. Create a new repository on GitHub.
2. Upload the contents of this folder to the repository root (so `index.html`, `app.js`, and `style.css` are at the root, not buried in another folder).
3. In the repository, open **Settings → Pages**.
4. Under the build/deployment section, choose **Deploy from a branch**, select your main branch and the root (`/`) folder, then save.
5. Wait for GitHub Pages to publish, then open the URL shown in Settings → Pages.

GitHub Pages only serves static files. The HTML demo will work there, but the PHP application will not run on GitHub Pages.

## Option C — Run the PHP application locally

Requirements: PHP 8.1+ with `pdo_sqlite` and `curl` extensions enabled.

1. Extract the ZIP.
2. Open a terminal in the extracted project folder.
3. Run:

   ```bash
   php -S 127.0.0.1:8000 -t public
   ```

4. Open `http://127.0.0.1:8000` in Chrome.

The PHP app creates `storage/app.sqlite` and seeds demo accounts on first run. If you previously ran it and want to reset the local demo database, stop the server, back up any data you need, and delete `storage/app.sqlite`; then restart the server. Do not delete a database containing data you need.

## Demo accounts

- Officer: `mahad` / `shukri9274`
- Management: `manager` / `Password123!`

Change these credentials before any real deployment. These are classroom demo credentials only.

## Main features shown

- Officer and management login/demo access
- Farmer registration and record management
- Extension announcements and publishing workflow
- Delivery log and receipt confirmation workflow
- Duplicate-safe delivery records in the PHP version
- Reports and CSV export in the HTML demo
- SMS delivery simulation; optional Africa's Talking adapter in the PHP version

## SMS and production notes

The HTML version only simulates SMS. The PHP version also defaults to simulated delivery unless Africa's Talking credentials and server configuration are supplied. Never commit API keys or real farmer contact data to a public repository.

Milestone 1 specifies Laravel, MySQL, and Africa's Talking integration. The PHP folder here is a lightweight prototype for easier local demonstration, not a finished Laravel application. For production or formal deployment, complete the Laravel/MySQL implementation, configure SMS credentials securely, and test with the provider's sandbox before sending real messages.

## Project structure

- `index.html` — static demo entry page for Chrome and GitHub Pages
- `app.js` — static demo interaction logic
- `style.css` — static demo styling
- `public/index.php` — PHP application entry point
- `public/style.css` — PHP app styling
- `storage/` — local SQLite database is created here at runtime
- `.env.example` — example SMS configuration variable names
