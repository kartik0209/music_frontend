import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Typography } from 'antd';
import { 
    UserOutlined, 
    SettingOutlined, 
    LogoutOutlined, 
    DashboardOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    // MusicOutlined, // Removed as requested
    PlusOutlined,
    UnorderedListOutlined,
    HeartOutlined,
    PlayCircleOutlined,
    TeamOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './Layout.scss';

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <UserOutlined />,
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: <SettingOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    // User menu items
    const userMenuItems2 = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/dashboard'),
        },
        {
            key: '/music',
            // icon: <MusicOutlined />, // Removed as requested
            label: 'Browse Music',
            onClick: () => navigate('/music'),
        },
        {
            key: '/playlists',
            icon: <UnorderedListOutlined />,
            label: 'My Playlists',
            onClick: () => navigate('/playlists'),
        },
        {
            key: '/favorites',
            icon: <HeartOutlined />,
            label: 'Favorites',
            onClick: () => navigate('/favorites'),
        },
        {
            key: '/recent',
            icon: <PlayCircleOutlined />,
            label: 'Recent Plays',
            onClick: () => navigate('/recent'),
        }
    ];

    // Admin menu items
    const adminMenuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Admin Dashboard',
            onClick: () => navigate('/admin'),
        },
        {
            key: '/admin/songs',
            // icon: <MusicOutlined />, // Removed as requested
            label: 'Manage Songs',
            onClick: () => navigate('/admin/songs'),
        },
        {
            key: '/admin/songs/add',
            icon: <PlusOutlined />,
            label: 'Add Song',
            onClick: () => navigate('/admin/songs/add'),
        },
        {
            key: '/admin/users',
            icon: <TeamOutlined />,
            label: 'Manage Users',
            onClick: () => navigate('/admin/users'),
        },
        {
            key: '/admin/analytics',
            icon: <BarChartOutlined />,
            label: 'Analytics',
            onClick: () => navigate('/admin/analytics'),
        },
        {
            key: '/admin/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: () => navigate('/admin/settings'),
        }
    ];

    // Get menu items based on user role
    const getMenuItems = () => {
        if (user?.role === 'admin') {
            return adminMenuItems;
        }
        return userMenuItems2;
    };

    return (
        <AntLayout className="layout-container">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="layout-sider"
                theme="light"
            >
                <div className="logo">
                    {!collapsed && (
                        <Title level={4} className="logo-text">
                            {user?.role === 'admin' ? 'Admin Panel' : 'MusicApp'}
                        </Title>
                    )}
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={getMenuItems()}
                    className="layout-menu"
                />
            </Sider>

            <AntLayout>
                <Header className="layout-header">
                    <div className="header-left">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="collapse-btn"
                        />
                    </div>

                    <div className="header-right">
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <div className="user-dropdown">
                                <Avatar
                                    src={user?.profile?.avatar}
                                    icon={<UserOutlined />}
                                    className="user-avatar"
                                />
                                <div className="user-info">
                                    <span className="username">{user?.username}</span>
                                    <span className="user-role">{user?.role}</span>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="layout-content">
                    <div className="content-wrapper">
                        <Outlet />
                    </div>
                </Content>
            </AntLayout>
        </AntLayout>
    );
};

export default Layout;