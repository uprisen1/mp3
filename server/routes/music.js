const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('./auth');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// In-memory music storage
const musicLibrary = new Map();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

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

// Upload music
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const musicId = Date.now().toString();
    const musicData = {
      id: musicId,
      title: req.file.originalname.replace(/\.[^/.]+$/, ''),
      filename: req.file.filename,
      filepath: `/uploads/${req.file.filename}`,
      uploadedBy: req.userId,
      uploadedAt: new Date(),
      duration: 0, // Would need to parse this from audio file
    };

    musicLibrary.set(musicId, musicData);
    res.json(musicData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all music
router.get('/all', authMiddleware, (req, res) => {
  try {
    const allMusic = Array.from(musicLibrary.values());
    res.json(allMusic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stream music file
router.get('/stream/:id', authMiddleware, (req, res) => {
  try {
    const music = musicLibrary.get(req.params.id);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    const filepath = path.join(uploadDir, music.filename);
    const stat = fs.statSync(filepath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'audio/mpeg',
      });

      fs.createReadStream(filepath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });
      fs.createReadStream(filepath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete music
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const music = musicLibrary.get(req.params.id);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    if (music.uploadedBy !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const filepath = path.join(uploadDir, music.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    musicLibrary.delete(req.params.id);
    res.json({ message: 'Music deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.musicLibrary = musicLibrary;
