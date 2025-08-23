import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './Login.scss';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Clear error when component mounts
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (values) => {
    setLoading(true);
    const success = await login({
      login: values.login,
      password: values.password
    });
    
    if (success) {
      // Navigation will be handled by useEffect above
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <div className="logo">
            
            <Title level={2} className="logo-text">MusicApp</Title>
          </div>
          <Text className="subtitle">Welcome back! Sign in to your account</Text>
        </div>

        <Card className="login-card">
          {error && (
            <Alert
              message="Login Failed"
              description={error}
              type="error"
              closable
              onClose={clearError}
              className="login-error"
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="login"
              label="Username or Email"
              rules={[
                {
                  required: true,
                  message: 'Please input your username or email!',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter username or email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                className="login-btn"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <Text>
              Don't have an account? <Link to="/register">Create one now</Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;