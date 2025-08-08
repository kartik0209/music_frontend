import api from '../utils/api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/user/change-password', passwordData);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/user/account');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await api.get('/user/history', { params });
    return response.data;
  },

  getFavorites: async (params = {}) => {
    const response = await api.get('/user/favorites', { params });
    return response.data;
  },

  addFavorite: async (songId) => {
    const response = await api.post(`/user/favorites/${songId}`);
    return response.data;
  },

  removeFavorite: async (songId) => {
    const response = await api.delete(`/user/favorites/${songId}`);
    return response.data;
  },

  getPlaylists: async (params = {}) => {
    const response = await api.get('/playlists/user/me', { params });
    return response.data;
  },

  createPlaylist: async (playlistData) => {
    const response = await api.post('/playlists', playlistData);
    return response.data;
  },

  updatePlaylist: async (playlistId, playlistData) => {
    const response = await api.put(`/playlists/${playlistId}`, playlistData);
    return response.data;
  },

  deletePlaylist: async (playlistId) => {
    const response = await api.delete(`/playlists/${playlistId}`);
    return response.data;
  },

  addSongToPlaylist: async (playlistId, songId, position) => {
    const response = await api.post(`/playlists/${playlistId}/songs`, {
      songId,
      position
    });
    return response.data;
  },

  removeSongFromPlaylist: async (playlistId, songId) => {
    const response = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  rateSong: async (songId, rating) => {
    const response = await api.post(`/ratings/${songId}`, { rating });
    return response.data;
  },

  getUserRating: async (songId) => {
    const response = await api.get(`/ratings/${songId}/user`);
    return response.data;
  },

  removeRating: async (songId) => {
    const response = await api.delete(`/ratings/${songId}`);
    return response.data;
  }
};

export const songService = {
  getSongs: async (params = {}) => {
    const response = await api.get('/songs', { params });
    return response.data;
  },

  getSong: async (songId) => {
    const response = await api.get(`/songs/${songId}`);
    return response.data;
  },

  playSong: async (songId) => {
    const response = await api.post(`/songs/${songId}/play`);
    return response.data;
  },

  searchSongs: async (query, params = {}) => {
    const response = await api.get('/songs/search', {
      params: { q: query, ...params }
    });
    return response.data;
  },

  getSongsByGenre: async (genre, params = {}) => {
    const response = await api.get(`/songs/genre/${genre}`, { params });
    return response.data;
  },

  getFeaturedSongs: async (params = {}) => {
    const response = await api.get('/songs/featured', { params });
    return response.data;
  },

  getTopRatedSongs: async (params = {}) => {
    const response = await api.get('/ratings/top-rated', { params });
    return response.data;
  }
};

export const streamService = {
  getAudioUrl: (songId) => {
    return `/api/stream/audio/${songId}`;
  },

  getCoverUrl: (songId) => {
    return `/api/stream/cover/${songId}`;
  },

  getMetadata: async (songId) => {
    const response = await api.get(`/stream/metadata/${songId}`);
    return response.data;
  },

  downloadSong: (songId) => {
    window.open(`/api/stream/download/${songId}`, '_blank');
  },

  getQualityOptions: async (songId) => {
    const response = await api.get(`/stream/quality/${songId}`);
    return response.data;
  },

  reportCompletion: async (songId, duration, percentage) => {
    const response = await api.post(`/stream/complete/${songId}`, {
      duration,
      percentage
    });
    return response.data;
  },

  getPlaylistStream: async (playlistId) => {
    const response = await api.get(`/stream/playlist/${playlistId}`);
    return response.data;
  }
};

export const playlistService = {
  getPlaylists: async (params = {}) => {
    const response = await api.get('/playlists', { params });
    return response.data;
  },

  getFeaturedPlaylists: async (params = {}) => {
    const response = await api.get('/playlists/featured', { params });
    return response.data;
  },

  getUserPlaylists: async (userId, params = {}) => {
    const response = await api.get(`/playlists/user/${userId}`, { params });
    return response.data;
  },

  getPlaylist: async (playlistId) => {
    const response = await api.get(`/playlists/${playlistId}`);
    return response.data;
  },

  followPlaylist: async (playlistId) => {
    const response = await api.post(`/playlists/${playlistId}/follow`);
    return response.data;
  },

  unfollowPlaylist: async (playlistId) => {
    const response = await api.delete(`/playlists/${playlistId}/follow`);
    return response.data;
  },

  addCollaborator: async (playlistId, userId, permission = 'edit') => {
    const response = await api.post(`/playlists/${playlistId}/collaborators`, {
      userId,
      permission
    });
    return response.data;
  },

  removeCollaborator: async (playlistId, userId) => {
    const response = await api.delete(`/playlists/${playlistId}/collaborators/${userId}`);
    return response.data;
  },

  reorderSongs: async (playlistId, songIds) => {
    const response = await api.put(`/playlists/${playlistId}/reorder`, {
      songIds
    });
    return response.data;
  }
};