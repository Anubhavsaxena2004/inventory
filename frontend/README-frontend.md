Frontend README

This is a Vite + React frontend using vanilla CSS.

Install & Run (Windows PowerShell):

```powershell
cd frontend
npm install
npm run dev
```

API note:
- The frontend expects the Django backend to expose APIs under `/api/` (for example `/api/orders/view/` and `/api/customers/view/`).
- Run the Django backend (manage.py runserver) so the frontend can fetch data. If the backend runs on a different host/port, configure a proxy in `vite.config.js` or use absolute URLs in fetch calls.
