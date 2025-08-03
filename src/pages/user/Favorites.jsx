import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Empty, Button, List, Avatar, Tag } from 'antd';
import { HeartOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  return (
    <div className="favorites-container fade-in">
      <div className="favorites-header">
        <Title level={2}>❤️ My Favorites</Title>
        <Text className="favorites-subtitle">
          Your liked songs collection
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Empty
              image={<HeartOutlined style={{ fontSize: 64, color: '#d1d5db' }} />}
              description={
                <div>
                  <Text>No favorite songs yet</Text>
                  <br />
                  <Text type="secondary">Like songs to add them to your favorites</Text>
                </div>
              }
            >
              <Button type="primary" href="/music" disabled>
                Browse Music
              </Button>
            </Empty>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Favorites ;