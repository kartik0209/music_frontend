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

  // Role-based access control
  if (requiredRole) {
    // If user role doesn't match required role
    if (user?.role !== requiredRole) {
      // Redirect admin to admin panel and user to dashboard
      if (user?.role === 'admin' && requiredRole === 'user') {
        return <Navigate to="/admin" replace />;
      } else if (user?.role === 'user' && requiredRole === 'admin') {
        return <Navigate to="/dashboard" replace />;
      }
      
      // Fallback unauthorized message
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
  }

  return children;
};

export default ProtectedRoute;