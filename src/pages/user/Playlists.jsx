import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, Empty, Modal, Form, Input, Select, Upload, message, List, Avatar, Tag } from 'antd';
import { PlusOutlined, PlayCircleOutlined, UnorderedListOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useMusicPlayer } from '../../contexts/MusicContext';
import api from '../../utils/api';
import './Playlists.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { playSong } = useMusicPlayer();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await api.get('/playlists/user/me', {
        params: { includePrivate: true }
      });
      setPlaylists(response.data.data.playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      message.error('Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'coverImage' && values[key]?.file) {
          formData.append('coverImage', values[key].file);
        } else if (key === 'tags' && Array.isArray(values[key])) {
          formData.append('tags', JSON.stringify(values[key]));
        } else if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      const response = await api.post('/playlists', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPlaylists(prev => [response.data.data.playlist, ...prev]);
      setCreateModalVisible(false);
      form.resetFields();
      message.success('Playlist created successfully');
    } catch (error) {
      console.error('Error creating playlist:', error);
      message.error('Failed to create playlist');
    }
  };

  const handleEditPlaylist = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'coverImage' && values[key]?.file) {
          formData.append('coverImage', values[key].file);
        } else if (key === 'tags' && Array.isArray(values[key])) {
          formData.append('tags', JSON.stringify(values[key]));
        } else if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      const response = await api.put(`/playlists/${selectedPlaylist._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPlaylists(prev => prev.map(p => 
        p._id === selectedPlaylist._id ? response.data.data.playlist : p
      ));
      setEditModalVisible(false);
      setSelectedPlaylist(null);
      editForm.resetFields();
      message.success('Playlist updated successfully');
    } catch (error) {
      console.error('Error updating playlist:', error);
      message.error('Failed to update playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    Modal.confirm({
      title: 'Delete Playlist',
      content: 'Are you sure you want to delete this playlist? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/playlists/${playlistId}`);
          setPlaylists(prev => prev.filter(p => p._id !== playlistId));
          message.success('Playlist deleted successfully');
        } catch (error) {
          console.error('Error deleting playlist:', error);
          message.error('Failed to delete playlist');
        }
      }
    });
  };

  const handlePlayPlaylist = async (playlist) => {
    try {
      const response = await api.get(`/stream/playlist/${playlist._id}`);
      const songs = response.data.data.songs;
      
      if (songs.length > 0) {
        await playSong(songs[0], songs, 0);
      } else {
        message.info('This playlist is empty');
      }
    } catch (error) {
      console.error('Error playing playlist:', error);
      message.error('Failed to play playlist');
    }
  };

  const openEditModal = (playlist) => {
    setSelectedPlaylist(playlist);
    editForm.setFieldsValue({
      name: playlist.name,
      description: playlist.description,
      privacy: playlist.privacy,
      category: playlist.category,
      tags: playlist.tags
    });
    setEditModalVisible(true);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="playlists-container fade-in">
      <div className="playlists-header">
        <div className="header-info">
          <Title level={2}>🎧 My Playlists</Title>
          <Text className="playlists-subtitle">
            Create and manage your music playlists ({playlists.length} playlists)
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setCreateModalVisible(true)}
        >
          Create Playlist
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card loading className="playlist-card" />
            </Col>
          ))
        ) : playlists.length > 0 ? (
          playlists.map((playlist) => (
            <Col xs={24} sm={12} md={8} lg={6} key={playlist._id}>
              <Card
                className="playlist-card"
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
                        onClick={() => handlePlayPlaylist(playlist)}
                        className="play-btn"
                      />
                    </div>
                  </div>
                }
                actions={[
                  <Button
                    type="text"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handlePlayPlaylist(playlist)}
                  >
                    Play
                  </Button>,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(playlist)}
                  >
                    Edit
                  </Button>,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeletePlaylist(playlist._id)}
                  >
                    Delete
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div className="playlist-title">
                      <Text ellipsis={{ tooltip: playlist.name }}>{playlist.name}</Text>
                      <div className="playlist-badges">
                        <Tag color={playlist.privacy === 'public' ? 'green' : 'orange'}>
                          {playlist.privacy}
                        </Tag>
                        {playlist.category && (
                          <Tag color="blue">{playlist.category}</Tag>
                        )}
                      </div>
                    </div>
                  }
                  description={
                    <div className="playlist-details">
                      {playlist.description && (
                        <Text type="secondary" className="description" ellipsis={{ rows: 2 }}>
                          {playlist.description}
                        </Text>
                      )}
                      <div className="playlist-meta">
                        <Text type="secondary">
                          {playlist.songCount || 0} songs
                        </Text>
                        {playlist.metadata?.totalDuration && (
                          <Text type="secondary">
                            • {formatDuration(playlist.metadata.totalDuration)}
                          </Text>
                        )}
                        <Text type="secondary">
                          • {playlist.playCount || 0} plays
                        </Text>
                      </div>
                      {playlist.tags && playlist.tags.length > 0 && (
                        <div className="playlist-tags">
                          {playlist.tags.slice(0, 3).map(tag => (
                            <Tag key={tag} size="small">{tag}</Tag>
                          ))}
                          {playlist.tags.length > 3 && (
                            <Tag size="small">+{playlist.tags.length - 3}</Tag>
                          )}
                        </div>
                      )}
                      <Text type="secondary" className="created-date">
                        Created {new Date(playlist.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty
              image={<UnorderedListOutlined style={{ fontSize: 64, color: '#d1d5db' }} />}
              description={
                <div>
                  <Text>No playlists yet</Text>
                  <br />
                  <Text type="secondary">Create your first playlist to organize your favorite songs</Text>
                </div>
              }
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Create Your First Playlist
              </Button>
            </Empty>
          </Col>
        )}
      </Row>

      <Modal
        title="Create New Playlist"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePlaylist}
        >
          <Form.Item
            name="name"
            label="Playlist Name"
            rules={[{ required: true, message: 'Please enter playlist name' }]}
          >
            <Input placeholder="Enter playlist name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe your playlist" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="privacy"
                label="Privacy"
                initialValue="public"
              >
                <Select>
                  <Option value="public">Public</Option>
                  <Option value="private">Private</Option>
                  <Option value="unlisted">Unlisted</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                initialValue="personal"
              >
                <Select>
                  <Option value="personal">Personal</Option>
                  <Option value="mood">Mood</Option>
                  <Option value="genre">Genre</Option>
                  <Option value="activity">Activity</Option>
                  <Option value="collaborative">Collaborative</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Add tags"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="coverImage"
            label="Cover Image"
          >
            <Upload
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Cover</Button>
            </Upload>
          </Form.Item>

          <Form.Item className="form-actions">
            <Button onClick={() => {
              setCreateModalVisible(false);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Playlist
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Playlist"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedPlaylist(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditPlaylist}
        >
          <Form.Item
            name="name"
            label="Playlist Name"
            rules={[{ required: true, message: 'Please enter playlist name' }]}
          >
            <Input placeholder="Enter playlist name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe your playlist" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="privacy"
                label="Privacy"
              >
                <Select>
                  <Option value="public">Public</Option>
                  <Option value="private">Private</Option>
                  <Option value="unlisted">Unlisted</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
              >
                <Select>
                  <Option value="personal">Personal</Option>
                  <Option value="mood">Mood</Option>
                  <Option value="genre">Genre</Option>
                  <Option value="activity">Activity</Option>
                  <Option value="collaborative">Collaborative</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Add tags"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="coverImage"
            label="Cover Image"
          >
            <Upload
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload New Cover</Button>
            </Upload>
          </Form.Item>

          <Form.Item className="form-actions">
            <Button onClick={() => {
              setEditModalVisible(false);
              setSelectedPlaylist(null);
              editForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Update Playlist
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Playlists;