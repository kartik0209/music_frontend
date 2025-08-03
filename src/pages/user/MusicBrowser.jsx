import { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Pagination, Typography, Avatar, Tag, Empty } from 'antd';
import { PlayCircleOutlined, HeartOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import './MusicBrowser.scss';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const MusicBrowser = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchSongs();
  }, [pagination.current, filters]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      const response = await api.get('/songs', { params });
      setSongs(response.data.data.songs);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePlay = async (songId) => {
    try {
      await api.post(`/songs/${songId}/play`);
      // Update local state to reflect play
      setSongs(prev => prev.map(song => 
        song._id === songId 
          ? { ...song, playCount: song.playCount + 1 }
          : song
      ));
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="music-browser-container fade-in">
      <div className="browser-header">
        <Title level={2}>🎵 Browse Music</Title>
        <Text className="browser-subtitle">
          Discover and play your favorite songs
        </Text>
      </div>

      {/* Search and Filters */}
      <Card className="filter-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Search songs, artists..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
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

      {/* Songs Grid */}
      <Row gutter={[16, 16]}>
        {loading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card loading className="song-card" />
            </Col>
          ))
        ) : songs.length > 0 ? (
          songs.map((song) => (
            <Col xs={24} sm={12} md={8} lg={6} key={song._id}>
              <Card
                className="song-card"
                cover={
                  <div className="song-cover">
                    <img
                      alt={song.title}
                      src={song.coverImage?.path || '/default-cover.jpg'}
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
                        onClick={() => handlePlay(song._id)}
                        className="play-btn"
                      />
                    </div>
                  </div>
                }
                actions={[
                  <Button
                    type="text"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handlePlay(song._id)}
                  >
                    Play
                  </Button>,
                  <Button
                    type="text"
                    icon={<HeartOutlined />}
                  >
                    Like
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div className="song-title">
                      {song.title}
                      {song.featured && <Tag color="gold">Featured</Tag>}
                    </div>
                  }
                  description={
                    <div className="song-details">
                      <Text strong className="artist">{song.artist}</Text>
                      {song.album && (
                        <Text type="secondary" className="album">
                          • {song.album.name}
                        </Text>
                      )}
                      <div className="song-meta">
                        <Text type="secondary">
                          {formatDuration(song.duration)}
                        </Text>
                        <Text type="secondary">
                          • {song.playCount} plays
                        </Text>
                      </div>
                      <div className="song-tags">
                        {song.genre?.map(g => (
                          <Tag key={g} color="blue" size="small">{g}</Tag>
                        ))}
                        {song.language && (
                          <Tag color="green" size="small">{song.language}</Tag>
                        )}
                      </div>
                      <div className="uploader-info">
                        <Avatar 
                          size="small" 
                          src={song.uploadedBy?.profile?.avatar}
                          icon={<PlayCircleOutlined />}
                        />
                        <Text type="secondary" className="uploader-name">
                          {song.uploadedBy?.username}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty
              description="No songs found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Col>
        )}
      </Row>

      {/* Pagination */}
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