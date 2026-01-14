import React from 'react';
import UserProfile from '@shared/components/profile/UserProfile';

const StudentProfile: React.FC = () => {
  return <UserProfile role="student" roleLabel="Học sinh" />;
};

export default StudentProfile;
