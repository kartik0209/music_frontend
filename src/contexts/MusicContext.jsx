import { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { message } from 'antd';
import api from '../utils/api';

const MusicPlayerContext = createContext();

const initialState = {
  currentSong: null,
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  shuffle: false,
  repeat: 'none',
  showPlayer: false
};

const musicPlayerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      return {
        ...state,
        currentSong: action.payload.song,
        playlist: action.payload.playlist || [action.payload.song],
        currentIndex: action.payload.index || 0,
        showPlayer: true
      };
    
    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload.playlist,
        currentIndex: action.payload.index || 0,
        currentSong: action.payload.playlist[action.payload.index || 0],
        showPlayer: true
      };
    
    case 'PLAY':
      return { ...state, isPlaying: true };
    
    case 'PAUSE':
      return { ...state, isPlaying: false };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'UPDATE_TIME':
      return {
        ...state,
        currentTime: action.payload.currentTime,
        duration: action.payload.duration
      };
    
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    
    case 'NEXT_SONG':
      const nextIndex = state.shuffle 
        ? Math.floor(Math.random() * state.playlist.length)
        : (state.currentIndex + 1) % state.playlist.length;
      return {
        ...state,
        currentIndex: nextIndex,
        currentSong: state.playlist[nextIndex]
      };
    
    case 'PREVIOUS_SONG':
      const prevIndex = state.currentIndex === 0 
        ? state.playlist.length - 1 
        : state.currentIndex - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        currentSong: state.playlist[prevIndex]
      };
    
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    
    case 'SET_REPEAT':
      const repeatModes = ['none', 'one', 'all'];
      const currentModeIndex = repeatModes.indexOf(state.repeat);
      const nextMode = repeatModes[(currentModeIndex + 1) % repeatModes.length];
      return { ...state, repeat: nextMode };
    
    case 'HIDE_PLAYER':
      return { ...state, showPlayer: false };
    
    default:
      return state;
  }
};

export const MusicPlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(musicPlayerReducer, initialState);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      dispatch({
        type: 'UPDATE_TIME',
        payload: {
          currentTime: audio.currentTime,
          duration: audio.duration || 0
        }
      });
    };

    const handleEnded = () => {
      if (state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (state.repeat === 'all' || state.currentIndex < state.playlist.length - 1) {
        nextSong();
      } else {
        dispatch({ type: 'PAUSE' });
      }
    };

    const handleLoadStart = () => dispatch({ type: 'SET_LOADING', payload: true });
    const handleCanPlay = () => dispatch({ type: 'SET_LOADING', payload: false });
    
    const handleError = (e) => {
      console.error('Audio error:', e);
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'PAUSE' });
    };

    const handleLoadedData = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
    };
  }, [state.repeat, state.currentIndex, state.playlist.length]);

  // Handle audio source changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentSong) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    // Create the audio URL with token
    const audioUrl = `http://localhost:5000/api/stream/audio/${state.currentSong._id}?token=${token}`;
    
    // Reset audio state
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Set crossorigin to handle CORS properly
    audio.crossOrigin = 'use-credentials';
    audio.preload = 'metadata';
    
    // Set the source
    audio.src = audioUrl;
    
    console.log('Loading audio from:', audioUrl);
  }, [state.currentSong]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
          if (error.name !== 'AbortError') {
            dispatch({ type: 'PAUSE' });
            message.error('Failed to play audio. Please check your connection.');
          }
        });
      } else {
        // Wait for audio to be ready
        const handleCanPlay = () => {
          audio.play().catch(error => {
            console.error('Error playing audio:', error);
            if (error.name !== 'AbortError') {
              dispatch({ type: 'PAUSE' });
              message.error('Failed to play audio. Please check your connection.');
            }
          });
          audio.removeEventListener('canplay', handleCanPlay);
        };
        audio.addEventListener('canplay', handleCanPlay);
      }
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = state.volume;
    }
  }, [state.volume]);

  const playSong = async (song, playlist = null, index = 0) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (playlist) {
        dispatch({
          type: 'SET_PLAYLIST',
          payload: { playlist, index }
        });
      } else {
        dispatch({
          type: 'SET_CURRENT_SONG',
          payload: { song: song }
        });
      }
      
      // Don't auto-play immediately, let the audio load first
      setTimeout(() => {
        dispatch({ type: 'PLAY' });
      }, 100);
      
    } catch (error) {
      console.error('Error playing song:', error);
      message.error('Failed to play song');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const play = () => dispatch({ type: 'PLAY' });
  const pause = () => dispatch({ type: 'PAUSE' });
  const togglePlay = () => state.isPlaying ? pause() : play();

  const nextSong = () => {
    if (state.playlist.length > 1) {
      dispatch({ type: 'NEXT_SONG' });
      setTimeout(() => dispatch({ type: 'PLAY' }), 100);
    }
  };

  const previousSong = () => {
    if (state.playlist.length > 1) {
      dispatch({ type: 'PREVIOUS_SONG' });
      setTimeout(() => dispatch({ type: 'PLAY' }), 100);
    }
  };

  const seekTo = (time) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = time;
    }
  };

  const setVolume = (volume) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const toggleShuffle = () => dispatch({ type: 'TOGGLE_SHUFFLE' });
  const toggleRepeat = () => dispatch({ type: 'SET_REPEAT' });

  const addToQueue = (song) => {
    const newPlaylist = [...state.playlist, song];
    dispatch({
      type: 'SET_PLAYLIST',
      payload: { playlist: newPlaylist, index: state.currentIndex }
    });
    message.success('Added to queue');
  };

  const reportCompletion = async () => {
    if (!state.currentSong) return;
    
    try {
      const percentage = (state.currentTime / state.duration) * 100;
      await api.post(`/stream/complete/${state.currentSong._id}`, {
        duration: state.currentTime,
        percentage
      });
    } catch (error) {
      console.error('Error reporting completion:', error);
    }
  };

  const value = {
    ...state,
    audioRef,
    playSong,
    play,
    pause,
    togglePlay,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    reportCompletion
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};