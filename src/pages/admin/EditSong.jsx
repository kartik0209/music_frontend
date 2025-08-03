import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Upload, 
  Typography, 
  Row, 
  Col, 
  InputNumber,
  Switch,
  message,
  Divider,
  Tag,
  Spin,
  Image
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined,
  PictureOutlined,
  StarOutlined
} from '@ant-design/icons';
import api from '../../utils/api';
//import './EditSong.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditSong = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [song, setSong] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [customGenres, setCustomGenres] = useState([]);
  const [customMoods, setCustomMoods] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const predefinedGenres = [
    'pop', 'rock', 'jazz', 'classical', 'electronic', 
    'hip-hop', 'r&b', 'country', 'folk', 'blues',
    'reggae', 'metal', 'punk', 'indie', 'alternative'
  ];

  const predefinedMoods = [
    'happy', 'sad', 'energetic', 'calm', 'romantic',
    'melancholic', 'upbeat', 'chill', 'dramatic', 'peaceful'
  ];

  const languages = [
    'english', 'hindi', 'spanish', 'french', 'german',
    'italian', 'portuguese', 'japanese', 'korean', 'chinese'
  ];

  useEffect(() => {
    fetchSong();
  }, [id]);

  const fetchSong = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/songs/${id}`);
      const songData = response.data.data.song;
      setSong(songData);
      
      // Separate predefined and custom genres/moods
      const predefinedGenresList = songData.genre?.filter(g => predefinedGenres.includes(g)) || [];
      const customGenresList = songData.genre?.filter(g => !predefinedGenres.includes(g)) || [];
      const predefinedMoodsList = songData.mood?.filter(m => predefinedMoods.includes(m)) || [];
      const customMoodsList = songData.mood?.filter(m => !predefinedMoods.includes(m)) || [];
      
      setCustomGenres(customGenresList);
      setCustomMoods(customMoodsList);

      // Set form values
      form.setFieldsValue({
        title: songData.title,
        artist: songData.artist,
        duration: songData.duration,
        language: songData.language,
        album: songData.album?.name,
        albumYear: songData.album?.year,
        genres: predefinedGenresList,
        moods: predefinedMoodsList,
        tags: songData.tags || [],
        composer: songData.metadata?.composer,
        producer: songData.metadata?.producer,
        recordLabel: songData.metadata?.recordLabel,
        description: songData.metadata?.description,
        lyrics: songData.lyrics?.text,
        featured: songData.featured
      });
      
    } catch (error) {
      console.error('Error fetching song:', error);
      message.error('Failed to fetch song details');
      navigate('/admin/songs');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();
      
      // Basic song details
      formData.append('title', values.title);
      formData.append('artist', values.artist);
      formData.append('duration', values.duration);
      formData.append('language', values.language);
      
      // Handle genres (both predefined and custom)
      const allGenres = [...(values.genres || []), ...customGenres];
      if (allGenres.length > 0) {
        formData.append('genre', JSON.stringify(allGenres));
      }
      
      // Handle moods (both predefined and custom)
      const allMoods = [...(values.moods || []), ...customMoods];
      if (allMoods.length > 0) {
        formData.append('mood', JSON.stringify(allMoods));
      }

      // Optional fields
      if (values.album) {
        formData.append('album', JSON.stringify({
          name: values.album,
          year: values.albumYear
        }));
      }
      
      if (values.lyrics) {
        formData.append('lyrics', JSON.stringify({
          text: values.lyrics,
          language: values.language
        }));
      }

      if (values.tags && values.tags.length > 0) {
        formData.append('tags', JSON.stringify(values.tags));
      }

      // Additional metadata
      if (values.description || values.composer || values.producer || values.recordLabel) {
        formData.append('metadata', JSON.stringify({
          description: values.description,
          composer: values.composer,
          producer: values.producer,
          recordLabel: values.recordLabel
        }));
      }

      // Featured status
      formData.append('featured', values.featured || false);

      // Cover image if changed
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      const response = await api.put(`/songs/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('Song updated successfully!');
      navigate('/admin/songs');
      
    } catch (error) {
      console.error('Error updating song:', error);
      message.error(error.response?.data?.message || 'Failed to update song');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    setCoverFile(file);
    return false; // Prevent default upload
  };

  const addCustomGenre = (genre) => {
    if (genre && !customGenres.includes(genre)) {
      setCustomGenres([...customGenres, genre]);
    }
  };

  const addCustomMood = (mood) => {
    if (mood && !customMoods.includes(mood)) {
      setCustomMoods([...customMoods, mood]);
    }
  };

  const removeCustomGenre = (genre) => {
    setCustomGenres(customGenres.filter(g => g !== genre));
  };

  const removeCustomMood = (mood) => {
    setCustomMoods(customMoods.filter(m => m !== mood));
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (fetchLoading) {
    return (
      <div className="edit-song-loading">
        <Spin size="large" />
        <Text>Loading song details...</Text>
      </div>
    );
  }

  if (!song) {
    return null;
  }

  return (
    <div className="edit-song-container fade-in">
      <div className="edit-song-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/admin/songs')}
          size="large"
        >
          Back to Songs
        </Button>
        <div>
          <Title level={2}>✏️ Edit Song</Title>
          <Text className="edit-song-subtitle">
            Update song information and metadata
          </Text>
        </div>
      </div>

      {/* Song Info Display */}
      <Card className="song-info-card">
        <Row gutter={16} align="middle">
          <Col>
            <Image
              width={80}
              height={80}
              src={song.coverImage?.path || '/default-cover.jpg'}
              style={{ borderRadius: 8, objectFit: 'cover' }}
            />
          </Col>
          <Col flex={1}>
            <Title level={4} style={{ margin: 0 }}>
              {song.title}
              {song.featured && <StarOutlined style={{ color: '#faad14', marginLeft: 8 }} />}
            </Title>
            <Text type="secondary">by {song.artist}</Text><br />
            <Text type="secondary">Duration: {formatDuration(song.duration)} • Plays: {song.playCount?.toLocaleString() || 0}</Text>
          </Col>
        </Row>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
      >
        <Row gutter={[24, 0]}>
          {/* Left Column - Basic Info */}
          <Col xs={24} lg={12}>
            <Card title="📝 Basic Information" className="form-card">
              <Form.Item
                name="title"
                label="Song Title"
                rules={[{ required: true, message: 'Please enter song title' }]}
              >
                <Input placeholder="Enter song title" />
              </Form.Item>

              <Form.Item
                name="artist"
                label="Artist"
                rules={[{ required: true, message: 'Please enter artist name' }]}
              >
                <Input placeholder="Enter artist name" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="duration"
                    label="Duration (seconds)"
                    rules={[{ required: true, message: 'Please enter duration' }]}
                  >
                    <InputNumber 
                      placeholder="Duration in seconds"
                      min={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="language"
                    label="Language"
                    rules={[{ required: true, message: 'Please select language' }]}
                  >
                    <Select placeholder="Select language">
                      {languages.map(lang => (
                        <Option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="album" label="Album Name">
                    <Input placeholder="Enter album name (optional)" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="albumYear" label="Album Year">
                    <InputNumber 
                      placeholder="Year"
                      min={1900}
                      max={new Date().getFullYear()}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="featured" valuePropName="checked" label="Featured Song">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Card>

            {/* Cover Image Update */}
            <Card title="🖼️ Cover Image" className="form-card">
              <div className="current-cover">
                <Text strong>Current Cover:</Text>
                <Image
                  width={120}
                  height={120}
                  src={song.coverImage?.path || '/default-cover.jpg'}
                  style={{ borderRadius: 8, objectFit: 'cover', marginTop: 8 }}
                />
              </div>
              
              <Form.Item 
                label="Update Cover Image" 
                extra="Supported formats: JPG, PNG, WebP (Max: 5MB)"
                style={{ marginTop: 16 }}
              >
                <Upload
                  beforeUpload={handleCoverUpload}
                  maxCount={1}
                  listType="picture-card"
                  fileList={coverFile ? [{ uid: '1', name: coverFile.name, status: 'done' }] : []}
                  onRemove={() => setCoverFile(null)}
                >
                  {!coverFile && (
                    <div>
                      <PictureOutlined />
                      <div style={{ marginTop: 8 }}>Upload New Cover</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Card>
          </Col>

          {/* Right Column - Additional Info */}
          <Col xs={24} lg={12}>
            <Card title="🎨 Categories & Tags" className="form-card">
              <Form.Item name="genres" label="Genres">
                <Select
                  mode="multiple"
                  placeholder="Select genres"
                  style={{ width: '100%' }}
                >
                  {predefinedGenres.map(genre => (
                    <Option key={genre} value={genre}>
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Custom Genres">
                <Input.Search
                  placeholder="Add custom genre"
                  enterButton="Add"
                  onSearch={addCustomGenre}
                />
                <div style={{ marginTop: 8 }}>
                  {customGenres.map(genre => (
                    <Tag 
                      key={genre} 
                      closable 
                      onClose={() => removeCustomGenre(genre)}
                      color="blue"
                    >
                      {genre}
                    </Tag>
                  ))}
                </div>
              </Form.Item>

              <Form.Item name="moods" label="Moods">
                <Select
                  mode="multiple"
                  placeholder="Select moods"
                  style={{ width: '100%' }}
                >
                  {predefinedMoods.map(mood => (
                    <Option key={mood} value={mood}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Custom Moods">
                <Input.Search
                  placeholder="Add custom mood"
                  enterButton="Add"
                  onSearch={addCustomMood}
                />
                <div style={{ marginTop: 8 }}>
                  {customMoods.map(mood => (
                    <Tag 
                      key={mood} 
                      closable 
                      onClose={() => removeCustomMood(mood)}
                      color="purple"
                    >
                      {mood}
                    </Tag>
                  ))}
                </div>
              </Form.Item>

              <Form.Item name="tags" label="Additional Tags">
                <Select
                  mode="tags"
                  placeholder="Enter tags"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Card>

            <Card title="📄 Additional Details" className="form-card">
              <Form.Item name="composer" label="Composer">
                <Input placeholder="Enter composer name" />
              </Form.Item>

              <Form.Item name="producer" label="Producer">
                <Input placeholder="Enter producer name" />
              </Form.Item>

              <Form.Item name="recordLabel" label="Record Label">
                <Input placeholder="Enter record label" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <TextArea 
                  rows={3}
                  placeholder="Enter song description"
                />
              </Form.Item>

              <Form.Item name="lyrics" label="Lyrics">
                <TextArea 
                  rows={6}
                  placeholder="Enter song lyrics (optional)"
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Submit Buttons */}
        <div className="form-actions">
          <Button 
            size="large" 
            onClick={() => navigate('/admin/songs')}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            icon={<SaveOutlined />}
          >
            Update Song
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditSong;