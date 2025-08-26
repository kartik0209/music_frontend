import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, Table, Button, Input, Select, Space, Tag, Avatar, Typography,
    message, Switch, Modal, Image, Row, Col, Statistic, Dropdown, Drawer,
    Divider
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined,
    PlayCircleOutlined, StarOutlined, StarFilled, MoreOutlined, FilterOutlined,
    FireOutlined
} from '@ant-design/icons';
import api from '../../utils/api';
import debounce from 'lodash.debounce';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const AdminSongs = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({
        search: '', genre: '', language: '', status: '',
        featured: '', sortBy: 'uploadDate', sortOrder: 'desc'
    });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [previewSong, setPreviewSong] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, featured: 0, totalPlays: 0 });
    const navigate = useNavigate();

    const fetchSongs = useCallback(async (currentFilters, currentPagination) => {
        setLoading(true);
        try {
            const params = {
                page: currentPagination.current,
                limit: currentPagination.pageSize,
                ...currentFilters
            };
            Object.keys(params).forEach(key => !params[key] && delete params[key]);

            const response = await api.get('/songs', { params });
            setSongs(response.data.data.songs);
            setPagination(prev => ({ ...prev, total: response.data.data.pagination.total }));
        } catch (error) {
            message.error('Failed to fetch songs.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/songs/stats');
            console.log(response);
            setStats(response.data.data);
        } catch (error) {
            message.error('Failed to fetch song statistics.');
        }
    };

    useEffect(() => {
        fetchStats();
        const debouncedFetch = debounce(() => {
            setPagination(p => ({ ...p, current: 1 }));
            fetchSongs(filters, { ...pagination, current: 1 });
        }, 500);

        debouncedFetch();
        return () => debouncedFetch.cancel();
    }, [filters, fetchSongs]);


    const handleTableChange = (newPagination) => {
        setPagination(p => ({...p, ...newPagination}));
        fetchSongs(filters, newPagination);
    };

    const handleDelete = async (songId) => {
        try {
            await api.delete(`/songs/${songId}`);
            message.success('Song deleted successfully.');
            fetchSongs(filters, pagination);
            fetchStats();
        } catch (error) {
            message.error('Failed to delete song.');
        }
    };

    const handleToggleFeatured = async (songId, isFeatured) => {
        try {
            await api.put(`/songs/${songId}/featured`);
            message.success(`Song ${isFeatured ? 'unfeatured' : 'featured'} successfully.`);
            setSongs(currentSongs =>
                currentSongs.map(s => s._id === songId ? { ...s, featured: !isFeatured } : s)
            );
            fetchStats();
        } catch (error) {
            message.error('Failed to update featured status.');
        }
    };

    const formatDuration = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    const formatNumber = (num = 0) => num > 999 ? `${(num / 1000).toFixed(1)}K` : String(num);

    const getStatusColor = (status) => ({ active: 'success', inactive: 'error', pending: 'warning' })[status] || 'default';

    const actionMenuItems = (record) => [
        { key: 'preview', label: 'Preview', icon: <EyeOutlined />, onClick: () => setPreviewSong(record) },
        { key: 'edit', label: 'Edit', icon: <EditOutlined />, onClick: () => navigate(`/admin/songs/edit/${record._id}`) },
        { key: 'feature', label: record.featured ? 'Unfeature' : 'Feature', icon: <StarOutlined />, onClick: () => handleToggleFeatured(record._id, record.featured) },
        { type: 'divider' },
        {
            key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true,
            onClick: () => Modal.confirm({
                title: 'Are you sure?', content: `This will delete "${record.title}".`,
                onOk: () => handleDelete(record._id),
            }),
        }
    ];

    const columns = [
        {
            title: 'Song', key: 'song', width: 300,
            render: (_, record) => (
                <Space>
                    <Avatar shape="square" size={60} src={record.coverUrl} />
                    <div>
                        <Text strong>{record.title}</Text>
                        {record.featured && <StarFilled style={{ color: '#faad14', marginLeft: 6 }} />}
                        <br />
                        <Text type="secondary">by {record.artist}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Stats', key: 'stats', width: 150,
            render: (_, record) => (
                <>
                    <Text><PlayCircleOutlined /> {formatNumber(record.playCount)}</Text><br />
                    <Text><StarOutlined /> {record.ratings?.average?.toFixed(1) || 'N/A'}</Text>
                </>
            ),
        },
        { title: 'Duration', dataIndex: 'duration', key: 'duration', render: formatDuration },
        { title: 'Genre', dataIndex: 'genre', key: 'genre', render: (genres) => genres.map(g => <Tag key={g}>{g}</Tag>) },
        { title: 'Language', dataIndex: 'language', key: 'language' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={getStatusColor(s)}>{s.toUpperCase()}</Tag> },
        { 
    title: 'Date Added', 
    dataIndex: 'createdAt', 
    key: 'createdAt', 
    render: (d) => (d ? new Date(d).toLocaleDateString() : 'N/A') 
},
        {
            title: 'Actions', key: 'actions', width: 60, align: 'center',
            render: (_, record) => <Dropdown menu={{ items: actionMenuItems(record) }} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown>,
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>🎵 Manage Songs</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/admin/songs/add')}>Add Song</Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}><Card><Statistic title="Total Songs" value={stats.total} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="Active" value={stats.active} valueStyle={{ color: '#10b981' }} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="Featured" value={stats.featured} valueStyle={{ color: '#f59e0b' }} /></Card></Col>
                <Col xs={12} sm={6}><Card><Statistic title="Total Plays" value={formatNumber(stats.totalPlays)} valueStyle={{ color: '#ef4444' }} prefix={<FireOutlined />} /></Card></Col>
            </Row>

            <Card>
                <Space>
                    <Search
                        placeholder="Search songs, artists..."
                        allowClear
                        enterButton
                        size="large"
                        style={{ width: 320 }}
                        onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
                    />
                    <Button icon={<FilterOutlined />} size="large" onClick={() => setFiltersVisible(true)}>Filters</Button>
                </Space>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={songs}
                    rowKey="_id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                />
            </Card>

            <Drawer title="Advanced Filters" open={filtersVisible} onClose={() => setFiltersVisible(false)} width={400}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Select placeholder="Genre" allowClear style={{ width: '100%' }} value={filters.genre} onChange={(v) => setFilters(p => ({ ...p, genre: v }))}>
                        <Option value="Pop">Pop</Option><Option value="Rock">Rock</Option><Option value="Bollywood">Bollywood</Option>
                    </Select>
                    <Select placeholder="Language" allowClear style={{ width: '100%' }} value={filters.language} onChange={(v) => setFilters(p => ({ ...p, language: v }))}>
                        <Option value="English">English</Option><Option value="Hindi">Hindi</Option><Option value="Gujarati">Gujarati</Option>
                    </Select>
                    <Select placeholder="Status" allowClear style={{ width: '100%' }} value={filters.status} onChange={(v) => setFilters(p => ({ ...p, status: v }))}>
                        <Option value="active">Active</Option><Option value="inactive">Inactive</Option><Option value="pending">Pending</Option>
                    </Select>
                    <Select placeholder="Featured" allowClear style={{ width: '100%' }} value={filters.featured} onChange={(v) => setFilters(p => ({ ...p, featured: v }))}>
                        <Option value="true">Featured</Option><Option value="false">Not Featured</Option>
                    </Select>
                </Space>
            </Drawer>

<Modal
  title="Song Preview"
  open={!!previewSong}
  onCancel={() => setPreviewSong(null)}
  footer={null}
  width={700}
  destroyOnClose // Add this to stop audio when modal is closed
>
  {previewSong && (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space align="start" size="large">
        <Image
          src={previewSong.coverUrl}
          width={200}
          style={{ borderRadius: 8 }}
        />
        <div>
          <Title level={3}>{previewSong.title}</Title>
          <Text strong>Artist:</Text> <Text>{previewSong.artist}</Text>
          <br />
          
          <br />
          <Text strong>Duration:</Text> <Text>{formatDuration(previewSong.duration)}</Text>
        </div>
      </Space>

      {/* ✨ ADD THIS SECTION TO PLAY THE SONG ✨ */}
      <Divider />
      <audio
        controls
        src={previewSong.audioFile?.secureUrl || previewSong.audioFile?.url}
        style={{ width: '100%' }}
      >
        Your browser does not support the audio element.
      </audio>
      {/* ✨ END OF ADDED SECTION ✨ */}
      
    </Space>
  )}
</Modal>


        </Space>
    );
};

export default AdminSongs;