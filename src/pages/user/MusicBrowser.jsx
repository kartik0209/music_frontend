import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Row, Col, Input, Select, Button, Pagination, Typography, Avatar, Tag, Empty, message } from 'antd';
import { PlayCircleOutlined, HeartOutlined, HeartFilled, SearchOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { useMusicPlayer } from '../../contexts/MusicContext';
import { songsAPI, usersAPI } from '../../utils/api';
import './MusicBrowser.scss';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const MusicBrowser = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 20
  });
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    language: '',
    mood: '',
    sortBy: 'playCount',
    sortOrder: 'desc'
  });

  const { playSong, addToQueue } = useMusicPlayer();

  // Memoize the fetch functions to prevent unnecessary re-renders
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      const response = await songsAPI.getSongs(params);
      
      // Handle different response structures
      if (response.success && response.data) {
        setSongs(response.data.songs || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || response.data.total || 0
        }));
      } else {
        setSongs([]);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      message.error('Failed to fetch songs');
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await usersAPI.getFavorites();
      if (response.success && response.data) {
        // Handle different favorite response structures
        if (Array.isArray(response.data.favorites)) {
          setFavorites(response.data.favorites.map(fav => 
            typeof fav === 'string' ? fav : fav.song?._id || fav._id
          ));
        } else if (Array.isArray(response.data)) {
          setFavorites(response.data.map(fav => 
            typeof fav === 'string' ? fav : fav.song?._id || fav._id
          ));
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    }
  }, []);

  // Use useEffect with proper dependencies
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Debounce search to prevent too many API calls
  const debouncedSearch = useMemo(() => {
    let timeout;
    return (value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
      }, 500);
    };
  }, []);

  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePlay = async (song) => {
    try {
      await playSong(song, songs, songs.findIndex(s => s._id === song._id));
      
      // Update local play count immediately for better UX
      setSongs(prev => prev.map(s => 
        s._id === song._id 
          ? { ...s, playCount: (s.playCount || 0) + 1 }
          : s
      ));
      
      // Increment play count on server in background
      songsAPI.playSong(song._id).catch(error => {
        console.error('Error incrementing play count:', error);
        // Revert local change if server update fails
        setSongs(prev => prev.map(s => 
          s._id === song._id 
            ? { ...s, playCount: Math.max(0, (s.playCount || 0) - 1) }
            : s
        ));
      });
    } catch (error) {
      console.error('Error playing song:', error);
      message.error('Failed to play song');
    }
  };

  const handleToggleFavorite = async (songId) => {
    try {
      const isFavorite = favorites.includes(songId);
      
      // Optimistic update
      if (isFavorite) {
        setFavorites(prev => prev.filter(id => id !== songId));
      } else {
        setFavorites(prev => [...prev, songId]);
      }

      // Server update
      if (isFavorite) {
        await usersAPI.removeFromFavorites(songId);
        message.success('Removed from favorites');
      } else {
        await usersAPI.addToFavorites(songId);
        message.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Revert optimistic update on error
      const isFavorite = favorites.includes(songId);
      if (!isFavorite) {
        setFavorites(prev => prev.filter(id => id !== songId));
      } else {
        setFavorites(prev => [...prev, songId]);
      }

      // Handle 404 gracefully (favorites endpoint doesn't exist)
      if (error.response?.status === 404) {
        message.info('Favorites feature not fully implemented');
      } else {
        message.error('Failed to update favorites');
      }
    }
  };

  const handleAddToQueue = (song) => {
    addToQueue(song);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to safely get string value
  const getStringValue = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      if (value.name) return value.name;
      if (value.toString) return value.toString();
      return JSON.stringify(value);
    }
    return String(value || '');
  };

  // Helper function to get cover image URL
  const getCoverImageUrl = (song) => {
    if (song.coverImage?.secureUrl) return song.coverImage.secureUrl;
    if (song.coverImage?.url) return song.coverImage.url;
    if (song.coverUrl) return song.coverUrl;
    return '/default-cover.jpg';
  };

  return (
    <div className="music-browser-container fade-in">
      <div className="browser-header">
        <Title level={2}>🎵 Browse Music</Title>
        <Text className="browser-subtitle">
          Discover and play your favorite songs
        </Text>
      </div>

      <Card className="filter-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Search songs, artists..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) {
                  handleSearch('');
                }
              }}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Genre"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('genre', value)}
            >
              <Option value="pop">Pop</Option>
              <Option value="rock">Rock</Option>
              <Option value="jazz">Jazz</Option>
              <Option value="classical">Classical</Option>
              <Option value="electronic">Electronic</Option>
              <Option value="hip-hop">Hip Hop</Option>
              <Option value="country">Country</Option>
              <Option value="folk">Folk</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Language"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('language', value)}
            >
              <Option value="english">English</Option>
              <Option value="hindi">Hindi</Option>
              <Option value="spanish">Spanish</Option>
              <Option value="french">French</Option>
              <Option value="german">German</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Sort by"
              size="large"
              style={{ width: '100%' }}
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
            >
              <Option value="playCount">Most Played</Option>
              <Option value="createdAt">Latest</Option>
              <Option value="title">Title A-Z</Option>
              <Option value="artist">Artist A-Z</Option>
              <Option value="ratings.average">Highest Rated</Option>
            </Select>
          </Col>

           <Col xs={12} md={4}>
    <Select
      placeholder="Mood"
      allowClear
      size="large"
      style={{ width: '100%' }}
      onChange={(value) => handleFilterChange('mood', value)}
    >
      <Option value="happy">Happy</Option>
      <Option value="sad">Sad</Option>
      <Option value="energetic">Energetic</Option>
      <Option value="calm">Calm</Option>
      <Option value="romantic">Romantic</Option>
      <Option value="uplifting">Uplifting</Option>
    </Select>
  </Col>
          <Col xs={12} md={4}>
            <Button 
              icon={<FilterOutlined />} 
              size="large"
              onClick={() => {
                setFilters({
                  search: '',
                  genre: '',
                  language: '',
                  mood: '',
                  sortBy: 'playCount',
                  sortOrder: 'desc'
                });
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card loading className="song-card" />
            </Col>
          ))
        ) : songs.length > 0 ? (
          songs.map((song) => {
            const songTitle = getStringValue(song.title);
            const artistName = getStringValue(song.artist);
            const albumName = getStringValue(song.album?.name || song.album);
            const coverImageUrl = getCoverImageUrl(song);
            
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={song._id}>
                <Card
                  className="song-card"
                  cover={
                    <div className="song-cover">
                      <img
                        alt={songTitle}
                        src={coverImageUrl}
                        onError={(e) => {
                          e.target.src = '/default-cover.jpg';
                        }}
                      />
                      <div className="play-overlay">
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<PlayCircleOutlined />}
                          size="large"
                          onClick={() => handlePlay(song)}
                          className="play-btn"
                        />
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="play"
                      type="text"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handlePlay(song)}
                    >
                      Play
                    </Button>,
                    <Button
                      key="favorite"
                      type="text"
                      icon={favorites.includes(song._id) ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined />}
                      onClick={() => handleToggleFavorite(song._id)}
                    >
                      {favorites.includes(song._id) ? 'Liked' : 'Like'}
                    </Button>,
                    <Button
                      key="queue"
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddToQueue(song)}
                    >
                      Queue
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="song-title">
                        <Text ellipsis={{ tooltip: songTitle }}>
                          {songTitle}
                        </Text>
                        {song.featured && <Tag color="gold">Featured</Tag>}
                      </div>
                    }
                    description={
                      <div className="song-details">
                        <Text strong className="artist">{artistName}</Text>
                        {albumName && (
                          <Text type="secondary" className="album">
                            • {albumName}
                          </Text>
                        )}
                        <div className="song-meta">
                          <Text type="secondary">
                            {formatDuration(song.duration)}
                          </Text>
                          <Text type="secondary">
                            • {song.playCount || 0} plays
                          </Text>
                          {song.ratings?.average > 0 && (
                            <Text type="secondary">
                              • ⭐ {song.ratings.average.toFixed(1)}
                            </Text>
                          )}
                        </div>
                        <div className="song-tags">
                          {Array.isArray(song.genre) && song.genre.map((g, index) => (
                            <Tag key={index} color="blue" size="small">
                              {getStringValue(g)}
                            </Tag>
                          ))}
                          {!Array.isArray(song.genre) && song.genre && (
                            <Tag color="blue" size="small">
                              {getStringValue(song.genre)}
                            </Tag>
                          )}
                          {(song.language || song.songLanguage) && (
                            <Tag color="green" size="small">
                              {getStringValue(song.language || song.songLanguage)}
                            </Tag>
                          )}
                        </div>
                        <div className="uploader-info">
                          <Avatar 
                            size="small" 
                            src={song.uploadedBy?.profile?.avatar}
                            icon={<PlayCircleOutlined />}
                          />
                          <Text type="secondary" className="uploader-name">
                            {getStringValue(song.uploadedBy?.username || 'Unknown')}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            );
          })
        ) : (
          <Col span={24}>
            <Empty
              description="No songs found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Col>
        )}
      </Row>

      {songs.length > 0 && (
        <div className="pagination-container">
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} songs`
            }
            onChange={(page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize
              }));
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MusicBrowser;