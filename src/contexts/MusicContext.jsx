import { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { streamingAPI } from '../utils/api';

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
  showPlayer: false,
  streamUrl: null
};

const musicPlayerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      return {
        ...state,
        currentSong: action.payload.song,
        playlist: action.payload.playlist || [action.payload.song],
        currentIndex: action.payload.index || 0,
        showPlayer: true,
        streamUrl: null,
        isLoading: false // Reset loading when setting new song
      };
    
    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload.playlist,
        currentIndex: action.payload.index || 0,
        currentSong: action.payload.playlist[action.payload.index || 0],
        showPlayer: true,
        streamUrl: null,
        isLoading: false
      };
    
    case 'SET_STREAM_URL':
      return { ...state, streamUrl: action.payload, isLoading: false };
    
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
        currentSong: state.playlist[nextIndex],
        streamUrl: null,
        isLoading: false
      };
    
    case 'PREVIOUS_SONG':
      const prevIndex = state.currentIndex === 0 
        ? state.playlist.length - 1 
        : state.currentIndex - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        currentSong: state.playlist[prevIndex],
        streamUrl: null,
        isLoading: false
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
  const loadingRef = useRef(false); // Prevent multiple simultaneous loads

  // Audio event handlers - moved to useCallback to prevent recreating
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      dispatch({
        type: 'UPDATE_TIME',
        payload: {
          currentTime: audio.currentTime,
          duration: audio.duration || 0
        }
      });
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (state.repeat === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    } else if (state.repeat === 'all' || state.currentIndex < state.playlist.length - 1) {
      nextSong();
    } else {
      dispatch({ type: 'PAUSE' });
    }
  }, [state.repeat, state.currentIndex, state.playlist.length]);

  const handleLoadStart = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
  }, []);

  const handleCanPlay = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);
  
  const handleError = useCallback((e) => {
    console.error('Audio error:', e);
    dispatch({ type: 'SET_LOADING', payload: false });
    dispatch({ type: 'PAUSE' });
    message.error('Audio playback failed. Please try again.');
  }, []);

  const handleLoadedData = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    dispatch({ type: 'SET_LOADING', payload: false });
    if (audio) {
      dispatch({
        type: 'UPDATE_TIME',
        payload: {
          currentTime: audio.currentTime,
          duration: audio.duration || 0
        }
      });
    }
  }, []);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, [handleTimeUpdate, handleEnded, handleLoadStart, handleCanPlay, handleLoadedData, handleLoadedMetadata, handleError]);

  // Load stream URL when current song changes - FIXED: Added dependency check
  useEffect(() => {
    const loadStreamUrl = async () => {
      if (!state.currentSong?._id || loadingRef.current || state.streamUrl) {
        return; // Don't load if already loading or already have URL
      }

      loadingRef.current = true;
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const response = await streamingAPI.getStreamUrl(state.currentSong._id);
        
        if (response.success && response.data.streamUrl) {
          dispatch({ type: 'SET_STREAM_URL', payload: response.data.streamUrl });
        } else {
          throw new Error('No stream URL returned');
        }
        
      } catch (error) {
        console.error('Error getting stream URL:', error);
        message.error('Failed to load audio stream');
        dispatch({ type: 'SET_LOADING', payload: false });
      } finally {
        loadingRef.current = false;
      }
    };

    loadStreamUrl();
  }, [state.currentSong?._id]); // Only depend on song ID

  // Handle audio source changes when stream URL is available - FIXED: Better dependency management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.streamUrl) return;

    // Only update if the source is different
    if (audio.src !== state.streamUrl) {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Set audio properties for better streaming
      audio.crossOrigin = 'anonymous';
      audio.preload = 'metadata';
      
      // Set the Cloudinary URL directly
      audio.src = state.streamUrl;
      
      console.log('Loading audio from Cloudinary:', state.streamUrl);
    }
    
  }, [state.streamUrl]);

  // Handle play/pause state changes - FIXED: Better state management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.streamUrl) return;

    if (state.isPlaying) {
      const playAudio = async () => {
        try {
          await audio.play();
        } catch (error) {
          console.error('Error playing audio:', error);
          if (error.name !== 'AbortError') {
            dispatch({ type: 'PAUSE' });
            message.error('Failed to play audio. Please check your connection.');
          }
        }
      };

      if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
        playAudio();
      } else {
        // Wait for audio to be ready
        const handleCanPlay = () => {
          playAudio();
          audio.removeEventListener('canplay', handleCanPlay);
        };
        audio.addEventListener('canplay', handleCanPlay);
        
        // Cleanup listener
        return () => audio.removeEventListener('canplay', handleCanPlay);
      }
    } else {
      audio.pause();
    }
  }, [state.isPlaying, state.streamUrl]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = state.volume;
    }
  }, [state.volume]);

  const playSong = async (song, playlist = null, index = 0) => {
    try {
      // Reset loading ref
      loadingRef.current = false;
      
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
      }, 500); // Increased delay
      
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
      setTimeout(() => dispatch({ type: 'PLAY' }), 500);
    }
  };

  const previousSong = () => {
    if (state.playlist.length > 1) {
      dispatch({ type: 'PREVIOUS_SONG' });
      setTimeout(() => dispatch({ type: 'PLAY' }), 500);
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
      await streamingAPI.reportCompletion(state.currentSong._id, {
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