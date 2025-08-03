import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Avatar, 
  Typography, 
  Popconfirm, 
  message,
  Switch,
  Modal,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  EyeOutlined,
  TeamOutlined,
  CrownOutlined,
  MailOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import api from '../../utils/api';
//import './AdminUsers.scss';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual endpoint
      const mockUsers = [
        {
          _id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          role: 'user',
          accountStatus: 'active',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            avatar: null
          },
          activity: {
            lastLogin: new Date().toISOString(),
            songsPlayed: 245,
            totalPlayTime: 12600
          },
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          username: 'admin_user',
          email: 'admin@example.com',
          role: 'admin',
          accountStatus: 'active',
          profile: {
            firstName: 'Admin',
            lastName: 'User',
            avatar: null
          },
          activity: {
            lastLogin: new Date().toISOString(),
            songsPlayed: 89,
            totalPlayTime: 5400
          },
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setUsers(mockUsers);
      setPagination(prev => ({
        ...prev,
        total: mockUsers.length
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        total: 1247,
        active: 1189,
        admins: 5,
        newThisMonth: 89
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUserStatusChange = async (userId, currentStatus) => {
    try {
      // Mock API call
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      message.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Mock API call
      message.success(`User role updated to ${newRole} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      message.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Mock API call
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  const handlePreview = (user) => {
    setPreviewUser(user);
    setPreviewVisible(true);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            src={record.profile?.avatar}
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <Text strong>{record.username}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>
              {record.profile?.firstName} {record.profile?.lastName}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          style={{ width: 100 }}
          onChange={(newRole) => handleRoleChange(record._id, newRole)}
        >
          <Option value="user">
            <UserOutlined /> User
          </Option>
          <Option value="admin">
            <CrownOutlined /> Admin
          </Option>
        </Select>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'accountStatus',
      key: 'status',
      render: (status, record) => (
        <div>
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status}
          </Tag>
          <Switch
            size="small"
            checked={status === 'active'}
            onChange={() => handleUserStatusChange(record._id, status)}
            style={{ marginLeft: 8 }}
          />
        </div>
      ),
    },
    {
      title: 'Activity',
      key: 'activity',
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: '0.85rem' }}>
            {record.activity?.songsPlayed || 0} songs
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '0.8rem' }}>
            {formatDuration(record.activity?.totalPlayTime || 0)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: ['activity', 'lastLogin'],
      key: 'lastLogin',
      render: (lastLogin) => (
        <Text type="secondary" style={{ fontSize: '0.85rem' }}>
          {lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Never'}
        </Text>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <Text type="secondary" style={{ fontSize: '0.85rem' }}>
          {new Date(createdAt).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handlePreview(record)}
            title="View Details"
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Delete User"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="admin-users-container fade-in">
      <div className="users-header">
        <div>
          <Title level={2}>👥 Manage Users</Title>
          <Text className="users-subtitle">
            View and manage user accounts
          </Text>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={stats.active}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Admins"
              value={stats.admins}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="New This Month"
              value={stats.newThisMonth}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="filter-card">
        <div className="filters-row">
          <Search
            placeholder="Search users..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: 300 }}
            onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
          />
          
          <Select
            placeholder="Role"
            allowClear
            size="large"
            style={{ width: 150 }}
            onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
          >
            <Option value="user">User</Option>
            <Option value="admin">Admin</Option>
          </Select>

          <Select
            placeholder="Status"
            allowClear
            size="large"
            style={{ width: 150 }}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="suspended">Suspended</Option>
          </Select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize
              }));
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* User Preview Modal */}
      <Modal
        title="User Details"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {previewUser && (
          <div className="user-preview">
            <div className="preview-header">
              <Avatar
                size={80}
                src={previewUser.profile?.avatar}
                icon={<UserOutlined />}
              />
              <div>
                <Title level={4}>{previewUser.username}</Title>
                <Text type="secondary">{previewUser.email}</Text>
                <br />
                <Tag color={previewUser.role === 'admin' ? 'gold' : 'blue'}>
                  {previewUser.role.toUpperCase()}
                </Tag>
                <Tag color={previewUser.accountStatus === 'active' ? 'green' : 'red'}>
                  {previewUser.accountStatus.toUpperCase()}
                </Tag>
              </div>
            </div>

            <div className="preview-details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Full Name:</Text>
                  <br />
                  <Text>
                    {previewUser.profile?.firstName} {previewUser.profile?.lastName}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Member Since:</Text>
                  <br />
                  <Text>{new Date(previewUser.createdAt).toLocaleDateString()}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Last Login:</Text>
                  <br />
                  <Text>
                    {previewUser.activity?.lastLogin
                      ? new Date(previewUser.activity.lastLogin).toLocaleString()
                      : 'Never'
                    }
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Songs Played:</Text>
                  <br />
                  <Text>{previewUser.activity?.songsPlayed || 0}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Total Play Time:</Text>
                  <br />
                  <Text>{formatDuration(previewUser.activity?.totalPlayTime || 0)}</Text>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;