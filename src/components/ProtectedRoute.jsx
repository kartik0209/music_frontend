import { Navigate } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import './ProtectedRoute.scss';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="protected-route-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="protected-route-unauthorized">
        <Alert
          message="Access Denied"
          description={`You need ${requiredRole} privileges to access this page. Your current role: ${user?.role || 'unknown'}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;