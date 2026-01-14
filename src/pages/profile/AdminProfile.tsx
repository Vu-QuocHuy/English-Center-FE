import React from 'react';
import UserProfile from '@shared/components/profile/UserProfile';

const AdminProfile: React.FC = () => {
  return <UserProfile role="admin" roleLabel="Quản trị viên" />;
};

export default AdminProfile;
