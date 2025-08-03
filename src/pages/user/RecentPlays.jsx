import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Empty, List, Avatar, Tag, Button } from 'antd';
import { ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const RecentPlays = () => {
  const [recentPlays, setRecentPlays] = useState([]);

  return (
    <div className="recent-plays-container fade-in">
      <div className="recent-header">
        <Title level={2}>🕒 Recent Plays</Title>
        <Text className="recent-subtitle">
          Your recently played songs
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Empty
              image={<ClockCircleOutlined style={{ fontSize: 64, color: '#d1d5db' }} />}
              description={
                <div>
                  <Text>No recent plays</Text>
                  <br />
                  <Text type="secondary">Start listening to music to see your history here</Text>
                </div>
              }
            >
              <Button type="primary" href="/music" disabled>
                Start Listening
              </Button>
            </Empty>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RecentPlays ;