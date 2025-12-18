# Deployment Roadmap: Secret Santa V2
**Architecture**:
-   **Database**: Firebase Firestore (Access via `serviceAccountKey.json`).
-   **Backend**: Render (Node.js/Express).
-   **Frontend**: Vercel (React/Vite).

## Phase 1: Verify & Push Code (DONE)
1.  **Codebase Fixed**: I have re-applied the fixes to ensure the code works with Firebase (removed Mongoose-specific commands like `populate`).
2.  **Key Added**: `serviceAccountKey.json` is in `server/`.
3.  **Git Push**: I will push these changes to GitHub now.

## Phase 2: Render Deployment (Backend)
1.  **Dashboard**: Go to your Render Dashboard.
2.  **Env Vars**: Ensure these Environment Variables are set in Render:
    -   `NODE_VERSION`: `20` (or `22`)
    -   `FIREBASE_SERVICE_ACCOUNT`: *See Note Below*
    -   `EMAIL_USER`: (Your email)
    -   `EMAIL_PASS`: (Your App Password)
    -   `JWT_SECRET`: (Any random string)
    -   `FRONTEND_URL`: (Your Vercel URL)
    -   *Note*: Since we committed `serviceAccountKey.json` to the repo (for simplicity), you actually **don't** strictly need `FIREBASE_SERVICE_ACCOUNT` variable unless you want to override it. The code looks for the file first.
3.  **Deploy**: Click **"Manual Deploy"** -> **"Deploy latest commit"**.
4.  **Verify**: Wait for it to match "Live". View Logs to ensure "Server running" appears.

## Phase 3: Vercel Deployment (Frontend)
1.  **Dashboard**: Go to Vercel.
2.  **Env Vars**: Ensure `VITE_API_BASE_URL` is set to your **Render Backend URL** (e.g., `https://secret-santa-backend.onrender.com`).
    -   *Crucial*: If you change this, you must **Redeploy** Vercel for it to take effect.
3.  **Deploy**: Push to main (triggers auto-deploy) or manually redeploy.

## Phase 4: Final Check
1.  Open Vercel App.
2.  Login as Admin (`kokachi` / `kokachi@admin`).
3.  If you see the Dashboard, you are golden! 🏆
