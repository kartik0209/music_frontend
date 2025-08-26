import React, { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Row, Col, Button, Empty, Modal, Form, Input, Select, Upload, message, List, Avatar, Spin } from 'antd';
import { PlusOutlined, PlayCircleOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SoundOutlined } from '@ant-design/icons';
import { useMusicPlayer } from '../../contexts/MusicContext';
import api from '../../utils/api';
import './Playlists.scss';

const { Title } = Typography;
const { TextArea } = Input;

const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [availableSongs, setAvailableSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ view: null, form: null });
    const [form] = Form.useForm();
    const { playSong, playPlaylist } = useMusicPlayer();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [playlistsRes, songsRes] = await Promise.all([
                api.get('/playlists/me'),
                api.get('/songs/list')
            ]);
            setPlaylists(playlistsRes.data.data);
            setAvailableSongs(songsRes.data.data);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const songOptions = useMemo(() => {
        return availableSongs.map(song => ({
            value: song._id,
            label: `${song.title} - ${song.artist}`
        }));
    }, [availableSongs]);

    const handleFormSubmit = async (values) => {
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            if (values.description) formData.append('description', values.description);
            
            // Handle songs array properly
            if (values.songs && values.songs.length > 0) {
                values.songs.forEach(songId => formData.append('songs', songId));
            }
            
            // Handle cover image - Fixed this part
            if (values.coverImage && values.coverImage.length > 0) {
                const file = values.coverImage[0];
                if (file.originFileObj) {
                    formData.append('coverImage', file.originFileObj);
                    console.log('Image file added to FormData:', file.originFileObj.name);
                } else if (file instanceof File) {
                    formData.append('coverImage', file);
                    console.log('Image file added to FormData:', file.name);
                }
            }

            // Debug FormData contents
            console.log('FormData contents:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            if (modal.form === 'edit') {
                await api.put(`/playlists/${modal.view._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                message.success('Playlist updated');
            } else {
                await api.post('/playlists', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                message.success('Playlist created');
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Form submit error:', error);
            console.error('Error details:', error.response?.data);
            message.error(`Failed to ${modal.form} playlist: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeletePlaylist = (playlistId) => {
        Modal.confirm({
            title: 'Delete this playlist?',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await api.delete(`/playlists/${playlistId}`);
                    setPlaylists(prev => prev.filter(p => p._id !== playlistId));
                    message.success('Playlist deleted');
                } catch (error) {
                    message.error('Failed to delete playlist');
                }
            }
        });
    };

    const handleOpenModal = async (type, playlist = null) => {
        if (type === 'view') {
            try {
                const response = await api.get(`/playlists/${playlist._id}`);
                setModal({ view: response.data.data, form: 'view' });
            } catch (error) {
                message.error('Could not load playlist details.');
            }
        } else {
            setModal({ view: playlist, form: type });
            if (type === 'edit' && playlist) {
                // Set form values for editing
                form.setFieldsValue({
                    name: playlist.name,
                    description: playlist.description || '',
                    songs: playlist.songs || [],
                });
            } else {
                // Reset form for create
                form.resetFields();
            }
        }
    };
    
    const handleCloseModal = () => {
        form.resetFields();
        setModal({ view: null, form: null });
    };

    const renderPlaylistCards = () => {
        if (loading) return <div style={{textAlign: 'center', width: '100%'}}><Spin /></div>;
        if (playlists.length === 0) return <Col span={24}><Empty description="No playlists yet. Create your first one!" /></Col>;

        return playlists.map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
                <Card
                    className="playlist-card"
                    cover={<img alt={p.name} src={p.coverUrl} style={{height: '200px', objectFit: 'cover'}} />}
                    actions={[
                        <Button type="text" icon={<PlayCircleOutlined />} onClick={() => handleOpenModal('view', p)}>View</Button>,
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal('edit', p)}>Edit</Button>,
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeletePlaylist(p._id)} />,
                    ]}
                >
                    <Card.Meta title={p.name} description={`${p.songCount || 0} songs`} />
                </Card>
            </Col>
        ));
    };

    // Custom upload props
    const uploadProps = {
        listType: "picture-card",
        maxCount: 1,
        beforeUpload: () => false, // Prevent auto upload
        showUploadList: {
            showPreviewIcon: true,
            showRemoveIcon: true,
        },
    };

    return (
        <div className="playlists-container fade-in">
            <div className="playlists-header">
                <Title level={2}>🎧 My Playlists</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => handleOpenModal('create')}>Create Playlist</Button>
            </div>
            <Row gutter={[24, 24]}>{renderPlaylistCards()}</Row>

            {/* Create / Edit Modal */}
            <Modal
                title={modal.form === 'edit' ? "Edit Playlist" : "Create New Playlist"}
                open={modal.form === 'create' || modal.form === 'edit'}
                onCancel={handleCloseModal}
                footer={null}
                destroyOnClose
                width={600}
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleFormSubmit}
                    initialValues={{ name: '', description: '', songs: [] }}
                >
                    <Form.Item 
                        name="name" 
                        label="Name" 
                        rules={[{ required: true, message: 'Please enter playlist name' }]}
                    >
                        <Input placeholder="Enter playlist name" />
                    </Form.Item>
                    
                    <Form.Item name="description" label="Description">
                        <TextArea rows={3} placeholder="Enter playlist description (optional)" />
                    </Form.Item>
                    
                    <Form.Item name="songs" label="Select Songs">
                        <Select 
                            mode="multiple" 
                            allowClear 
                            showSearch 
                            placeholder="Search and add songs" 
                            options={songOptions} 
                            optionFilterProp="label"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    
                    <Form.Item 
                        name="coverImage" 
                        label="Cover Image"
                        getValueFromEvent={(e) => {
                            console.log('Upload event:', e);
                            if (Array.isArray(e)) {
                                return e;
                            }
                            return e?.fileList;
                        }}
                    >
                        <Upload 
                            {...uploadProps}
                            onChange={(info) => {
                                console.log('Upload onChange:', info);
                            }}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload Cover</div>
                            </div>
                        </Upload>
                    </Form.Item>
                    
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Button onClick={handleCloseModal} style={{ marginRight: 8 }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {modal.form === 'edit' ? "Update Playlist" : "Create Playlist"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            
            {/* View Songs Modal */}
            <Modal
                title={modal.view?.name}
                open={modal.form === 'view'}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="playAll" type="primary" icon={<PlayCircleOutlined />} onClick={() => playPlaylist(modal.view?.songs)}>
                        Play All
                    </Button>,
                    <Button key="close" onClick={handleCloseModal}>
                        Close
                    </Button>
                ]}
                width={600}
                destroyOnClose
            >
                {modal.view?.songs?.length > 0 ? (
                    <List
                        dataSource={modal.view.songs}
                        renderItem={song => (
                            <List.Item actions={[
                                <Button type="text" icon={<PlayCircleOutlined />} onClick={() => playSong(song)}>
                                    Play
                                </Button>
                            ]}>
                                <List.Item.Meta
                                    avatar={<Avatar src={song.coverUrl} icon={<SoundOutlined />} />}
                                    title={song.title}
                                    description={song.artist}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description="No songs in this playlist" />
                )}
            </Modal>
        </div>
    );
};

export default Playlists;