import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Skeleton
} from '@mui/material';
import { getHomeBannersAPI } from '../../../../services/advertisements';
import { Advertisement } from '../../../../types';
import { useBannerConfig } from '../../../../hooks/useBannerConfig';
import AdvertisementSlider from '../../../../components/features/advertisement/AdvertisementSlider';
import ClassRegistrationModal from '../../../../components/features/home/ClassRegistrationModal';

const BannerCarousel: React.FC = () => {
  const { bannerConfig } = useBannerConfig();

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>('');

  // Fetch advertisements data
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getHomeBannersAPI(10);

        // Handle different response formats
        let bannerAds = [];
        if (response.data?.data?.result) {
          bannerAds = response.data.data.result;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Handle case where response.data.data is an array directly
          bannerAds = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where response.data is an object with advertisements
          bannerAds = (response.data as any).result || (response.data as any).advertisements || [];
        } else if (Array.isArray(response.data)) {
          bannerAds = response.data;
        }

        // Map và normalize data để đảm bảo classId được giữ lại
        const normalizedBanners = bannerAds.map((ad: any) => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          content: ad.content || ad.description,
          imageUrl: ad.imageUrl,
          image: ad.imageUrl,
          priority: ad.priority,
          createdAt: ad.createdAt,
          type: ad.type,
          isActive: ad.isActive,
          classId: ad.classId || null, // 🎯 Đảm bảo classId được map
        }));

        // Filter active banners only
        const activeBanners = normalizedBanners.filter((ad: any) => ad.isActive !== false);

        const finalBanners = activeBanners.slice(0, bannerConfig.maxSlides);

        setAdvertisements(finalBanners);
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setError('Không thể tải quảng cáo');
        setAdvertisements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, [bannerConfig.maxSlides]);

  if (loading) {
    return (
      <Box sx={{ height: bannerConfig.height, position: 'relative' }}>
        <Skeleton variant="rectangular" height="100%" />
      </Box>
    );
  }

  // Debug render conditions


  if (error || advertisements.length === 0 || !bannerConfig.isActive) {
    return (
      <Box sx={{
        height: bannerConfig.height,
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h6" color="text.secondary">
          {error || 'Chưa có quảng cáo' || 'Banner đã bị tắt'}
        </Typography>
      </Box>
    );
  }

  const handleRegisterClick = (classId: string | null, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setModalOpen(true);
  };

  return (
    <>
      <Box sx={{ position: 'relative', mb: 4, pt: 0 }}>
        <AdvertisementSlider
          ads={advertisements}
          autoPlay={bannerConfig.autoPlay}
          interval={bannerConfig.interval}
          showArrows={bannerConfig.showArrows}
          showDots={bannerConfig.showDots}
          height={bannerConfig.height}
          onRegisterClick={handleRegisterClick}
        />
      </Box>

      <ClassRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classId={selectedClassId}
        className={selectedClassName}
      />
    </>
  );
};

export default BannerCarousel;
