# MP3 Music Player - Deployment Guide

## Local Development

### Setup
```bash
npm run install-all
npm run dev
```

Backend: http://localhost:5000
Frontend: http://localhost:3000

## Build for Production

```bash
# Build React frontend
npm run build-client

# Commit the build folder
git add client/build
git commit -m "Build React for production"
git push
```

## Deploy to Render

1. Go to https://render.com
2. Create a new Web Service
3. Connect your mp3 repository
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (any random string)
6. Deploy!

The app will serve the pre-built React files from `client/build` folder.
