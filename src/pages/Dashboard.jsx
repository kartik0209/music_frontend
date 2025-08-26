import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, List, Avatar, Empty, Statistic, Spin } from 'antd';
import { PlayCircleOutlined, SoundOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useMusicPlayer } from '../contexts/MusicContext';
import api from '../utils/api';
import './Dashboard.scss';

const { Title, Text } = Typography;

const Dashboard = () => {
    const { user } = useAuth();
    const { playSong } = useMusicPlayer();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/dashboard');
                if (response.data.success) {
                    setDashboardData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    if (loading) {
        return <div className="dashboard-loader"><Spin size="large" /></div>;
    }

    return (
        <div className="dashboard-container fade-in">
            <div className="dashboard-header">
                <Title level={2}>{getGreeting()}, {user?.profile?.firstName || user?.username}! 👋</Title>
                <Text>Ready to discover some amazing music today?</Text>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={12} lg={6}>
                    <Card><Statistic title="Listening Time (hrs)" value={Math.floor((dashboardData?.stats?.totalListeningTime || 0) / 3600)} prefix={<ClockCircleOutlined />} /></Card>
                </Col>
                <Col xs={24} md={12} lg={6}>
                    <Card><Statistic title="Favorites" value={dashboardData?.favorites?.length || 0} prefix={<PlayCircleOutlined />} /></Card>
                </Col>
                <Col xs={24} md={12} lg={6}>
                    <Card><Statistic title="Playlists" value={dashboardData?.playlists?.length || 0} prefix={<PlayCircleOutlined />} /></Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card title="🎵 Recent Plays">
                        <List
                            dataSource={dashboardData?.recentPlays || []}
                            renderItem={(play) => (
                                <List.Item actions={[<Button type="text" icon={<PlayCircleOutlined />} onClick={() => playSong(play.song)}>Play</Button>]}>
                                    <List.Item.Meta
                                        avatar={<Avatar src={play.song.coverUrl} shape="square" size={50} icon={<SoundOutlined />} />}
                                        title={play.song.title}
                                        description={play.song.artist}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="🔥 Trending Songs">
                        <List
                            dataSource={dashboardData?.topSongs || []}
                            renderItem={(song) => (
                                <List.Item actions={[<Button type="text" icon={<PlayCircleOutlined />} onClick={() => playSong(song)}>Play</Button>]}>
                                    <List.Item.Meta
                                        avatar={<Avatar src={song.coverUrl} shape="square" size={50} icon={<SoundOutlined />} />}
                                        title={song.title}
                                        description={song.artist}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;