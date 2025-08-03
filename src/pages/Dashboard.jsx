import { Card, Typography, Row, Col, Statistic, Alert, Button } from 'antd';
import { 
  PlayCircleOutlined, 
  HeartOutlined, 
  UserOutlined,
  StarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.scss';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user } = useAuth();

  const userStats = [
    {
      title: 'Songs Played',
      value: user?.activity?.songsPlayed || 0,
      icon: <PlayCircleOutlined className="stat-icon play" />,
      color: '#6366f1'
    },
    {
      title: 'Play Time',
      value: Math.floor((user?.activity?.totalPlayTime || 0) / 60),
      suffix: 'min',
      icon: <ClockCircleOutlined className="stat-icon time" />,
      color: '#10b981'
    },
    {
      title: 'Ratings Given',
      value: user?.activity?.ratingsGiven || 0,
      icon: <StarOutlined className="stat-icon rating" />,
      color: '#f59e0b'
    },
    {
      title: 'Playlists',
      value: user?.activity?.playlistsCreated || 0,
    //   icon: <MusicOutlined className="stat-icon playlist" />,
      color: '#ef4444'
    }
  ];

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <Title level={2}>
          Welcome back, {user?.username}! 👋
        </Title>
        <Text className="dashboard-subtitle">
          Here's your music activity overview
        </Text>
      </div>

      {/* Role Verification Alert */}
      <Alert
        message={`Role Access Test: ${user?.role?.toUpperCase()}`}
        description={`You are successfully logged in as a ${user?.role}. This dashboard is specifically for users to view their music listening statistics and activity.`}
        type="info"
        showIcon
        icon={<UserOutlined />}
        className="role-alert"
      />

      {/* User Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        {userStats.map((stat, index) => (
          <Col xs={12} sm={12} lg={6} key={index}>
            <Card className="stat-card">
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* User Features */}
      <Row gutter={[16, 16]} className="features-row">
        <Col xs={24} md={12}>
          <Card 
            title="🎵 Music Player" 
            className="feature-card"
            actions={[
              <Button type="primary" disabled>Coming Soon</Button>
            ]}
          >
            <div className="feature-content">
              <PlayCircleOutlined className="feature-icon" />
              <div>
                <Text strong>Stream Your Favorite Music</Text>
                <br />
                <Text type="secondary">
                  Play songs, create playlists, and discover new music
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            title="❤️ My Favorites" 
            className="feature-card"
            actions={[
              <Button type="primary" disabled>Coming Soon</Button>
            ]}
          >
            <div className="feature-content">
              <HeartOutlined className="feature-icon" />
              <div>
                <Text strong>Your Liked Songs</Text>
                <br />
                <Text type="secondary">
                  Access all your favorite tracks in one place
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            title="⭐ Recommendations" 
            className="feature-card"
            actions={[
              <Button type="primary" disabled>Coming Soon</Button>
            ]}
          >
            <div className="feature-content">
              <StarOutlined className="feature-icon" />
              <div>
                <Text strong>Discover New Music</Text>
                <br />
                <Text type="secondary">
                  Personalized song recommendations based on your taste
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            title="🎧 Recent Activity" 
            className="feature-card"
            actions={[
              <Button type="primary" disabled>Coming Soon</Button>
            ]}
          >
            <div className="feature-content">
              <ClockCircleOutlined className="feature-icon" />
              <div>
                <Text strong>Listening History</Text>
                <br />
                <Text type="secondary">
                  View your recently played songs and activity
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Profile Information */}
      <Card title="👤 Profile Information" className="profile-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="profile-item">
              <Text strong>Username:</Text>
              <Text className="profile-value">{user?.username}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="profile-item">
              <Text strong>Email:</Text>
              <Text className="profile-value">{user?.email}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="profile-item">
              <Text strong>Account Type:</Text>
              <Text className="profile-value role-badge user">{user?.role}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="profile-item">
              <Text strong>Member Since:</Text>
              <Text className="profile-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;