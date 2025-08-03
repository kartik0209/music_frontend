import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Select, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './Resgister.scss';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, user, error, clearError } = useAuth();
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
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    const success = await register({
      username: values.username,
      email: values.email,
      password: values.password,
      role: values.role
    });
    
    if (success) {
      // Navigation will be handled by useEffect above
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-header">
          <div className="logo">
            {/* <MusicOutlined className="logo-icon" /> */}
            <Title level={2} className="logo-text">MusicApp</Title>
          </div>
          <Text className="subtitle">Create your account</Text>
        </div>

        <Card className="register-card">
          {error && (
            <Alert
              message="Registration Failed"
              description={error}
              type="error"
              closable
              onClose={clearError}
              className="register-error"
            />
          )}

          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
            initialValues={{ role: 'user' }}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                {
                  required: true,
                  message: 'Please input your username!',
                },
                {
                  min: 3,
                  message: 'Username must be at least 3 characters!',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter username"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: 'Please input your email!',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email!',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Account Type"
              rules={[
                {
                  required: true,
                  message: 'Please select an account type!',
                },
              ]}
            >
              <Select size="large" placeholder="Select account type">
                <Option value="user">User (Listen to music)</Option>
                <Option value="admin">Admin (Manage music)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
                {
                  min: 6,
                  message: 'Password must be at least 6 characters!',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
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
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <div className="register-footer">
            <Text>
              Already have an account? <Link to="/login">Sign in</Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;