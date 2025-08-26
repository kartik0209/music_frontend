import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, Form, Input, Upload, Avatar, Divider, Statistic, message, Modal, Space, Spin } from 'antd';
import { UserOutlined, EditOutlined, UploadOutlined, SaveOutlined, PlayCircleOutlined, ClockCircleOutlined, HeartOutlined, TeamOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import './Profile.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile = () => {
    const { user, setUser, loading: authLoading, refetchUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const response = await api.get('/users/me/stats');
                setStats(response.data.data);
                console.log('User stats:', response.data.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                message.error('Failed to fetch user stats');
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const showEditModal = () => {
        form.setFieldsValue({
            firstName: user.profile?.firstName || '',
            lastName: user.profile?.lastName || '',
            bio: user.profile?.bio || '',
        });
        setIsEditModalVisible(true);
    };

const handleUpdateProfile = async (values) => {
    try {
        setProfileUpdateLoading(true);
        const formData = new FormData();
        // ... (your FormData append logic remains the same)
        if (values.avatar && values.avatar.length > 0 && values.avatar[0].originFileObj) {
            formData.append('avatar', values.avatar[0].originFileObj);
        }

        // ✅ FIX: Use the response from the PUT request directly
        const response = await api.put('/users/me/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // 2. Update the context state with the fresh user data from the API response
        setUser(response.data.data);

        message.success('Profile updated successfully');
        setIsEditModalVisible(false);
        form.resetFields();
    } catch (error) {
        console.error('Profile update error:', error);
        message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
        setProfileUpdateLoading(false);
    }
};

// ... rest of the component

    const handleChangePassword = async (values) => {
        try {
            await api.put('/auth/change-password', values);
            message.success('Password changed successfully');
            setIsPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
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

    if (authLoading || !user) {
        return <div className="profile-loader"><Spin size="large" /></div>;
    }

    const displayName = user.profile?.firstName 
        ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
        : user.username;

    return (
        <div className="profile-container fade-in">
            <Title level={2}>👤 My Profile</Title>
            
            <Row gutter={[24, 24]}>
                {/* Profile Card */}
                <Col xs={24} lg={8}>
                    <Card className="profile-card">
                        <Space direction="vertical" align="center" style={{ width: '100%' }}>
                            <Avatar 
                                size={120} 
                                src={user.profile?.avatar} 
                                icon={<UserOutlined />}
                                className="profile-avatar"
                            />
                            <div className="profile-info">
                                <Title level={4} style={{ marginBottom: 4 }}>
                                    {displayName}
                                </Title>
                                <Text type="secondary">@{user.username}</Text>
                                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                    {user.email}
                                </Text>
                                {user.profile?.bio && (
                                    <Text style={{ textAlign: 'center', marginTop: 8, display: 'block' }}>
                                        {user.profile.bio}
                                    </Text>
                                )}
                                <Text type="secondary" style={{ fontSize: '12px', marginTop: 8, display: 'block' }}>
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </Text>
                            </div>
                        </Space>
                        <Divider />
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <Button 
                                type="primary" 
                                icon={<EditOutlined />} 
                                block 
                                onClick={showEditModal}
                            >
                                Edit Profile
                            </Button>
                            <Button 
                                block 
                                onClick={() => setIsPasswordModalVisible(true)}
                            >
                                Change Password
                            </Button>
                        </Space>
                    </Card>
                </Col>

                {/* Stats Card */}
                <Col xs={24} lg={16}>
                    <Card title="Your Statistics" className="stats-card">
                        {statsLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Spin />
                            </div>
                        ) : (
                            <Row gutter={[16, 16]}>
                                <Col xs={12} sm={6}>
                                    <Statistic 
                                        title="Songs Played" 
                                        value={stats?.songsPlayed || 0} 
                                        prefix={<PlayCircleOutlined style={{ color: '#1890ff' }} />} 
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Statistic 
                                        title="Listening Time" 
                                        value={formatTime(stats?.totalListeningTime || 0)}
                                        prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />} 
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Statistic 
                                        title="Favorite Songs" 
                                        value={stats?.totalFavorites || 0} 
                                        prefix={<HeartOutlined style={{ color: '#f5222d' }} />} 
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Statistic 
                                        title="Followers" 
                                        value={stats?.followers || 0} 
                                        prefix={<TeamOutlined style={{ color: '#722ed1' }} />} 
                                    />
                                </Col>
                            </Row>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Edit Profile Modal */}
            <Modal 
                title="Edit Profile" 
                open={isEditModalVisible} 
                onCancel={() => {
                    setIsEditModalVisible(false);
                    form.resetFields();
                }} 
                footer={null}
                destroyOnClose
                width={500}
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleUpdateProfile}
                    initialValues={{
                        firstName: '',
                        lastName: '',
                        bio: ''
                    }}
                >
                    <Form.Item 
                        name="avatar" 
                        label="Profile Picture"
                        getValueFromEvent={(e) => {
                            console.log('Avatar upload event:', e);
                            if (Array.isArray(e)) {
                                return e;
                            }
                            return e?.fileList;
                        }}
                    >
                        <Upload 
                            {...uploadProps}
                            onChange={(info) => {
                                console.log('Avatar upload onChange:', info);
                            }}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload Picture</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    <Form.Item 
                        name="firstName" 
                        label="First Name"
                    >
                        <Input placeholder="Enter your first name" />
                    </Form.Item>

                    <Form.Item 
                        name="lastName" 
                        label="Last Name"
                    >
                        <Input placeholder="Enter your last name" />
                    </Form.Item>

                    <Form.Item 
                        name="bio" 
                        label="Bio"
                    >
                        <TextArea 
                            rows={3} 
                            placeholder="Tell us about yourself..." 
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => {
                                setIsEditModalVisible(false);
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                icon={<SaveOutlined />}
                                loading={profileUpdateLoading}
                            >
                                Save Changes
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Change Password Modal */}
            <Modal 
                title="Change Password" 
                open={isPasswordModalVisible} 
                onCancel={() => {
                    setIsPasswordModalVisible(false);
                    passwordForm.resetFields();
                }} 
                footer={null}
                destroyOnClose
            >
                <Form 
                    form={passwordForm} 
                    layout="vertical" 
                    onFinish={handleChangePassword}
                >
                    <Form.Item 
                        name="currentPassword" 
                        label="Current Password" 
                        rules={[{ required: true, message: 'Please enter your current password' }]}
                    >
                        <Input.Password placeholder="Enter current password" />
                    </Form.Item>

                    <Form.Item 
                        name="newPassword" 
                        label="New Password" 
                        rules={[
                            { required: true, message: 'Please enter a new password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password placeholder="Enter new password" />
                    </Form.Item>

                    <Form.Item 
                        name="confirmPassword" 
                        label="Confirm New Password" 
                        dependencies={['newPassword']} 
                        rules={[
                            { required: true, message: 'Please confirm your new password' }, 
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                }
                            })
                        ]}
                    >
                        <Input.Password placeholder="Confirm new password" />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => {
                                setIsPasswordModalVisible(false);
                                passwordForm.resetFields();
                            }}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Change Password
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;