import React from 'react';
import {
  Box, Container,
} from '@mui/material';
// Import components
import BannerCarousel from './components/BannerCarousel';
import FeedbackHome from '../../components/features/home/FeedbackHome';
import FeaturedTeachersHome from '../../components/features/home/FeaturedTeachersHome';
import HomeWelcomeAdPopup from './components/WelcomeAdPopup';
import PublicLayout from '../../components/layouts/PublicLayout';
import ArticlesHome from '../../components/features/home/ArticlesHome';

const InteractiveHome: React.FC = () => {
  return (
    <PublicLayout>
      {/* Welcome Ad Popup */}
      <HomeWelcomeAdPopup />

      {/* Banner Carousel Section - Start right below header (72px) */}
      <Box sx={{ mt: '-72px', pt: '72px' }}>
        <BannerCarousel />
      </Box>

      {/* Featured Teachers Section */}
      <Box id="teachers-section" sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <FeaturedTeachersHome />
        </Container>
      </Box>

      {/* Articles Section */}
      <Box id="articles-section" sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth={false} sx={{ maxWidth: '1100px' }}>
          <ArticlesHome />
        </Container>
      </Box>

      {/* Student Testimonials Section */}
      <Box id="contact-section" sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <FeedbackHome />
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default InteractiveHome;
