import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfileRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to current user's profile
        navigate(`/profile/${user.id}`, { replace: true });
      } else {
        // Redirect to login if not authenticated
        navigate('/forums/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

export default ProfileRedirect;
