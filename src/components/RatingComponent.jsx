import { useState, useEffect } from 'react';
import { Rate, Typography, message } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import api from '../../utils/api';
import './RatingComponent.scss';

const { Text } = Typography;

const RatingComponent = ({ songId, showText = true, size = 'default' }) => {
  const [userRating, setUserRating] = useState(0);
  const [songRating, setSongRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (songId) {
      fetchRatings();
    }
  }, [songId]);

  const fetchRatings = async () => {
    try {
      const [userRatingRes, songRatingRes] = await Promise.all([
        api.get(`/ratings/${songId}/user`).catch(() => ({ data: { data: { rating: null } } })),
        api.get(`/ratings/${songId}`)
      ]);

      setUserRating(userRatingRes.data.data.rating || 0);
      setSongRating({
        average: songRatingRes.data.data.average || 0,
        count: songRatingRes.data.data.count || 0
      });
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRating = async (value) => {
    if (loading) return;

    try {
      setLoading(true);
      
      if (value === 0) {
        await api.delete(`/ratings/${songId}`);
        setUserRating(0);
        message.success('Rating removed');
      } else {
        const response = await api.post(`/ratings/${songId}`, { rating: value });
        setUserRating(value);
        setSongRating(response.data.data.songRatings);
        message.success(userRating ? 'Rating updated' : 'Rating added');
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      message.error('Failed to update rating');
    } finally {
      setLoading(false);
    }
  };

  const getRateSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };

  return (
    <div className={`rating-component ${size}`}>
      <div className="user-rating">
        <Rate
          value={userRating}
          onChange={handleRating}
          character={<StarFilled />}
          style={{ fontSize: getRateSize() }}
          disabled={loading}
          allowClear
        />
        {showText && userRating > 0 && (
          <Text type="secondary" className="rating-text">
            Your rating: {userRating}/5
          </Text>
        )}
      </div>
      
      {showText && songRating.count > 0 && (
        <div className="song-rating">
          <div className="average-rating">
            <Rate
              value={songRating.average}
              disabled
              allowHalf
              character={<StarOutlined />}
              style={{ fontSize: getRateSize() * 0.8 }}
            />
            <Text type="secondary" className="average-text">
              {songRating.average.toFixed(1)} ({songRating.count} {songRating.count === 1 ? 'rating' : 'ratings'})
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingComponent;