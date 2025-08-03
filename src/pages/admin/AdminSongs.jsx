import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Avatar, 
  Typography, 
  Popconfirm, 
  message,
  Switch,
  Modal,
  Image
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import api from '../../utils/api';
import './AdminSongs.scss';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const AdminSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    language: '',
    status: ''
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewSong, setPreviewSong] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSongs();
  }, [pagination.current, pagination.pageSize, filters]);

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
      message.error('Failed to fetch songs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (songId) => {
    try {
      await api.delete(`/songs/${songId}`);
      message.success('Song deleted successfully');
      fetchSongs();
    } catch (error) {
      console.error('Error deleting song:', error);
      message.error('Failed to delete song');
    }
  };

  const handleToggleFeatured = async (songId, featured) => {
    try {
      await api.put(`/songs/${songId}/featured`);
      message.success(`Song ${featured ? 'unfeatured' : 'featured'} successfully`);
      fetchSongs();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      message.error('Failed to update featured status');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedRowKeys.map(id => api.delete(`/songs/${id}`))
      );
      message.success(`${selectedRowKeys.length} songs deleted successfully`);
      setSelectedRowKeys([]);
      fetchSongs();
    } catch (error) {
      console.error('Error bulk deleting songs:', error);
      message.error('Failed to delete songs');
    }
  };

  const handlePreview = (song) => {
    setPreviewSong(song);
    setPreviewVisible(true);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'Cover',
      dataIndex: 'coverImage',
      key: 'cover',
      width: 80,
      render: (coverImage, record) => (
        <Avatar
          shape="square"
          size={50}
          src={coverImage?.path || '/default-cover.jpg'}
          icon={<PlayCircleOutlined />}
          style={{ cursor: 'pointer' }}
          onClick={() => handlePreview(record)}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          {record.featured && (
            <StarFilled style={{ color: '#faad14', marginLeft: 8 }} />
          )}
        </div>
      ),
    },
    {
      title: 'Artist',
      dataIndex: 'artist',
      key: 'artist',
      sorter: true,
    },
    {
      title: 'Album',
      dataIndex: 'album',
      key: 'album',
      render: (album) => album?.name || '-',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => formatDuration(duration),
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
      render: (genres) => (
        <div>
          {genres?.map(genre => (
            <Tag key={genre} color="blue" size="small">
              {genre}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      render: (language) => (
        <Tag color="green" size="small">{language}</Tag>
      ),
    },
    {
      title: 'Plays',
      dataIndex: 'playCount',
      key: 'playCount',
      sorter: true,
      render: (count) => count?.toLocaleString() || 0,
    },
    {
      title: 'Featured',
      dataIndex: 'featured',
      key: 'featured',
      render: (featured, record) => (
        <Switch
          checked={featured}
          onChange={() => handleToggleFeatured(record._id, featured)}
          checkedChildren={<StarOutlined />}
          unCheckedChildren={<StarOutlined />}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      render: (uploader) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" src={uploader?.profile?.avatar} />
          <Text>{uploader?.username}</Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handlePreview(record)}
            title="Preview"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin/songs/edit/${record._id}`)}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure you want to delete this song?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="admin-songs-container fade-in">
      <div className="songs-header">
        <div>
          <Title level={2}>🎵 Manage Songs</Title>
          <Text className="songs-subtitle">
            Manage your music library
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/admin/songs/add')}
        >
          Add New Song
        </Button>
      </div>

      {/* Filters */}
      <Card className="filter-card">
        <div className="filters-row">
          <Search
            placeholder="Search songs, artists..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: 300 }}
            onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
          />
          
          <Select
            placeholder="Genre"
            allowClear
            size="large"
            style={{ width: 150 }}
            onChange={(value) => setFilters(prev => ({ ...prev, genre: value }))}
          >
            <Option value="pop">Pop</Option>
            <Option value="rock">Rock</Option>
            <Option value="jazz">Jazz</Option>
            <Option value="classical">Classical</Option>
            <Option value="electronic">Electronic</Option>
          </Select>

          <Select
            placeholder="Language"
            allowClear
            size="large"
            style={{ width: 150 }}
            onChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
          >
            <Option value="english">English</Option>
            <Option value="hindi">Hindi</Option>
            <Option value="spanish">Spanish</Option>
            <Option value="french">French</Option>
          </Select>

          <Select
            placeholder="Status"
            allowClear
            size="large"
            style={{ width: 150 }}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>

          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`Are you sure you want to delete ${selectedRowKeys.length} songs?`}
              onConfirm={handleBulkDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete Selected ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
        </div>
      </Card>

      {/* Songs Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={songs}
          rowKey="_id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} songs`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize
              }));
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Preview Modal */}
      <Modal
        title="Song Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            setPreviewVisible(false);
            navigate(`/admin/songs/edit/${previewSong._id}`);
          }}>
            Edit Song
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {previewSong && (
          <div className="song-preview">
            <div className="preview-cover">
              <Image
                src={previewSong.coverImage?.path || '/default-cover.jpg'}
                alt={previewSong.title}
                width={200}
                height={200}
                style={{ objectFit: 'cover', borderRadius: 8 }}
              />
            </div>
            <div className="preview-details">
              <Title level={4}>{previewSong.title}</Title>
              <Text strong>Artist: </Text><Text>{previewSong.artist}</Text><br />
              {previewSong.album && (
                <>
                  <Text strong>Album: </Text><Text>{previewSong.album.name}</Text><br />
                </>
              )}
              <Text strong>Duration: </Text><Text>{formatDuration(previewSong.duration)}</Text><br />
              <Text strong>Language: </Text><Text>{previewSong.language}</Text><br />
              <Text strong>Play Count: </Text><Text>{previewSong.playCount?.toLocaleString() || 0}</Text><br />
              
              <div style={{ marginTop: 16 }}>
                <Text strong>Genres: </Text>
                {previewSong.genre?.map(genre => (
                  <Tag key={genre} color="blue">{genre}</Tag>
                ))}
              </div>
              
              {previewSong.mood && (
                <div style={{ marginTop: 8 }}>
                  <Text strong>Moods: </Text>
                  {previewSong.mood.map(mood => (
                    <Tag key={mood} color="purple">{mood}</Tag>
                  ))}
                </div>
              )}
              
              <div style={{ marginTop: 16 }}>
                <Text strong>Uploaded by: </Text>
                <Avatar size="small" src={previewSong.uploadedBy?.profile?.avatar} />
                <Text style={{ marginLeft: 8 }}>{previewSong.uploadedBy?.username}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSongs;