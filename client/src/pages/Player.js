import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { musicAPI, playlistAPI } from '../api/api';
import MusicPlayer from '../components/MusicPlayer';
import PlaylistManager from '../components/PlaylistManager';
import '../styles/Player.css';

function Player() {
  const [musicList, setMusicList] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('player'); // 'player' or 'playlists'
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    fetchMusic();
    fetchPlaylists();
  }, []);

  const fetchMusic = async () => {
    try {
      const response = await musicAPI.getAll();
      setMusicList(response.data);
    } catch (err) {
      setError('Failed to load music');
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await playlistAPI.getAll();
      setPlaylists(response.data);
    } catch (err) {
      setError('Failed to load playlists');
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      await musicAPI.upload(file);
      fetchMusic();
    } catch (err) {
      setError('Failed to upload music');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMusic = async (id) => {
    try {
      await musicAPI.delete(id);
      fetchMusic();
      if (currentTrack?.id === id) {
        setCurrentTrack(null);
      }
    } catch (err) {
      setError('Failed to delete music');
    }
  };

  const handlePlaylistSelect = async (playlistId) => {
    try {
      const response = await playlistAPI.getById(playlistId);
      setCurrentPlaylist(response.data);
      if (response.data.songs.length > 0) {
        setCurrentTrack(response.data.songs[0]);
        setCurrentTrackIndex(0);
      }
    } catch (err) {
      setError('Failed to load playlist');
    }
  };

  const handlePlayTrack = (track) => {
    setCurrentTrack(track);
  };

  const handleNextTrack = () => {
    const currentList = currentPlaylist?.songs || musicList;
    if (currentTrackIndex < currentList.length - 1) {
      const nextTrack = currentList[currentTrackIndex + 1];
      setCurrentTrack(nextTrack);
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handlePreviousTrack = () => {
    if (currentTrackIndex > 0) {
      const prevTrack = (currentPlaylist?.songs || musicList)[currentTrackIndex - 1];
      setCurrentTrack(prevTrack);
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="player-container">
      <div className="player-header">
        <h1>🎵 MP3 Player</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'player' ? 'active' : ''}`}
          onClick={() => setTab('player')}
        >
          Player
        </button>
        <button
          className={`tab ${tab === 'playlists' ? 'active' : ''}`}
          onClick={() => setTab('playlists')}
        >
          Playlists
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="player-content">
        {tab === 'player' && (
          <MusicPlayer
            audioRef={audioRef}
            currentTrack={currentTrack}
            musicList={musicList}
            onPlayTrack={handlePlayTrack}
            onUpload={handleUpload}
            onDelete={handleDeleteMusic}
            onNext={handleNextTrack}
            onPrevious={handlePreviousTrack}
            loading={loading}
          />
        )}

        {tab === 'playlists' && (
          <PlaylistManager
            playlists={playlists}
            currentPlaylist={currentPlaylist}
            musicList={musicList}
            onPlaylistSelect={handlePlaylistSelect}
            onRefresh={() => {
              fetchPlaylists();
              setCurrentPlaylist(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Player;
