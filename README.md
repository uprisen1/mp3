# MP3 Music Player

A full-stack music player web app built with React and Node.js.

## Features

✅ User authentication (login/register)
✅ Upload music files (MP3, WAV, MP4)
✅ Create and manage playlists
✅ Play/pause/skip controls
✅ Volume control
✅ Progress bar
✅ Now playing display
✅ Stream uploaded music files

## Tech Stack

**Backend:**
- Node.js
- Express.js
- JWT Authentication
- Multer (file uploads)
- BCrypt (password hashing)

**Frontend:**
- React
- Axios
- CSS/Tailwind

## Setup

### Prerequisites
- Node.js 14+
- npm or yarn

### Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your JWT_SECRET in .env

# Start server
npm run server:dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend runs on `http://localhost:3000`

### Run Both (Development)

```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Music
- `POST /api/music/upload` - Upload music file
- `GET /api/music/all` - Get all music files
- `GET /api/music/stream/:id` - Stream music file
- `DELETE /api/music/:id` - Delete music file

### Playlists
- `POST /api/playlist/create` - Create playlist
- `GET /api/playlist` - Get all playlists
- `GET /api/playlist/:playlistId` - Get playlist with songs
- `POST /api/playlist/:playlistId/add` - Add song to playlist
- `POST /api/playlist/:playlistId/remove` - Remove song from playlist
- `DELETE /api/playlist/:playlistId` - Delete playlist

## License

MIT
