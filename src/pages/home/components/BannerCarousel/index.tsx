import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Skeleton, CircularProgress
} from '@mui/material';
import { getHomeBannersAPI } from '@features/advertisements';
import { Advertisement } from '@shared/types';
import { useBannerConfig } from '@features/advertisements';
import { AdvertisementSlider } from '@features/advertisements';
import { ClassRegistrationModal } from '@features/home';
import { getClassBannerInfoAPI } from '@features/classes';

const BannerCarousel: React.FC = () => {
  const { bannerConfig } = useBannerConfig();

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [loadingBannerInfo, setLoadingBannerInfo] = useState(false);

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

  const handleRegisterClick = async (classId: string | null, className: string) => {
    if (!classId) {
      // Nếu không có classId, mở modal đăng ký tư vấn chung
      setSelectedClassId(null);
      setSelectedClassName(className);
      setModalOpen(true);
      return;
    }

    // Nếu có classId, gọi API banner-info trước
    try {
      setLoadingBannerInfo(true);
      const response = await getClassBannerInfoAPI(classId);
      const bannerInfo = response?.data?.data || response?.data;
      
      if (bannerInfo?.id) {
        // Lấy classId từ response (data.id)
        setSelectedClassId(bannerInfo.id);
        setSelectedClassName(bannerInfo.name || className);
        setModalOpen(true);
      } else {
        // Fallback: dùng classId ban đầu nếu không có id trong response
        setSelectedClassId(classId);
        setSelectedClassName(className);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching banner info:', error);
      // Fallback: vẫn mở modal với classId ban đầu nếu API lỗi
      setSelectedClassId(classId);
      setSelectedClassName(className);
      setModalOpen(true);
    } finally {
      setLoadingBannerInfo(false);
    }
  };

  return (
    <>
      {loadingBannerInfo && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Đang tải thông tin lớp học...</Typography>
          </Box>
        </Box>
      )}
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
        onClose={() => {
          setModalOpen(false);
          setSelectedClassId(null);
          setSelectedClassName('');
        }}
        classId={selectedClassId}
        className={selectedClassName}
      />
    </>
  );
};

export default BannerCarousel;
