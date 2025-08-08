import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, Form, Input, Upload, Avatar, Divider, Statistic, message, Modal } from 'antd';
import { UserOutlined, EditOutlined, UploadOutlined, SaveOutlined, HeartOutlined, PlayCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import './Profile.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({});
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data.data.user);
      form.setFieldsValue({
        firstName: response.data.data.user.profile?.firstName,
        lastName: response.data.data.user.profile?.lastName,
        bio: response.data.data.user.profile?.bio,
        location: response.data.data.user.profile?.location,
        website: response.data.data.user.profile?.website,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/user/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      const formData = new FormData();
      
      Object.keys(values).forEach(key => {
        if (key === 'avatar' && values[key]?.file) {
          formData.append('avatar', values[key].file);
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      const response = await api.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProfile(response.data.data.user);
      setEditing(false);
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (values) => {
    try {
      await api.put('/user/change-password', values);
      setChangePasswordVisible(false);
      passwordForm.resetFields();
      message.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      message.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Delete Account',
      content: 'Are you sure you want to delete your account? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete('/user/account');
          message.success('Account deleted successfully');
          window.location.href = '/login';
        } catch (error) {
          console.error('Error deleting account:', error);
          message.error('Failed to delete account');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Card loading />
      </div>
    );
  }

  return (
    <div className="profile-container fade-in">
      <div className="profile-header">
        <Title level={2}>👤 My Profile</Title>
        <Text className="profile-subtitle">
          Manage your account settings and preferences
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="profile-card">
            <div className="profile-avatar-section">
              <Avatar
                size={120}
                src={profile?.profile?.avatar}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
              <div className="profile-basic-info">
                <Title level={4} className="profile-name">
                  {profile?.profile?.firstName && profile?.profile?.lastName 
                    ? `${profile.profile.firstName} ${profile.profile.lastName}`
                    : profile?.username
                  }
                </Title>
                <Text type="secondary" className="profile-username">
                  @{profile?.username}
                </Text>
                <Text type="secondary" className="profile-joined">
                  Joined {new Date(profile?.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Text>
              </div>
            </div>

            {profile?.profile?.bio && (
              <div className="profile-bio">
                <Text>{profile.profile.bio}</Text>
              </div>
            )}

            <div className="profile-details">
              {profile?.profile?.location && (
                <div className="profile-detail-item">
                  <Text type="secondary">Location:</Text>
                  <Text>{profile.profile.location}</Text>
                </div>
              )}
              {profile?.profile?.website && (
                <div className="profile-detail-item">
                  <Text type="secondary">Website:</Text>
                  <a href={profile.profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.profile.website}
                  </a>
                </div>
              )}
              <div className="profile-detail-item">
                <Text type="secondary">Email:</Text>
                <Text>{profile?.email}</Text>
              </div>
            </div>

            <Divider />

            <div className="profile-actions">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
                block
              >
                Edit Profile
              </Button>
              <Button
                onClick={() => setChangePasswordVisible(true)}
                block
              >
                Change Password
              </Button>
              <Button
                danger
                onClick={handleDeleteAccount}
                block
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="stats-card" title="Statistics">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Songs Played"
                  value={stats.totalPlays || 0}
                  prefix={<PlayCircleOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Favorites"
                  value={stats.totalFavorites || 0}
                  prefix={<HeartOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Playlists"
                  value={stats.totalPlaylists || 0}
                  prefix={<UnorderedListOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Listening Time"
                  value={Math.floor((stats.totalListeningTime || 0) / 3600)}
                  suffix="hrs"
                  prefix={<PlayCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Card className="activity-card" title="Recent Activity">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="activity-list">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'play' && <PlayCircleOutlined />}
                      {activity.type === 'favorite' && <HeartOutlined />}
                      {activity.type === 'playlist' && <UnorderedListOutlined />}
                    </div>
                    <div className="activity-content">
                      <Text strong>{activity.description}</Text>
                      <Text type="secondary" className="activity-time">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">No recent activity</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Edit Profile"
        open={editing}
        onCancel={() => {
          setEditing(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            name="avatar"
            label="Profile Picture"
          >
            <Upload
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
              listType="picture-card"
            >
              <div>
                <UploadOutlined />
                <div>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
              >
                <Input placeholder="Enter your first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
              >
                <Input placeholder="Enter your last name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bio"
            label="Bio"
          >
            <TextArea rows={3} placeholder="Tell us about yourself" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Your location" />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
          >
            <Input placeholder="Your website URL" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button onClick={() => {
              setEditing(false);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Change Password"
        open={changePasswordVisible}
        onCancel={() => {
          setChangePasswordVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
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
              { required: true, message: 'Please enter your new password' },
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
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button onClick={() => {
              setChangePasswordVisible(false);
              passwordForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;