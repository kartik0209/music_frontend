import { Card, Typography, Row, Col, Statistic, Alert, Button, Tabs } from 'antd';
import { 

  UserOutlined, 
  BarChartOutlined,
  SettingOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  TeamOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './AdminPanel.scss';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminPanel = () => {
  const { user } = useAuth();

  const adminStats = [
    {
      title: 'Total Users',
      value: 1247,
      icon: <UserOutlined className="stat-icon users" />,
      color: '#6366f1'
    },
    {
      title: 'Total Songs',
      value: 8932,
    //   icon: <MusicOutlined className="stat-icon songs" />,
      color: '#10b981'
    },
    {
      title: 'Active Sessions',
      value: 89,
      icon: <BarChartOutlined className="stat-icon sessions" />,
      color: '#f59e0b'
    },
    {
      title: 'Storage Used',
      value: 2.3,
      suffix: 'TB',
      icon: <DatabaseOutlined className="stat-icon storage" />,
      color: '#ef4444'
    }
  ];

  const managementCards = [
    {
      title: '🎵 Music Management',
      description: 'Upload, edit, and manage music library',
    //   icon: <MusicOutlined className="management-icon" />,
      actions: ['Upload Songs', 'Edit Metadata', 'Manage Library']
    },
    {
      title: '👥 User Management',
      description: 'Manage user accounts and permissions',
      icon: <TeamOutlined className="management-icon" />,
      actions: ['View Users', 'User Analytics', 'Manage Roles']
    },
    {
      title: '📊 Analytics Dashboard',
      description: 'View detailed system analytics',
      icon: <BarChartOutlined className="management-icon" />,
      actions: ['User Analytics', 'Song Analytics', 'System Reports']
    },
    {
      title: '⚙️ System Settings',
      description: 'Configure system settings and preferences',
      icon: <SettingOutlined className="management-icon" />,
      actions: ['General Settings', 'Storage Config', 'API Settings']
    }
  ];

  return (
    <div className="admin-panel-container fade-in">
      <div className="admin-header">
        <Title level={2}>
          Admin Dashboard 🛠️
        </Title>
        <Text className="admin-subtitle">
          Welcome, {user?.username}! Manage your music platform
        </Text>
      </div>

      {/* Role Verification Alert */}
      <Alert
        message={`Admin Access Confirmed: ${user?.role?.toUpperCase()}`}
        description={`You have successfully accessed the admin panel. This dashboard provides comprehensive tools for managing users, music library, analytics, and system settings.`}
        type="success"
        showIcon
        icon={<SettingOutlined />}
        className="role-alert admin"
      />

      {/* Admin Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        {adminStats.map((stat, index) => (
          <Col xs={12} sm={12} lg={6} key={index}>
            <Card className="stat-card admin">
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

      {/* Management Sections */}
      <Tabs defaultActiveKey="1" className="admin-tabs">
        <TabPane tab="🎵 Music Management" key="1">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card 
                title="Upload New Songs" 
                className="management-card"
                actions={[
                  <Button type="primary" icon={<PlusOutlined />} disabled>
                    Upload Music
                  </Button>
                ]}
              >
                <div className="management-content">
                  <CloudUploadOutlined className="management-icon" />
                  <Text>Add new songs to the music library with metadata and cover art</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                title="Music Library" 
                className="management-card"
                actions={[
                  <Button type="default" disabled>Manage Library</Button>
                ]}
              >
                <div className="management-content">
                  {/* <MusicOutlined className="management-icon" /> */}
                  <Text>Browse, edit, and organize your music collection</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                title="Featured Content" 
                className="management-card"
                actions={[
                  <Button type="default" disabled>Manage Featured</Button>
                ]}
              >
                <div className="management-content">
                  <SettingOutlined className="management-icon" />
                  <Text>Set featured songs and playlists for users</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="👥 User Management" key="2">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card 
                title="User Overview" 
                className="management-card"
                actions={[
                  <Button type="primary" disabled>View All Users</Button>
                ]}
              >
                <div className="management-content">
                  <UserOutlined className="management-icon" />
                  <Text>View and manage all registered users, their activity, and account status</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                title="User Analytics" 
                className="management-card"
                actions={[
                  <Button type="default" disabled>View Analytics</Button>
                ]}
              >
                <div className="management-content">
                  <BarChartOutlined className="management-icon" />
                  <Text>Analyze user behavior, listening patterns, and engagement metrics</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="📊 Analytics" key="3">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="analytics-card">
                <Statistic
                  title="Monthly Active Users"
                  value={892}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#6366f1' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="analytics-card">
                <Statistic
                  title="Songs Played Today"
                  value={12847}
        
                  valueStyle={{ color: '#10b981' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="analytics-card">
                <Statistic
                  title="New Registrations"
                  value={47}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="⚙️ Settings" key="4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card 
                title="System Configuration" 
                className="management-card"
                actions={[
                  <Button type="primary" disabled>Configure</Button>
                ]}
              >
                <div className="management-content">
                  <SettingOutlined className="management-icon" />
                  <Text>Configure system settings, storage limits, and API endpoints</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                title="Backup & Maintenance" 
                className="management-card"
                actions={[
                  <Button type="default" disabled>Manage</Button>
                ]}
              >
                <div className="management-content">
                  <DatabaseOutlined className="management-icon" />
                  <Text>Schedule backups, system maintenance, and database optimization</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Admin Profile */}
      <Card title="👨‍💼 Admin Profile" className="profile-card admin">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="profile-item">
              <Text strong>Administrator:</Text>
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
              <Text strong>Role:</Text>
              <Text className="profile-value role-badge admin">{user?.role}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="profile-item">
              <Text strong>Last Login:</Text>
              <Text className="profile-value">
                {user?.activity?.lastLogin ? new Date(user.activity.lastLogin).toLocaleString() : 'N/A'}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminPanel;