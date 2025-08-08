import { useState, useEffect } from 'react';
import { Card, Button, Slider, Typography, Avatar, Drawer, List, Tag } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundOutlined,
  RetweetOutlined,

  UnorderedListOutlined,
  HeartOutlined,
  HeartFilled,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import { useMusicPlayer } from '../contexts/MusicContext';
import api from '../utils/api';
import './MusicPlayer.scss';

const { Text } = Typography;

const MusicPlayer = () => {
  const {
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading,
    shuffle,
    repeat,
    showPlayer,
    togglePlay,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat
  } = useMusicPlayer();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (currentSong) {
      checkIfFavorite();
    }
  }, [currentSong]);

  const checkIfFavorite = async () => {
    if (!currentSong) return;
    
    try {
      const response = await api.get('/user/favorites');
      const favorites = response.data.data.favorites;
      setIsFavorite(favorites.some(fav => fav.song._id === currentSong._id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!currentSong) return;
    
    try {
      if (isFavorite) {
        await api.delete(`/user/favorites/${currentSong._id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/user/favorites/${currentSong._id}`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    switch (repeat) {
      case 'one':
        return <RetweetOutlined style={{ color: '#6366f1' }} />;
      case 'all':
        return <RetweetOutlined style={{ color: '#6366f1' }} />;
      default:
        return <RetweetOutlined />;
    }
  };

  if (!showPlayer || !currentSong) return null;

  return (
    <>
      <Card 
        className={`music-player ${isMinimized ? 'minimized' : ''}`}
        bodyStyle={{ padding: isMinimized ? '8px 16px' : '16px' }}
      >
        {!isMinimized ? (
          <div className="player-full">
            <div className="player-info">
              <Avatar
                size={60}
                src={currentSong.coverUrl}
                shape="square"
                className="song-cover"
              />
              <div className="song-details">
                <Text strong className="song-title">{currentSong.title}</Text>
                <Text type="secondary" className="song-artist">{currentSong.artist}</Text>
                <div className="song-tags">
                  {currentSong.genre?.map(g => (
                    <Tag key={g} size="small" color="blue">{g}</Tag>
                  ))}
                </div>
              </div>
              <div className="player-actions">
                <Button
                  type="text"
                  icon={isFavorite ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />}
                  onClick={toggleFavorite}
                />
                <Button
                  type="text"
                  icon={<DownOutlined />}
                  onClick={() => setIsMinimized(true)}
                />
              </div>
            </div>

            <div className="player-controls">
              <div className="control-buttons">
                <Button
                  type="text"
                
                  onClick={toggleShuffle}
                  className={shuffle ? 'active' : ''}
                />
                <Button
                  type="text"
                  icon={<StepBackwardOutlined />}
                  onClick={previousSong}
                  disabled={playlist.length <= 1}
                />
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={togglePlay}
                  loading={isLoading}
                  className="play-button"
                />
                <Button
                  type="text"
                  icon={<StepForwardOutlined />}
                  onClick={nextSong}
                  disabled={playlist.length <= 1}
                />
                <Button
                  type="text"
                  icon={getRepeatIcon()}
                  onClick={toggleRepeat}
                  className={repeat !== 'none' ? 'active' : ''}
                />
              </div>

              <div className="progress-section">
                <Text className="time-text">{formatTime(currentTime)}</Text>
                <Slider
                  value={currentTime}
                  max={duration || 100}
                  onChange={seekTo}
                  tooltip={{ formatter: formatTime }}
                  className="progress-slider"
                />
                <Text className="time-text">{formatTime(duration)}</Text>
              </div>
            </div>

            <div className="player-extras">
              <div className="volume-control">
                <SoundOutlined />
                <Slider
                  value={volume * 100}
                  onChange={(value) => setVolume(value / 100)}
                  className="volume-slider"
                />
              </div>
              <Button
                type="text"
                icon={<UnorderedListOutlined />}
                onClick={() => setShowQueue(true)}
                className="queue-button"
              >
                Queue ({playlist.length})
              </Button>
            </div>
          </div>
        ) : (
          <div className="player-minimized">
            <div className="mini-info">
              <Avatar
                size={40}
                src={currentSong.coverUrl}
                shape="square"
              />
              <div className="mini-details">
                <Text strong className="mini-title">{currentSong.title}</Text>
                <Text type="secondary" className="mini-artist">{currentSong.artist}</Text>
              </div>
            </div>
            <div className="mini-controls">
              <Button
                type="text"
                icon={<StepBackwardOutlined />}
                onClick={previousSong}
                size="small"
              />
              <Button
                type="primary"
                shape="circle"
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={togglePlay}
                loading={isLoading}
              />
              <Button
                type="text"
                icon={<StepForwardOutlined />}
                onClick={nextSong}
                size="small"
              />
              <Button
                type="text"
                icon={<UpOutlined />}
                onClick={() => setIsMinimized(false)}
                size="small"
              />
            </div>
          </div>
        )}
      </Card>

      <Drawer
        title="Queue"
        placement="right"
        onClose={() => setShowQueue(false)}
        open={showQueue}
        width={400}
      >
        <List
          dataSource={playlist}
          renderItem={(song, index) => (
            <List.Item className={index === currentIndex ? 'current-song' : ''}>
              <List.Item.Meta
                avatar={<Avatar src={song.coverUrl} shape="square" />}
                title={song.title}
                description={song.artist}
              />
              {index === currentIndex && (
                <SoundOutlined style={{ color: '#6366f1' }} />
              )}
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
};

export default MusicPlayer;