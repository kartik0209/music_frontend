import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card, Form, Input, Select, Button, Upload, Typography, Row, Col,
    InputNumber, Switch, message, Divider, Spin, Image, Space, Alert, Progress
} from 'antd';
import {
    SaveOutlined, ArrowLeftOutlined, UploadOutlined, EditOutlined
} from '@ant-design/icons';
import api from '../../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;

// CORRECTED: Values are now lowercase to match the schema
const predefinedGenres = [
    'pop', 'rock', 'jazz', 'classical', 'electronic', 'hip-hop',
    'r&b', 'country', 'bollywood', 'devotional', 'sufi'
];
const predefinedMoods = [
    'happy', 'sad', 'energetic', 'calm', 'romantic',
    'uplifting', 'melancholic', 'party', 'relaxing'
];
const languages = [
    'english', 'hindi', 'gujarati', 'punjabi', 'spanish', 'french'
];

const EditSong = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [song, setSong] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSong = async () => {
            try {
                const response = await api.get(`/songs/${id}`);
                const songData = response.data.data.song;
                setSong(songData);
                setCoverPreview(songData.coverUrl);

                form.setFieldsValue({
                    title: songData.title,
                    artist: songData.artist,
                    duration: songData.duration,
                    language: songData.language,
                    albumName: songData.album?.name,
                    genre: songData.genre || [],
                    mood: songData.mood || [],
                    tags: songData.tags || [],
                    featured: songData.featured || false,
                });
            } catch (error) {
                message.error('Failed to fetch song details.');
                navigate('/admin/songs');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchSong();
    }, [id, form, navigate]);

    const handleSubmit = async (values) => {
        setLoading(true);
        setUploadProgress(0);

        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (values[key] !== undefined && values[key] !== null) {
                // Ensure all array values are sent as lowercase
                if (Array.isArray(values[key])) {
                    values[key].forEach(item => formData.append(key, item.toLowerCase()));
                } else {
                    formData.append(key, values[key]);
                }
            }
        });

        if (coverFile) {
            formData.append('cover', coverFile);
        }

        try {
            await api.put(`/songs/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                },
            });
            message.success('Song updated successfully!');
            navigate('/admin/songs');
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to update song.');
        } finally {
            setLoading(false);
        }
    };

    const handleCoverUpload = (file) => {
        if (!file.type.startsWith('image/')) {
            message.error('Please upload a valid image file!');
            return false;
        }
        if (file.size / 1024 / 1024 > 10) {
            message.error('Image must be smaller than 10MB!');
            return false;
        }
        setCoverFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setCoverPreview(e.target.result);
        reader.readAsDataURL(file);
        return false;
    };

    const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);

    if (fetchLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
    }

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/songs')} />
                <Title level={2} style={{ margin: 0 }}>
                    <EditOutlined /> Edit Song
                </Title>
            </div>

            {loading && (
                <Alert
                    message="Updating Song"
                    description={<Progress percent={uploadProgress} status="active" />}
                    type="info"
                    showIcon
                />
            )}

            <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={loading}>
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Card title="Basic Information">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="title" label="Song Title" rules={[{ required: true }]}>
                                        <Input placeholder="Enter song title" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="artist" label="Artist" rules={[{ required: true }]}>
                                        <Input placeholder="Enter artist name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="duration" label="Duration (seconds)" rules={[{ required: true }]}>
                                        <InputNumber min={1} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="language" label="Language" rules={[{ required: true }]}>
                                        <Select placeholder="Select language">
                                            {languages.map(lang => <Option key={lang} value={lang}>{capitalize(lang)}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="albumName" label="Album Name">
                                        <Input placeholder="Enter album name (optional)" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                        <Card title="Categories & Tags" style={{ marginTop: 24 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="genre" label="Genres" rules={[{ required: true }]}>
                                        <Select mode="tags" placeholder="Select or add genres">
                                            {predefinedGenres.map(g => <Option key={g} value={g}>{capitalize(g)}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="mood" label="Moods">
                                        <Select mode="tags" placeholder="Select or add moods">
                                            {predefinedMoods.map(m => <Option key={m} value={m}>{capitalize(m)}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="tags" label="Additional Tags">
                                        <Select mode="tags" placeholder="Enter custom tags" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title="Cover Image">
                            <Space direction="vertical" align="center" style={{ width: '100%' }}>
                                <Image width={200} src={coverPreview} fallback="/default-cover.jpg" style={{ borderRadius: 8 }} />
                                <Upload beforeUpload={handleCoverUpload} showUploadList={false}>
                                    <Button icon={<UploadOutlined />}>Change Cover Image</Button>
                                </Upload>
                            </Space>
                        </Card>
                        <Card title="Settings" style={{ marginTop: 24 }}>
                            <Form.Item name="featured" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Text style={{ marginLeft: 8 }}>Featured Song</Text>
                        </Card>
                    </Col>
                </Row>
                <Divider />
                <div style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={() => navigate('/admin/songs')} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                            Update Song
                        </Button>
                    </Space>
                </div>
            </Form>
        </Space>
    );
};

export default EditSong;