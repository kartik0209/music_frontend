import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, List, Avatar, Tag, Empty, Statistic } from 'antd';
import { 
  PlayCircleOutlined, 
  HeartOutlined, 
  UnorderedListOutlined, 
  ClockCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  SoundOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useMusicPlayer } from '../contexts/MusicContext';
import api from '../utils/api';
import './Dashboard.scss';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const { playSong } = useMusicPlayer();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentPlays, setRecentPlays] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        statsRes,
        recentRes,
        favoritesRes,
        playlistsRes,
        topSongsRes,
        featuredRes
      ] = await Promise.all([
        api.get('/user/stats'),
        api.get('/user/history?limit=5'),
        api.get('/user/favorites?limit=5'),
        api.get('/playlists/user/me?limit=5'),
        api.get('/songs?sortBy=playCount&limit=5'),
        api.get('/playlists/featured?limit=5')
      ]);

      setStats(statsRes.data.data);
      setRecentPlays(recentRes.data.data.history || []);
      setFavorites(favoritesRes.data.data.favorites || []);
      setPlaylists(playlistsRes.data.data.playlists || []);
      setTopSongs(topSongsRes.data.data.songs || []);
      setFeaturedPlaylists(featuredRes.data.data.playlists || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePlaySong = async (song) => {
    try {
      await playSong(song);
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div className="welcome-section">
          <Title level={2} className="welcome-title">
            {getGreeting()}, {user?.profile?.firstName || user?.username}! 👋
          </Title>
          <Text className="welcome-subtitle">
            Ready to discover some amazing music today?
          </Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card listening-time">
            <Statistic
              title="Listening Time"
              value={Math.floor((stats.totalListeningTime || 0) / 3600)}
              suffix="hrs"
              prefix={<ClockCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title="🎵 Recent Plays" 
            className="dashboard-card"
            extra={
              <Button type="link" href="/recent">
                View All
              </Button>
            }
          >
            {recentPlays.length > 0 ? (
              <List
                dataSource={recentPlays}
                loading={loading}
                renderItem={(play) => (
                  <List.Item
                    className="recent-play-item"
                    actions={[
                      <Button
                        type="text"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handlePlaySong(play.song)}
                      >
                        Play
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={play.song.coverUrl}
                          shape="square"
                          size={50}
                          icon={<SoundOutlined />}
                        />
                      }
                      title={play.song.title}
                      description={
                        <div>
                          <Text type="secondary">{play.song.artist}</Text>
                          <br />
                          <Text type="secondary" className="play-time">
                            {new Date(play.playedAt).toLocaleDateString()}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="No recent plays" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="❤️ Recent Favorites" 
            className="dashboard-card"
            extra={
              <Button type="link" href="/favorites">
                View All
              </Button>
            }
          >
            {favorites.length > 0 ? (
              <List
                dataSource={favorites}
                loading={loading}
                renderItem={(favorite) => (
                  <List.Item
                    className="favorite-item"
                    actions={[
                      <Button
                        type="text"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handlePlaySong(favorite.song)}
                      >
                        Play
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={favorite.song.coverUrl}
                          shape="square"
                          size={50}
                          icon={<SoundOutlined />}
                        />
                      }
                      title={favorite.song.title}
                      description={
                        <div>
                          <Text type="secondary">{favorite.song.artist}</Text>
                          <br />
                          <Text type="secondary" className="added-time">
                            Added {new Date(favorite.addedAt).toLocaleDateString()}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="No favorites yet" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title="🎧 My Playlists" 
            className="dashboard-card"
            extra={
              <Button type="link" href="/playlists">
                View All
              </Button>
            }
          >
            {playlists.length > 0 ? (
              <List
                dataSource={playlists}
                loading={loading}
                renderItem={(playlist) => (
                  <List.Item
                    className="playlist-item"
                    actions={[
                      <Button
                        type="text"
                        icon={<PlayCircleOutlined />}
                      >
                        Play
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={playlist.coverImage?.path}
                          shape="square"
                          size={50}
                          icon={<UnorderedListOutlined />}
                        />
                      }
                      title={playlist.name}
                      description={
                        <div>
                          <Text type="secondary">
                            {playlist.songCount || 0} songs
                          </Text>
                          <br />
                          <Tag size="small" color={playlist.privacy === 'public' ? 'green' : 'orange'}>
                            {playlist.privacy}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="No playlists yet" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '2rem 0' }}
              >
                <Button type="primary" icon={<PlusOutlined />} href="/playlists">
                  Create Playlist
                </Button>
              </Empty>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="🔥 Trending Songs" 
            className="dashboard-card"
            extra={
              <Button type="link" href="/music">
                Explore More
              </Button>
            }
          >
            {topSongs.length > 0 ? (
              <List
                dataSource={topSongs}
                loading={loading}
                renderItem={(song, index) => (
                  <List.Item
                    className="trending-song-item"
                    actions={[
                      <Button
                        type="text"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handlePlaySong(song)}
                      >
                        Play
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="trending-rank">
                          <span className="rank-number">#{index + 1}</span>
                          <Avatar
                            src={song.coverUrl}
                            shape="square"
                            size={50}
                            icon={<SoundOutlined />}
                          />
                        </div>
                      }
                      title={song.title}
                      description={
                        <div>
                          <Text type="secondary">{song.artist}</Text>
                          <br />
                          <div className="song-stats">
                            <Text type="secondary">
                              {song.playCount || 0} plays
                            </Text>
                            {song.ratings?.average > 0 && (
                              <Text type="secondary">
                                • ⭐ {song.ratings.average.toFixed(1)}
                              </Text>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="No trending songs" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card 
            title="✨ Featured Playlists" 
            className="dashboard-card"
            extra={
              <Button type="link" href="/music">
                Discover More
              </Button>
            }
          >
            {featuredPlaylists.length > 0 ? (
              <Row gutter={[16, 16]}>
                {featuredPlaylists.map((playlist) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={playlist._id}>
                    <Card
                      className="featured-playlist-card"
                      cover={
                        <div className="playlist-cover">
                          <img
                            alt={playlist.name}
                            src={playlist.coverImage?.path || '/default-playlist.jpg'}
                            onError={(e) => {
                              e.target.src = '/default-playlist.jpg';
                            }}
                          />
                          <div className="play-overlay">
                            <Button
                              type="primary"
                              shape="circle"
                              icon={<PlayCircleOutlined />}
                              size="large"
                              className="play-btn"
                            />
                          </div>
                        </div>
                      }
                    >
                      <Card.Meta
                        title={
                          <Text ellipsis={{ tooltip: playlist.name }}>
                            {playlist.name}
                          </Text>
                        }
                        description={
                          <div>
                            <Text type="secondary">
                              {playlist.songCount || 0} songs
                            </Text>
                            <br />
                            <Text type="secondary">
                              by {playlist.owner?.username}
                            </Text>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty 
                description="No featured playlists" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card className="quick-actions-card">
            <div className="quick-actions">
              <Title level={4}>Quick Actions</Title>
              <div className="action-buttons">
                <Button 
                  type="primary" 
                  icon={<SoundOutlined />} 
                  size="large"
                  href="/music"
                >
                  Browse Music
                </Button>
                <Button 
                  icon={<PlusOutlined />} 
                  size="large"
                  href="/playlists"
                >
                  Create Playlist
                </Button>
                <Button 
                  icon={<HeartOutlined />} 
                  size="large"
                  href="/favorites"
                >
                  My Favorites
                </Button>
                <Button 
                  icon={<ClockCircleOutlined />} 
                  size="large"
                  href="/recent"
                >
                  Recent Plays
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
         