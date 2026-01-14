import { useState, useEffect } from 'react';
import { getFooterSettingsAPI, type FooterSettings } from '@features/footer-settings';

export const useFooterSettings = () => {
  // Default configuration
  const emptySettings: FooterSettings = {
    companyName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    facebookUrl: '',
    youtubeUrl: '',
    zaloUrl: '',
    mapEmbedUrl: ''
  };

  const [footerSettings, setFooterSettings] = useState<FooterSettings>(emptySettings);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  // Load configuration from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFooterSettingsAPI();
        // Backend wrap response trong { statusCode, message, data }
        const settingsData = (response as any).data?.data || (response as any).data;
        if (settingsData) {
          setFooterSettings(settingsData);
          setHasData(true); // Có dữ liệu từ API
        } else {
          setFooterSettings(emptySettings);
          setHasData(false);
        }
      } catch (error: any) {
        console.error('Error loading footer settings:', error);
        // Nếu lỗi 404 thì chưa có data, giữ default values
        if (error?.response?.status !== 404) {
        setError('Failed to load footer settings');
        }
        setFooterSettings(emptySettings);
        setHasData(false);
        // Clear data on error to avoid showing stale defaults
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return {
    footerSettings,
    loading,
    error,
    hasData
  };
};
