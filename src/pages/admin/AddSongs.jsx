import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tag
} from 'antd';
import { 
  UploadOutlined, 
  PlusOutlined, 
  ArrowLeftOutlined,

  PictureOutlined
} from '@ant-design/icons';
import api from '../../utils/api';
import './AddSongs.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddSong = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [customGenres, setCustomGenres] = useState([]);
  const [customMoods, setCustomMoods] = useState([]);
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

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (!audioFile) {
        message.error('Please upload an audio file');
        return;
      }

      const formData = new FormData();
      
      // Basic song details
      formData.append('title', values.title);
      formData.append('artist', values.artist);
      formData.append('duration', values.duration);
      formData.append('language', values.language);
      
      // Handle genres (both predefined and custom)
      const allGenres = [...(values.genres || []), ...customGenres];
      allGenres.forEach(genre => {
        formData.append('genre', genre);
      });
      
      // Handle moods (both predefined and custom)
      const allMoods = [...(values.moods || []), ...customMoods];
      if (allMoods.length > 0) {
        allMoods.forEach(mood => {
          formData.append('mood', mood);
        });
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
        values.tags.forEach(tag => {
          formData.append('tags', tag);
        });
      }

      // Additional metadata
      if (values.description || values.composer) {
        formData.append('metadata', JSON.stringify({
          description: values.description,
          composer: values.composer,
          producer: values.producer,
          recordLabel: values.recordLabel
        }));
      }

      // Files
      formData.append('audio', audioFile);
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      const response = await api.post('/songs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('Song uploaded successfully!');
      navigate('/admin/songs');
      
    } catch (error) {
      console.error('Error uploading song:', error);
      message.error(error.response?.data?.message || 'Failed to upload song');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = (file) => {
    const isAudio = file.type.startsWith('audio/');
    if (!isAudio) {
      message.error('You can only upload audio files!');
      return false;
    }
    
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error('Audio file must be smaller than 50MB!');
      return false;
    }

    setAudioFile(file);
    return false; // Prevent default upload
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

  return (
    <div className="add-song-container fade-in">
      <div className="add-song-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/admin/songs')}
          size="large"
        >
          Back to Songs
        </Button>
        <div>
          <Title level={2}>🎵 Add New Song</Title>
          <Text className="add-song-subtitle">
            Upload a new song to your music library
          </Text>
        </div>
      </div>

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
            </Card>

            {/* File Uploads */}
            <Card title="📁 File Uploads" className="form-card">
              <Form.Item 
                label="Audio File" 
                required
                extra="Supported formats: MP3, WAV, FLAC (Max: 50MB)"
              >
                <Upload
                  beforeUpload={handleAudioUpload}
                  maxCount={1}
                  fileList={audioFile ? [{ uid: '1', name: audioFile.name, status: 'done' }] : []}
                  onRemove={() => setAudioFile(null)}
                >
                  <Button  size="large" block>
                    {audioFile ? 'Replace Audio File' : 'Upload Audio File'}
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item 
                label="Cover Image" 
                extra="Supported formats: JPG, PNG, WebP (Max: 5MB)"
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
                      <div style={{ marginTop: 8 }}>Upload Cover</div>
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
            icon={<PlusOutlined />}
          >
            Upload Song
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddSong;