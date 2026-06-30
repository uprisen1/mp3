import React, { useState } from 'react';
import { playlistAPI } from '../api/api';
import '../styles/PlaylistManager.css';

function PlaylistManager({
  playlists,
  currentPlaylist,
  musicList,
  onPlaylistSelect,
  onRefresh,
}) {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState('');

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      await playlistAPI.create(newPlaylistName);
      setNewPlaylistName('');
      onRefresh();
    } catch (err) {
      setError('Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      await playlistAPI.delete(id);
      onRefresh();
    } catch (err) {
      setError('Failed to delete playlist');
    }
  };

  const handleAddSongToPlaylist = async (musicId) => {
    if (!currentPlaylist) return;

    try {
      await playlistAPI.addSong(currentPlaylist.id, musicId);
      onPlaylistSelect(currentPlaylist.id);
    } catch (err) {
      setError('Failed to add song to playlist');
    }
  };

  const handleRemoveSongFromPlaylist = async (musicId) => {
    if (!currentPlaylist) return;

    try {
      await playlistAPI.removeSong(currentPlaylist.id, musicId);
      onPlaylistSelect(currentPlaylist.id);
    } catch (err) {
      setError('Failed to remove song from playlist');
    }
  };

  return (
    <div className="playlist-manager">
      <div className="create-playlist">
        <h2>Create Playlist</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleCreatePlaylist}>
          <input
            type="text"
            placeholder="Playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <button type="submit" className="create-btn">Create</button>
        </form>
      </div>

      <div className="playlists-container">
        <div className="playlists-list">
          <h2>Your Playlists</h2>
          {playlists.length === 0 ? (
            <p>No playlists yet</p>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`playlist-item ${currentPlaylist?.id === playlist.id ? 'active' : ''}`}
              >
                <div
                  onClick={() => onPlaylistSelect(playlist.id)}
                  className="playlist-info"
                >
                  <p>{playlist.name}</p>
                  <span className="song-count">{playlist.songs.length} songs</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeletePlaylist(playlist.id)}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {currentPlaylist && (
          <div className="playlist-details">
            <h2>{currentPlaylist.name}</h2>
            <div className="playlist-songs">
              <h3>Songs in Playlist ({currentPlaylist.songs.length})</h3>
              {currentPlaylist.songs.length === 0 ? (
                <p>No songs in this playlist</p>
              ) : (
                currentPlaylist.songs.map((song) => (
                  <div key={song.id} className="song-item">
                    <span>{song.title}</span>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveSongFromPlaylist(song.id)}
                      title="Remove from playlist"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="available-songs">
              <h3>Available Songs</h3>
              {musicList.length === 0 ? (
                <p>No songs available</p>
              ) : (
                musicList
                  .filter(
                    (song) => !currentPlaylist.songs.some((s) => s.id === song.id)
                  )
                  .map((song) => (
                    <div key={song.id} className="song-item">
                      <span>{song.title}</span>
                      <button
                        className="add-btn"
                        onClick={() => handleAddSongToPlaylist(song.id)}
                        title="Add to playlist"
                      >
                        +
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistManager;
