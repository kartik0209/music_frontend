import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, Form, Input, Upload, Avatar, Divider, Statistic, message, Modal, Space, Spin } from 'antd';
import { UserOutlined, EditOutlined, UploadOutlined, SaveOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import './Profile.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile = () => {
    const { user, loading: authLoading, refetchUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const response = await api.get('/users/me/stats');
                setStats(response.data.data);
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
            firstName: user.profile?.firstName,
            lastName: user.profile?.lastName,
            bio: user.profile?.bio,
        });
        setIsEditModalVisible(true);
    };

    const handleUpdateProfile = async (values) => {
        const formData = new FormData();
        formData.append('firstName', values.firstName || '');
        formData.append('lastName', values.lastName || '');
        formData.append('bio', values.bio || '');
        if (values.avatar?.file) {
            formData.append('avatar', values.avatar.file);
        }

        try {
            await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Profile updated successfully');
            refetchUser(); // Refetch user data in context
            setIsEditModalVisible(false);
        } catch (error) {
            message.error('Failed to update profile');
        }
    };

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

    if (authLoading || !user) {
        return <div className="profile-loader"><Spin size="large" /></div>;
    }

    return (
        <div className="profile-container fade-in">
            <Title level={2}>👤 My Profile</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card>
                        <Space direction="vertical" align="center" style={{ width: '100%' }}>
                            <Avatar size={120} src={user.profile?.avatar} icon={<UserOutlined />} />
                            <Title level={4} style={{ marginBottom: 0 }}>{user.profile?.firstName || user.username}</Title>
                            <Text type="secondary">@{user.username}</Text>
                            <Text style={{ textAlign: 'center' }}>{user.profile?.bio}</Text>
                        </Space>
                        <Divider />
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button type="primary" icon={<EditOutlined />} block onClick={showEditModal}>Edit Profile</Button>
                            <Button block onClick={() => setIsPasswordModalVisible(true)}>Change Password</Button>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card title="Your Statistics">
                        {statsLoading ? <div style={{ textAlign: 'center' }}><Spin /></div> : (
                            <Row gutter={[16, 16]}>
                                <Col xs={12}><Statistic title="Songs Played" value={stats?.songsPlayed || 0} prefix={<PlayCircleOutlined />} /></Col>
                                <Col xs={12}><Statistic title="Listening Time" value={Math.floor((stats?.totalPlayTime || 0) / 60)} suffix="mins" prefix={<ClockCircleOutlined />} /></Col>
                            </Row>
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal title="Edit Profile" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
                    <Form.Item name="avatar" label="Profile Picture">
                        <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}><div><UploadOutlined /> Upload</div></Upload>
                    </Form.Item>
                    <Form.Item name="firstName" label="First Name"><Input /></Form.Item>
                    <Form.Item name="lastName" label="Last Name"><Input /></Form.Item>
                    <Form.Item name="bio" label="Bio"><TextArea rows={3} /></Form.Item>
                    <Form.Item style={{ textAlign: 'right' }}>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Save Changes</Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="Change Password" open={isPasswordModalVisible} onCancel={() => setIsPasswordModalVisible(false)} footer={null}>
                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                    <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="newPassword" label="New Password" rules={[{ required: true }, { min: 6 }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="confirmPassword" label="Confirm New Password" dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                        return Promise.reject(new Error('Passwords do not match'));
                    }})]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right' }}>
                        <Button type="primary" htmlType="submit">Change Password</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;