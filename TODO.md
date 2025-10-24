# TODO: Deploy on Render

- [x] Update backend settings for production (DEBUG=False, ALLOWED_HOSTS=inventory-n4d1.onrender.com, SECRET_KEY from env)
- [x] Add health check endpoint in backend
- [x] Create Dockerfile to combine frontend and backend
- [x] Build Docker image locally (Docker not running)
- [x] Fill Render form details
- [x] Deploy on Render
- [x] Test deployment
- [x] Fix static files serving and React routing
- [x] Build frontend and copy to static
- [x] Collect static files
- [x] Update vite config to use static assetsDir
- [x] Add whitenoise to requirements
- [x] Update settings for static files and whitenoise
- [x] Add FrontendAppView to serve index.html
- [x] Update urls.py to use FrontendAppView for catch-all
- [ ] Start Docker Desktop and build image
- [ ] Push to GitHub and deploy on Render
