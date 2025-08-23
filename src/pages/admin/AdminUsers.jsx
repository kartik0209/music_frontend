import { useState, useEffect, useCallback } from 'react';
import {
    Card, Table, Button, Input, Space, Tag, Avatar, Typography, Popconfirm,
    message, Switch, Modal, Statistic, Row, Col
} from 'antd';
import {
    UserOutlined, DeleteOutlined, SearchOutlined, EyeOutlined,
    TeamOutlined, CrownOutlined, CalendarOutlined
} from '@ant-design/icons';
import api from '../../utils/api';
import debounce from 'lodash.debounce';

const { Title, Text } = Typography;
const { Search } = Input;

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [previewUser, setPreviewUser] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, admins: 0, newThisMonth: 0 });

    const fetchUsers = useCallback(async (page, size, search) => {
        setLoading(true);
        try {
            const response = await api.get('/users', {
                params: { page, limit: size, search }
            });
            const { users, pagination: newPagination } = response.data.data;
            setUsers(users);
            setPagination(prev => ({ ...prev, total: newPagination.total, current: page, pageSize: size }));
        } catch (error) {
            message.error('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/users/stats');
            setStats(response.data.data);
        } catch (error) {
            message.error('Failed to fetch user statistics.');
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);
    
    useEffect(() => {
        const debouncedFetch = debounce(() => {
            fetchUsers(1, pagination.pageSize, searchTerm);
        }, 500);
        debouncedFetch();
        return () => debouncedFetch.cancel();
    }, [searchTerm, pagination.pageSize, fetchUsers]);


    const handleTableChange = (newPagination) => {
        fetchUsers(newPagination.current, newPagination.pageSize, searchTerm);
    };
    
    const handleUserStatusChange = async (user) => {
        const newStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
        try {
            await api.put(`/users/${user._id}/status`, { status: newStatus });
            message.success(`User status updated to ${newStatus}.`);
            setUsers(currentUsers =>
                currentUsers.map(u => u._id === user._id ? { ...u, accountStatus: newStatus } : u)
            );
        } catch (error) {
            message.error('Failed to update user status.');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await api.delete(`/users/${userId}`);
            message.success('User deleted successfully.');
            setUsers(currentUsers => currentUsers.filter(u => u._id !== userId));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
            message.error('Failed to delete user.');
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0h 0m';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <Avatar src={record.profile?.avatar} icon={<UserOutlined />} />
                    <div>
                        <Text strong>{record.username}</Text><br />
                        <Text type="secondary">{record.profile?.firstName} {record.profile?.lastName}</Text>
                    </div>
                </Space>
            ),
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color={role === 'admin' ? 'gold' : 'blue'}>{role.toUpperCase()}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'accountStatus',
            key: 'status',
            render: (status, record) => (
                <Space>
                    <Tag color={status === 'active' ? 'success' : 'error'}>{status}</Tag>
                    <Switch
                        size="small"
                        checked={status === 'active'}
                        onChange={() => handleUserStatusChange(record)}
                    />
                </Space>
            ),
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EyeOutlined />} onClick={() => setPreviewUser(record)} />
                    <Popconfirm
                        title="Delete this user?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDeleteUser(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Title level={2}>👥 Manage Users</Title>
            
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}><Card><Statistic title="Total Users" value={stats.total} prefix={<TeamOutlined />} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="Active Users" value={stats.active} prefix={<UserOutlined />} valueStyle={{ color: '#10b981' }}/></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="Admins" value={stats.admins} prefix={<CrownOutlined />} valueStyle={{ color: '#f59e0b' }}/></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="New This Month" value={stats.newThisMonth} prefix={<CalendarOutlined />} valueStyle={{ color: '#ef4444' }}/></Card></Col>
            </Row>

            <Card>
                <Search
                    placeholder="Search by username, email, or name..."
                    allowClear
                    enterButton
                    size="large"
                    onSearch={(value) => setSearchTerm(value)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="_id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            <Modal
                title="User Details"
                open={!!previewUser}
                onCancel={() => setPreviewUser(null)}
                footer={<Button onClick={() => setPreviewUser(null)}>Close</Button>}
                width={600}
            >
                {previewUser && (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Space align="center" size="large">
                            <Avatar size={80} src={previewUser.profile?.avatar} icon={<UserOutlined />} />
                            <div>
                                <Title level={4}>{previewUser.username}</Title>
                                <Text type="secondary">{previewUser.email}</Text><br/>
                                <Tag color={previewUser.role === 'admin' ? 'gold' : 'blue'}>{previewUser.role.toUpperCase()}</Tag>
                                <Tag color={previewUser.accountStatus === 'active' ? 'success' : 'error'}>{previewUser.accountStatus.toUpperCase()}</Tag>
                            </div>
                        </Space>
                        <Row gutter={[16, 16]}>
                            <Col span={12}><Text strong>Full Name:</Text><br /><Text>{previewUser.profile?.firstName} {previewUser.profile?.lastName}</Text></Col>
                            <Col span={12}><Text strong>Member Since:</Text><br /><Text>{new Date(previewUser.createdAt).toLocaleDateString()}</Text></Col>
                            <Col span={12}><Text strong>Last Login:</Text><br /><Text>{previewUser.activity?.lastLogin ? new Date(previewUser.activity.lastLogin).toLocaleString() : 'Never'}</Text></Col>
                            <Col span={12}><Text strong>Songs Played:</Text><br /><Text>{previewUser.activity?.songsPlayed || 0}</Text></Col>
                            <Col span={12}><Text strong>Total Play Time:</Text><br /><Text>{formatDuration(previewUser.activity?.totalPlayTime)}</Text></Col>
                        </Row>
                    </Space>
                )}
            </Modal>
        </Space>
    );
};

export default AdminUsers;