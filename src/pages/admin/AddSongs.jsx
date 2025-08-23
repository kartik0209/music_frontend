import { useState, useRef } from 'react';
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
  Tag,
  Progress,
  Space,
  Alert,
  Tooltip
} from 'antd';
import { 
  UploadOutlined, 
  PlusOutlined, 
  ArrowLeftOutlined,
  PictureOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import api from '../../utils/api';


const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddSong = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [customGenres, setCustomGenres] = useState([]);
  const [customMoods, setCustomMoods] = useState([]);
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const predefinedGenres = [
    'pop', 'rock', 'jazz', 'classical', 'electronic', 
    'hip-hop', 'r&b', 'country', 'folk', 'blues',
    'reggae', 'metal', 'punk', 'indie', 'alternative',
    'bollywood', 'devotional', 'sufi', 'ghazal', 'qawwali'
  ];

  const predefinedMoods = [
    'happy', 'sad', 'energetic', 'calm', 'romantic',
    'angry', 'nostalgic', 'uplifting', 'melancholic', 'party',
    'peaceful', 'dramatic', 'inspirational', 'relaxing'
  ];

  const languages = [
    'english', 'hindi', 'gujarati', 'tamil', 'telugu', 'marathi', 
    'bengali', 'kannada', 'malayalam', 'punjabi', 'urdu', 'odia',
    'spanish', 'french', 'german', 'italian', 'portuguese', 'russian',
    'arabic', 'chinese', 'japanese', 'korean', 'none'
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setUploadProgress(0);

      if (!audioFile) {
        message.error('Please upload an audio file');
        return;
      }

      const formData = new FormData();
      
      // Basic song details
      formData.append('title', values.title);
      formData.append('artist', values.artist);
      formData.append('duration', audioDuration || values.duration);
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
          releaseDate: values.albumYear ? new Date(values.albumYear, 0, 1) : null,
          totalTracks: values.totalTracks
        }));
      }
      
      if (values.lyrics) {
        formData.append('lyrics', JSON.stringify({
          text: values.lyrics,
          language: values.lyricsLanguage || values.language,
          hasExplicitContent: values.explicitContent || false
        }));
      }

      if (values.tags && values.tags.length > 0) {
        values.tags.forEach(tag => {
          formData.append('tags', tag);
        });
      }

      // Additional metadata
      if (values.bpm || values.key || values.composer || values.producer || values.recordLabel) {
        const metadata = {};
        if (values.bpm) metadata.bpm = values.bpm;
        if (values.key) metadata.key = values.key;
        if (values.composer) metadata.composer = Array.isArray(values.composer) ? values.composer : [values.composer];
        if (values.producer) metadata.producer = Array.isArray(values.producer) ? values.producer : [values.producer];
        if (values.recordLabel) metadata.recordLabel = values.recordLabel;
        if (values.copyright) metadata.copyright = values.copyright;
        
        formData.append('metadata', JSON.stringify(metadata));
      }

      // Files
      formData.append('audio', audioFile);
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      // Quality settings
      if (values.quality) {
        formData.append('quality', values.quality);
      }

      const response = await api.post('/songs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      message.success('Song uploaded successfully!');
      navigate('/admin/songs');
      
    } catch (error) {
      console.error('Error uploading song:', error);
      message.error(error.response?.data?.message || 'Failed to upload song');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleAudioUpload = (file) => {
    const allowedMimeTypes = [
        'audio/mpeg', // for .mp3
        'audio/wav',
        'audio/flac',
        'audio/x-flac',
        'audio/mp4', // for .m4a
        'audio/x-m4a',
        'audio/ogg'
    ];

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['mp3', 'wav', 'flac', 'm4a', 'ogg'];

    const isAudio = allowedMimeTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    
    if (!isAudio) {
        message.error('Please upload a valid audio file (MP3, WAV, FLAC, M4A, OGG)');
        return false;
    }

    
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error('Audio file must be smaller than 100MB!');
      return false;
    }

    setAudioFile(file);
    
    // Create audio preview and get duration
    const url = URL.createObjectURL(file);
    setAudioPreview(url);
    
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(Math.floor(audio.duration));
      form.setFieldValue('duration', Math.floor(audio.duration));
    });
    
    return false;
  };

  const handleCoverUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Please upload a valid image file!');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Image must be smaller than 10MB!');
      return false;
    }

    setCoverFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target.result);
    reader.readAsDataURL(file);
    
    return false;
  };

  const toggleAudioPreview = () => {
    if (!audioRef.current) return;
    
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  const stopAudioPreview = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setAudioPlaying(false);
  };

  const removeAudioFile = () => {
    setAudioFile(null);
    setAudioPreview(null);
    setAudioDuration(0);
    setAudioPlaying(false);
    form.setFieldValue('duration', undefined);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const removeCoverFile = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const addCustomGenre = (genre) => {
    if (genre && !customGenres.includes(genre) && !predefinedGenres.includes(genre.toLowerCase())) {
      setCustomGenres([...customGenres, genre]);
    }
  };

  const addCustomMood = (mood) => {
    if (mood && !customMoods.includes(mood) && !predefinedMoods.includes(mood.toLowerCase())) {
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

  return (
    <div className="add-song-container">
      <div className="add-song-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/admin/songs')}
          size="large"
        >
          Back to Songs
        </Button>
        <div>
          <Title level={2}>
            
            Add New Song
          </Title>
          <Text className="add-song-subtitle">
            Upload a new song to your music library
          </Text>
        </div>
      </div>

      {loading && (
        <Alert
          message="Uploading Song"
          description={
            <div>
              <Progress percent={uploadProgress} status="active" />
              <Text>Please wait while we upload and process your song...</Text>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
        disabled={loading}
      >
        <Row gutter={[24, 24]}>
          {/* Left Column - Basic Info */}
          <Col xs={24} lg={12}>
            <Card title="📝 Basic Information" className="form-card">
              <Form.Item
                name="title"
                label="Song Title"
                rules={[
                  { required: true, message: 'Please enter song title' },
                  { max: 200, message: 'Title cannot exceed 200 characters' }
                ]}
              >
                <Input placeholder="Enter song title" showCount maxLength={200} />
              </Form.Item>

              <Form.Item
                name="artist"
                label="Artist"
                rules={[
                  { required: true, message: 'Please enter artist name' },
                  { max: 100, message: 'Artist name cannot exceed 100 characters' }
                ]}
              >
                <Input placeholder="Enter artist name" showCount maxLength={100} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="duration"
                    label="Duration (seconds)"
                    rules={[{ required: true, message: 'Please enter duration' }]}
                    extra={audioDuration ? `Auto-detected: ${formatDuration(audioDuration)}` : null}
                  >
                    <InputNumber 
                      placeholder="Duration in seconds"
                      min={1}
                      max={7200}
                      style={{ width: '100%' }}
                      disabled={!!audioDuration}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="language"
                    label="Language"
                    rules={[{ required: true, message: 'Please select language' }]}
                  >
                    <Select 
                      placeholder="Select language"
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {languages.map(lang => (
                        <Option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Album Information */}
              <Divider orientation="left">Album Information</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="album" label="Album Name">
                    <Input placeholder="Enter album name (optional)" maxLength={200} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="albumYear" label="Release Year">
                    <InputNumber 
                      placeholder="Year"
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="totalTracks" label="Total Tracks">
                    <InputNumber 
                      placeholder="Total"
                      min={1}
                      max={999}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* File Uploads */}
            <Card title="📁 File Uploads" className="form-card">
              {/* Audio File Upload */}
              <Form.Item 
                label="Audio File" 
                required
                extra="Supported: MP3, WAV, FLAC, M4A, OGG (Max: 100MB)"
              >
                {!audioFile ? (
                  <Upload.Dragger
                    beforeUpload={handleAudioUpload}
                    showUploadList={false}
                    style={{ background: '#fafafa' }}
                  >
                    <p className="ant-upload-drag-icon">
                      <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">Click or drag audio file to upload</p>
                    <p className="ant-upload-hint">
                      High-quality audio files recommended for best experience
                    </p>
                  </Upload.Dragger>
                ) : (
                  <div className="audio-upload-success">
                    <div className="audio-file-info">
                      
                      <div>
                        <Text strong>{audioFile.name}</Text>
                        <br />
                        <Text type="secondary">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                          {audioDuration && ` • ${formatDuration(audioDuration)}`}
                        </Text>
                      </div>
                    </div>
                    <Space>
                      <Button
                        type="text"
                        icon={audioPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={toggleAudioPreview}
                        disabled={!audioPreview}
                      >
                        {audioPlaying ? 'Pause' : 'Preview'}
                      </Button>
                      <Button
                        type="text"
                        icon={<StopOutlined />}
                        onClick={stopAudioPreview}
                        disabled={!audioPlaying}
                      >
                        Stop
                      </Button>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={removeAudioFile}
                      >
                        Remove
                      </Button>
                    </Space>
                  </div>
                )}
              </Form.Item>

              {/* Cover Image Upload */}
              <Form.Item 
                label="Cover Image" 
                extra="Supported: JPG, PNG, WebP (Max: 10MB, Recommended: 1000x1000px)"
              >
                {!coverPreview ? (
                  <Upload
                    beforeUpload={handleCoverUpload}
                    showUploadList={false}
                    listType="picture-card"
                    className="cover-uploader"
                  >
                    <div>
                      <PictureOutlined style={{ fontSize: 32 }} />
                      <div style={{ marginTop: 8 }}>Upload Cover</div>
                    </div>
                  </Upload>
                ) : (
                  <div className="cover-preview">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #d9d9d9'
                      }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={removeCoverFile}
                      size="small"
                      style={{ marginLeft: 16 }}
                    >
                      Remove Cover
                    </Button>
                  </div>
                )}
              </Form.Item>

              {/* Quality Selection */}
              <Form.Item name="quality" label="Audio Quality">
                <Select placeholder="Select audio quality" defaultValue="medium">
                  <Option value="low">Low (96 kbps)</Option>
                  <Option value="medium">Medium (128 kbps)</Option>
                  <Option value="high">High (320 kbps)</Option>
                  <Option value="lossless">Lossless</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          {/* Right Column - Categories & Details */}
          <Col xs={24} lg={12}>
            <Card title="🎨 Categories & Tags" className="form-card">
              <Form.Item 
                name="genres" 
                label="Genres"
                rules={[{ required: true, message: 'Please select at least one genre' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select genres"
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {predefinedGenres.map(genre => (
                    <Option key={genre} value={genre}>
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Add Custom Genre">
                <Input.Search
                  placeholder="Add custom genre"
                  enterButton="Add"
                  onSearch={addCustomGenre}
                />
                {customGenres.length > 0 && (
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
                )}
              </Form.Item>

              <Form.Item name="moods" label="Moods">
                <Select
                  mode="multiple"
                  placeholder="Select moods"
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {predefinedMoods.map(mood => (
                    <Option key={mood} value={mood}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Add Custom Mood">
                <Input.Search
                  placeholder="Add custom mood"
                  enterButton="Add"
                  onSearch={addCustomMood}
                />
                {customMoods.length > 0 && (
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
                )}
              </Form.Item>

              <Form.Item name="tags" label="Additional Tags">
                <Select
                  mode="tags"
                  placeholder="Enter custom tags"
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                />
              </Form.Item>
            </Card>

            <Card title="🎼 Technical Details" className="form-card">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="bpm" label="BPM (Beats Per Minute)">
                    <InputNumber 
                      placeholder="e.g., 120"
                      min={60}
                      max={200}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="key" label="Musical Key">
                    <Select placeholder="Select key">
                      {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                        <Option key={key} value={key}>{key}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="composer" label="Composer">
                <Input placeholder="Enter composer name" />
              </Form.Item>

              <Form.Item name="producer" label="Producer">
                <Input placeholder="Enter producer name" />
              </Form.Item>

              <Form.Item name="recordLabel" label="Record Label">
                <Input placeholder="Enter record label" />
              </Form.Item>

              <Form.Item name="copyright" label="Copyright">
                <Input placeholder="Copyright information" />
              </Form.Item>
            </Card>

            <Card title="📄 Lyrics & Content" className="form-card">
              <Form.Item name="lyricsLanguage" label="Lyrics Language">
                <Select placeholder="Select lyrics language (if different from song)">
                  {languages.map(lang => (
                    <Option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="lyrics" label="Lyrics">
                <TextArea 
                  rows={8}
                  placeholder="Enter song lyrics (optional)"
                  showCount
                  maxLength={10000}
                />
              </Form.Item>

              <Form.Item name="explicitContent" valuePropName="checked">
                <Switch />
                <Text style={{ marginLeft: 8 }}>Contains explicit content</Text>
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Submit Buttons */}
        <div className="form-actions">
          <Space size="large">
            <Button 
              size="large" 
              onClick={() => navigate('/admin/songs')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<PlusOutlined />}
              disabled={!audioFile}
            >
              {loading ? `Uploading... ${uploadProgress}%` : 'Upload Song'}
            </Button>
          </Space>
        </div>
      </Form>

      {/* Hidden audio element for preview */}
      {audioPreview && (
        <audio
          ref={audioRef}
          src={audioPreview}
          onEnded={() => setAudioPlaying(false)}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

export default AddSong;