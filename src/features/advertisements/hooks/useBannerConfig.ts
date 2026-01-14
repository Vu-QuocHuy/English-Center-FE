import { useState, useEffect } from 'react';

export interface BannerConfig {
  height: number;
  autoPlay: boolean;
  interval: number;
  maxSlides: number;
  showArrows: boolean;
  showDots: boolean;
  isActive: boolean;
}

export interface PopupConfig {
  width: number;
  height: number;
  showOnFirstVisit: boolean;
  showDelay: number;
  isActive: boolean;
}

export const useBannerConfig = () => {
  // Default configurations - Fixed aspect ratios
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>({
    height: 700, // Banner height
    autoPlay: true,
    interval: 8000,
    maxSlides: 5,
    showArrows: true,
    showDots: true,
    isActive: true
  });

  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    width: 600, // 4:3 ratio
    height: 500, // 4:3 ratio
    showOnFirstVisit: true,
    showDelay: 2000,
    isActive: true
  });

  // Load configurations from localStorage or API
  useEffect(() => {
    const loadConfigs = () => {
      try {
        const savedBannerConfig = localStorage.getItem('bannerConfig');
        const savedPopupConfig = localStorage.getItem('popupConfig');

        if (savedBannerConfig) {
          setBannerConfig(JSON.parse(savedBannerConfig));
        }

        if (savedPopupConfig) {
          setPopupConfig(JSON.parse(savedPopupConfig));
        }
      } catch (error) {
        console.error('Error loading banner configurations:', error);
      }
    };

    loadConfigs();
  }, []);

  // Save configurations to localStorage
  const saveBannerConfig = (config: BannerConfig) => {
    try {
      localStorage.setItem('bannerConfig', JSON.stringify(config));
      setBannerConfig(config);
    } catch (error) {
      console.error('Error saving banner configuration:', error);
    }
  };

  const savePopupConfig = (config: PopupConfig) => {
    try {
      localStorage.setItem('popupConfig', JSON.stringify(config));
      setPopupConfig(config);
    } catch (error) {
      console.error('Error saving popup configuration:', error);
    }
  };

  return {
    bannerConfig,
    popupConfig,
    saveBannerConfig,
    savePopupConfig
  };
};
