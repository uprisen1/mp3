const express = require('express');
const { users } = require('./auth');
const { verifyToken } = require('./auth');
const { musicLibrary } = require('./music');
const router = express.Router();

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.userId = decoded.userId;
  next();
};

// Create playlist
router.post('/create', authMiddleware, (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Playlist name required' });
    }

    const user = users.get(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const playlistId = Date.now().toString();
    user.playlists[playlistId] = {
      id: playlistId,
      name,
      songs: [],
      createdAt: new Date(),
    };

    res.json(user.playlists[playlistId]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all playlists
router.get('/', authMiddleware, (req, res) => {
  try {
    const user = users.get(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const playlists = Object.values(user.playlists);
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add song to playlist
router.post('/:playlistId/add', authMiddleware, (req, res) => {
  try {
    const { musicId } = req.body;
    if (!musicId) {
      return res.status(400).json({ error: 'Music ID required' });
    }

    const user = users.get(req.userId);
    const playlist = user?.playlists[req.params.playlistId];

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const music = musicLibrary.get(musicId);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    if (!playlist.songs.includes(musicId)) {
      playlist.songs.push(musicId);
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove song from playlist
router.post('/:playlistId/remove', authMiddleware, (req, res) => {
  try {
    const { musicId } = req.body;
    const user = users.get(req.userId);
    const playlist = user?.playlists[req.params.playlistId];

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlist.songs = playlist.songs.filter((id) => id !== musicId);
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete playlist
router.delete('/:playlistId', authMiddleware, (req, res) => {
  try {
    const user = users.get(req.userId);
    if (!user?.playlists[req.params.playlistId]) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    delete user.playlists[req.params.playlistId];
    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlist with music details
router.get('/:playlistId', authMiddleware, (req, res) => {
  try {
    const user = users.get(req.userId);
    const playlist = user?.playlists[req.params.playlistId];

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const songsWithDetails = playlist.songs.map((musicId) => {
      return musicLibrary.get(musicId);
    }).filter(Boolean);

    res.json({
      ...playlist,
      songs: songsWithDetails,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
