# 🧠 Brain Weaver

A Second Brain / PKM app — deployable as a **100% static GitHub Pages site**. Notes are stored in a GitHub repo via the GitHub API. No server required.

---

## ✨ Features

- **Markdown Notes Editor** — Rich-text (BlockNote) with auto-save to your GitHub repo
- **Knowledge Graph** — Force-directed backlink graph
- **PARA Kanban Board** — Projects, Areas, Resources, Archives
- **Finance Tracker** — Income/expenses/savings with charts
- **Command Palette** — `Cmd+K` / `Ctrl+K` quick navigation
- **Daily Notes Calendar** — Date-based note browser
- **Tags & Backlinks** — Auto-extracted across all notes

---

## 🚀 Deploy to GitHub Pages

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

### 2. Enable GitHub Pages
Go to repo → **Settings → Pages → Source → GitHub Actions**

### 3. Configure base URL (if needed)
If deploying to `https://<user>.github.io/<repo>/` (not a root user site), edit `.github/workflows/deploy.yml`:
```yaml
VITE_BASE_URL: /<your-repo-name>/
```

### 4. Push — it deploys automatically on every push to `main`.

---

## ⚙️ First-time App Setup

1. Click the **⚙️ Settings** icon (top-right of the notes editor)
2. Enter your **GitHub PAT** (Personal Access Token)
   - Create at: GitHub → Settings → Developer Settings → PAT → Fine-grained
   - Required scope: **Contents** read+write on your notes repo
3. Enter your **GitHub Username** and **Notes Repository Name**
4. (Optional) Enter an **OpenRouter API Key** for AI tag suggestions
5. **Save** — notes load immediately

---

## 🏗️ Local Development
```bash
npm install
npm run dev   # http://localhost:8080
```

## 📦 Build
```bash
npm run build   # output: ./dist
```

---

## 🔧 GitHub Pages Adaptations

| Original | This build |
|---|---|
| `BrowserRouter` | `HashRouter` |
| Supabase auth + cloud sync | Stubbed (localStorage only) |
| Lovable OAuth | Removed |
| Cloudflare Workers plugin | Removed |

To re-enable cloud sync, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as repo secrets.
