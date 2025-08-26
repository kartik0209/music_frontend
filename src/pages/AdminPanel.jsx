import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Spin, Alert, Space, Progress, List } from 'antd';
import { UserOutlined, CustomerServiceOutlined, PlaySquareOutlined, DatabaseOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const { Title, Text } = Typography;

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await api.get('/analytics/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                } else {
                    throw new Error('Failed to fetch stats from API.');
                }
            } catch (err) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardStats();
    }, []);

    const chartConfig = {
        height: 300,
        xField: '_id',
        yField: 'totalPlays',
        label: { position: 'middle', style: { fill: '#FFFFFF', opacity: 0.8 } },
        xAxis: { label: { autoHide: true, autoRotate: false } },
        meta: { _id: { alias: 'Genre' }, totalPlays: { alias: 'Total Plays' } },
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" tip="Loading Dashboard..." /></div>;
    }

    if (error) {
        return <Alert message="Error Loading Dashboard" description={error} type="error" showIcon />;
    }

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <div className="admin-header">
                <Title level={2}>📊 Admin Dashboard</Title>
                <Text type="secondary">Welcome back, {user?.username}! Here is the latest overview of your platform.</Text>
            </div>

            {stats && (
                <>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Total Users" value={stats.users.total} prefix={<UserOutlined />} /></Card></Col>
                        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Total Songs" value={stats.songs.total} prefix={<CustomerServiceOutlined />} /></Card></Col>
                        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Total Plays" value={stats.songs.totalPlays} prefix={<PlaySquareOutlined />} /></Card></Col>
                        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Total Playlists" value={stats.playlists.total} prefix={<DatabaseOutlined />} /></Card></Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={16}>
                            <Card title="Top 5 Genres by Plays">
                                <Column {...chartConfig} data={stats.distributions.topGenres} />
                            </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Card title="Song Statistics">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Statistic title="Total Likes" value={stats.songs.totalLikes} />
                                    <Statistic title="Featured Songs" value={stats.songs.featured} />
                                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                        <Progress
                                            type="dashboard"
                                            percent={stats.songs.averageRating > 0 ? (stats.songs.averageRating / 5) * 100 : 0}
                                            // ✨ IMPROVEMENT: Show 'N/A' if no ratings exist, otherwise show the formatted rating.
                                            format={() => stats.songs.averageRating > 0 ? `${stats.songs.averageRating.toFixed(2)} / 5` : 'N/A'}
                                        />
                                        <Text strong style={{ display: 'block', marginTop: '8px' }}>Average Rating</Text>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={8}>
                            <Card title="User Statistics">
                                <List>
                                    <List.Item>
                                        <List.Item.Meta title="Active Users" />
                                        <Text strong>{stats.users.active}</Text>
                                    </List.Item>
                                    <List.Item>
                                        <List.Item.Meta title="New Users (Last 30 Days)" />
                                        <Text strong style={{ color: '#3f8600' }}><ArrowUpOutlined /> {stats.users.newThisMonth}</Text>
                                    </List.Item>
                                    <List.Item>
                                        <List.Item.Meta title="Total User Follows" />
                                        <Text strong>{stats.users.totalFollows}</Text>
                                    </List.Item>
                                </List>
                            </Card>
                        </Col>
                        <Col xs={24} lg={16}>
                            <Card title="Top 5 Languages by Plays">
                                <Column {...chartConfig} data={stats.distributions.topLanguages} meta={{ _id: { alias: 'Language' }, totalPlays: { alias: 'Total Plays' } }} />
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Space>
    );
};

export default AdminDashboard;