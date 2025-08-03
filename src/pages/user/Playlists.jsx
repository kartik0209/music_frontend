import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, Empty, List, Avatar } from 'antd';
import { PlusOutlined, PlayCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);

  return (
    <div className="playlists-container fade-in">
      <div className="playlists-header">
        <Title level={2}>🎧 My Playlists</Title>
        <Text className="playlists-subtitle">
          Create and manage your music playlists
        </Text>
        <Button type="primary" icon={<PlusOutlined />} size="large" disabled>
          Create Playlist
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Empty
            image={<UnorderedListOutlined style={{ fontSize: 64, color: '#d1d5db' }} />}
            description={
              <div>
                <Text>No playlists yet</Text>
                <br />
                <Text type="secondary">Create your first playlist to organize your favorite songs</Text>
              </div>
            }
          >
            <Button type="primary" icon={<PlusOutlined />} disabled>
              Create Your First Playlist
            </Button>
          </Empty>
        </Col>
      </Row>
    </div>
  );
};

export default Playlists ;