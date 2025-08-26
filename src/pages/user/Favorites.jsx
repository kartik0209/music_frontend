import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Empty, Button, List, Avatar, Tag, message } from 'antd';
import { HeartOutlined, PlayCircleOutlined, HeartFilled, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMusicPlayer } from '../../contexts/MusicContext';
import api from '../../utils/api';
import './Favorites.scss';

const { Title, Text } = Typography;

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong, addToQueue } = useMusicPlayer();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/users/favorites');
      setFavorites(response.data.data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      message.error('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

const handleRemoveFavorite = async (songId) => {
    try {
      await api.delete(`/users/favorites/${songId}`);
      // Fix: Filter by fav.song._id since songId is the song's ID
      setFavorites(prev => prev.filter(fav => fav.song._id !== songId));
      message.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      message.error('Failed to remove from favorites');
    }
};

  const handlePlay = async (song) => {
    try {
      const songsList = favorites.map(fav => fav.song);
      const index = songsList.findIndex(s => s._id === song._id);
      await playSong(song, songsList, index);
    } catch (error) {
      console.error('Error playing song:', error);
      message.error('Failed to play song');
    }
  };

  const handlePlayAll = async () => {
    if (favorites.length === 0) return;
    
    try {
      const songsList = favorites.map(fav => fav.song);
      await playSong(songsList[0], songsList, 0);
    } catch (error) {
      console.error('Error playing all favorites:', error);
      message.error('Failed to play favorites');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="favorites-container fade-in">
      <div className="favorites-header">
        <div className="header-info">
          <Title level={2}>❤️ My Favorites</Title>
          <Text className="favorites-subtitle">
            Your liked songs collection ({favorites.length} songs)
          </Text>
        </div>
        {favorites.length > 0 && (
          <div className="header-actions">
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />}
              size="large"
              onClick={handlePlayAll}
            >
              Play All
            </Button>
          </div>
        )}
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          {loading ? (
            <Card loading />
          ) : favorites.length > 0 ? (
            <Card className="favorites-list-card">
              <List
                dataSource={favorites}
                loading={loading}
                renderItem={(favorite, index) => (
                  <List.Item
                    className="favorite-item"
                    actions={[
                      <Button
                        type="text"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handlePlay(favorite.song)}
                      >
                        Play
                      </Button>,
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => addToQueue(favorite.song)}
                      >
                        Queue
                      </Button>,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveFavorite(favorite.song._id)}
                      >
                        Remove
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="song-avatar">
                          <Avatar
                            src={favorite.song.coverUrl}
                            shape="square"
                            size={60}
                            icon={<PlayCircleOutlined />}
                          />
                          <div className="play-overlay" onClick={() => handlePlay(favorite.song)}>
                            <PlayCircleOutlined />
                          </div>
                        </div>
                      }
                      title={
                        <div className="song-info">
                          <Text strong className="song-title">{favorite.song.title}</Text>
                          <div className="song-meta">
                            <Text className="artist">{favorite.song.artist}</Text>
                            {favorite.song.album && (
                              <Text type="secondary"> • {favorite.song.album}</Text>
                            )}
                            <Text type="secondary"> • {formatDuration(favorite.song.duration)}</Text>
                            <Text type="secondary"> • {favorite.song.playCount || 0} plays</Text>
                            {favorite.song.ratings?.average > 0 && (
                              <Text type="secondary"> • ⭐ {favorite.song.ratings.average.toFixed(1)}</Text>
                            )}
                          </div>
                        </div>
                      }
                      description={
                        <div className="song-details">
                          <div className="song-tags">
                            {favorite.song.genre?.map(g => (
                              <Tag key={g} color="blue" size="small">{g}</Tag>
                            ))}
                            {favorite.song.language && (
                              <Tag color="green" size="small">{favorite.song.language}</Tag>
                            )}
                          </div>
                          <div className="favorite-info">
                            <HeartFilled style={{ color: '#ef4444' }} />
                            <Text type="secondary" className="added-date">
                              Added {new Date(favorite.addedAt).toLocaleDateString()}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                    <div className="track-number">
                      <Text type="secondary">#{index + 1}</Text>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          ) : (
            <Card>
              <Empty
                image={<HeartOutlined style={{ fontSize: 64, color: '#d1d5db' }} />}
                description={
                  <div>
                    <Text>No favorite songs yet</Text>
                    <br />
                    <Text type="secondary">Like songs to add them to your favorites</Text>
                  </div>
                }
              >
                <Button type="primary" onClick={() => window.location.href = '/music'}>
                  Browse Music
                </Button>
              </Empty>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Favorites;