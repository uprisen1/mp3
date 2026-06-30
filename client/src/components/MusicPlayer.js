import React, { useState, useRef, useEffect } from 'react';
import { musicAPI } from '../api/api';
import '../styles/MusicPlayer.css';

function MusicPlayer({
  audioRef,
  currentTrack,
  musicList,
  onPlayTrack,
  onUpload,
  onDelete,
  onNext,
  onPrevious,
  loading,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      const streamUrl = musicAPI.getStreamUrl(currentTrack.id);
      audioRef.current.src = streamUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => onNext();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="music-player">
      <audio ref={audioRef} />

      <div className="now-playing">
        {currentTrack ? (
          <>
            <h2>Now Playing</h2>
            <p className="track-title">{currentTrack.title}</p>
            <p className="track-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </>
        ) : (
          <p>No track selected</p>
        )}
      </div>

      <div className="controls">
        <button className="control-btn" onClick={onPrevious} title="Previous">
          ⏮
        </button>
        <button className="control-btn play-btn" onClick={handlePlayPause}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="control-btn" onClick={onNext} title="Next">
          ⏭
        </button>
      </div>

      {currentTrack && (
        <div className="progress-container">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="progress-bar"
          />
        </div>
      )}

      <div className="volume-container">
        <span>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
        <span>{Math.round(volume * 100)}%</span>
      </div>

      <div className="upload-section">
        <label htmlFor="upload-input" className="upload-btn">
          {loading ? '⏳ Uploading...' : '📁 Upload Music'}
        </label>
        <input
          id="upload-input"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={loading}
          hidden
        />
      </div>

      <div className="playlist-section">
        <h3>Music Library ({musicList.length})</h3>
        <div className="music-list">
          {musicList.map((music) => (
            <div
              key={music.id}
              className={`music-item ${currentTrack?.id === music.id ? 'active' : ''}`}
            >
              <div onClick={() => onPlayTrack(music)} className="music-info">
                <p>{music.title}</p>
              </div>
              <button
                className="delete-btn"
                onClick={() => onDelete(music.id)}
                title="Delete"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
