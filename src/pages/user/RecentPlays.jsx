import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Empty, List, Avatar, Tag, Button, message } from 'antd';
import { ClockCircleOutlined, PlayCircleOutlined, PlusOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useMusicPlayer } from '../../contexts/MusicContext';
import api from '../../utils/api';
import './RecentPlays.scss';

const { Title, Text } = Typography;

const RecentPlays = () => {
  const [recentPlays, setRecentPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const { playSong, addToQueue } = useMusicPlayer();

  useEffect(() => {
    fetchRecentPlays();
    fetchFavorites();
  }, []);

  const fetchRecentPlays = async () => {
    try {
      const response = await api.get('/users/history');
      setRecentPlays(response.data.data.history);
    } catch (error) {
      console.error('Error fetching recent plays:', error);
      message.error('Failed to fetch recent plays');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/users/favorites');
      setFavorites(response.data.data.favorites.map(fav => fav.song._id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handlePlay = async (song) => {
    try {
      const songsList = recentPlays.map(play => play.song);
      const index = songsList.findIndex(s => s._id === song._id);
      await playSong(song, songsList, index);
    } catch (error) {
      console.error('Error playing song:', error);
      message.error('Failed to play song');
    }
  };

  const handleToggleFavorite = async (songId) => {
    try {
      const isFavorite = favorites.includes(songId);
      
      if (isFavorite) {
        await api.delete(`/users/favorites/${songId}`);
        setFavorites(prev => prev.filter(id => id !== songId));
        message.success('Removed from favorites');
      } else {
        await api.post(`/users/favorites/${songId}`);
        setFavorites(prev => [...prev, songId]);
        message.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Failed to update favorites');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const playDate = new Date(date);
    const diffInSeconds = Math.floor((now - playDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return playDate.toLocaleDateString();
  };

  const getCompletionStatus = (play) => {
    if (play.completed) return { text: 'Completed', color: 'success' };
    if (play.duration > 30) return { text: 'Partial', color: 'warning' };
    return { text: 'Skipped', color: 'default' };
  };

  const groupPlaysByDate = (plays) => {
    const groups = {};
    plays.forEach(play => {
      const date = new Date(play.playedAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(play);
    });
    return groups;
  };

  const playGroups = groupPlaysByDate(recentPlays);

  return (
    <div className="recent-plays-container fade-in">
      <div className="recent-header">
        <div className="header-info">
          <Title level={2}>🕒 Recent Plays</Title>
          <Text className="recent-subtitle">
            Your recently played songs ({recentPlays.length} plays)
          </Text>
        </div>
        {recentPlays.length > 0 && (
          <div className="header-actions">
            <Button
              onClick={() => {
                if (recentPlays.length > 0) {
                  const songsList = recentPlays.map(play => play.song);
                  playSong(songsList[0], songsList, 0);
                }
              }}
              type="primary"
              icon={<PlayCircleOutlined />}
            >
              Play Recent
            </Button>
          </div>
        )}
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          {loading ? (
            <Card loading />
          ) : recentPlays.length > 0 ? (
            <Card className="recent-plays-card">
              {Object.entries(playGroups).map(([date, plays]) => (
                <div key={date} className="date-group">
                  <div className="date-header">
                    <Text strong className="date-title">
                      {date === new Date().toDateString() ? 'Today' : 
                       date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : 
                       new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                    <Text type="secondary" className="play-count">
                      {plays.length} plays
                    </Text>
                  </div>
                  
                  <List
                    dataSource={plays}
                    renderItem={(play, index) => {
                      const status = getCompletionStatus(play);
                      return (
                        <List.Item
                          className="recent-play-item"
                          actions={[
                            <Button
                              type="text"
                              icon={<PlayCircleOutlined />}
                              onClick={() => handlePlay(play.song)}
                            >
                              Play
                            </Button>,
                            <Button
                              type="text"
                              icon={favorites.includes(play.song._id) ? 
                                <HeartFilled style={{ color: '#ef4444' }} /> : 
                                <HeartOutlined />
                              }
                              onClick={() => handleToggleFavorite(play.song._id)}
                            >
                              {favorites.includes(play.song._id) ? 'Liked' : 'Like'}
                            </Button>,
                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={() => addToQueue(play.song)}
                            >
                              Queue
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className="song-avatar">
                                <Avatar
                                  src={play.song.coverUrl}
                                  shape="square"
                                  size={60}
                                  icon={<PlayCircleOutlined />}
                                />
                                <div className="play-overlay" onClick={() => handlePlay(play.song)}>
                                  <PlayCircleOutlined />
                                </div>
                              </div>
                            }
                            title={
                              <div className="song-info">
                                <Text strong className="song-title">{play.song.title}</Text>
                                <div className="song-meta">
                                  <Text className="artist">{play.song.artist}</Text>
                                  {play.song.album && (
                                    <Text type="secondary"> • {play.song.album}</Text>
                                  )}
                                  <Text type="secondary"> • {formatDuration(play.song.duration)}</Text>
                                  {play.song.ratings?.average > 0 && (
                                    <Text type="secondary"> • ⭐ {play.song.ratings.average.toFixed(1)}</Text>
                                  )}
                                </div>
                              </div>
                            }
                            description={
                              <div className="play-details">
                                <div className="song-tags">
                                  {play.song.genre?.map(g => (
                                    <Tag key={g} color="blue" size="small">{g}</Tag>
                                  ))}
                                  {play.song.language && (
                                    <Tag color="green" size="small">{play.song.language}</Tag>
                                  )}
                                </div>
                                <div className="play-info">
                                  <Tag color={status.color} className="completion-tag">
                                    {status.text}
                                  </Tag>
                                  <Text type="secondary" className="play-time">
                                    Played {getTimeAgo(play.playedAt)}
                                  </Text>
                                  {play.duration && (
                                    <Text type="secondary">
                                      • Listened {formatDuration(play.duration)}
                                    </Text>
                                  )}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                </div>
              ))}
            </Card>
          ) : (
            <Card>
              <Empty
                image={<ClockCircleOutlined style={{ fontSize: 64, color: '#d1d5db' }} />}
                description={
                  <div>
                    <Text>No recent plays</Text>
                    <br />
                    <Text type="secondary">Start listening to music to see your history here</Text>
                  </div>
                }
              >
                <Button type="primary" onClick={() => window.location.href = '/music'}>
                  Start Listening
                </Button>
              </Empty>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default RecentPlays;