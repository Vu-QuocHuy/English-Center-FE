import { useState, useEffect } from 'react';

// Types for homepage sections
interface HomepageSection {
  id: string;
  type: 'banner' | 'about' | 'featured-teachers' | 'testimonials' | 'statistics' | 'latest-posts' | 'events';
  title: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
  content: any;
}

interface HomepageSectionData {
  type: 'banner' | 'about' | 'featured-teachers' | 'testimonials' | 'statistics' | 'latest-posts' | 'events';
  title: string;
  subtitle?: string;
  isActive?: boolean;
  order?: number;
  content: any;
}

export const useHomepageManagement = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);

  // Fixed sections configuration - NO API NEEDED
  const fixedSections = [
    {
      type: 'banner' as const,
      title: 'Banner Carousel',
      description: 'Banner quảng cáo tự động chuyển',
      defaultContent: {
        slides: []
      }
    },
    {
      type: 'about' as const,
      title: 'Giới thiệu',
      description: 'Thông tin về trung tâm',
      defaultContent: {
        title: 'Về Trung tâm Anh ngữ',
        subtitle: 'Hơn 10 năm kinh nghiệm trong lĩnh vực giáo dục',
        description: 'Trung tâm Anh ngữ được thành lập với sứ mệnh mang đến chất lượng đào tạo tiếng Anh tốt nhất cho học viên Việt Nam.',
        features: [
          { id: '1', title: 'Giảng viên chất lượng', description: '100% giảng viên có bằng cấp quốc tế', icon: 'school', order: 1 },
          { id: '2', title: 'Phương pháp hiện đại', description: 'Áp dụng công nghệ AI và phương pháp học tập tiên tiến', icon: 'people', order: 2 },
          { id: '3', title: 'Cam kết chất lượng', description: 'Đảm bảo kết quả học tập cho mọi học viên', icon: 'star', order: 3 }
        ]
      }
    },
    {
      type: 'featured-teachers' as const,
      title: 'Giảng viên nổi bật',
      description: 'Danh sách giảng viên tiêu biểu',
      defaultContent: {
        title: 'Giảng viên nổi bật',
        subtitle: 'Đội ngũ giảng viên giàu kinh nghiệm và chuyên môn cao',
        teachers: []
      }
    },
    {
      type: 'testimonials' as const,
      title: 'Đánh giá học viên',
      description: 'Feedback từ học viên',
      defaultContent: {
        title: 'Đánh giá từ học viên',
        subtitle: 'Những chia sẻ chân thực từ học viên của chúng tôi',
        testimonials: [
          {
            id: '1',
            name: 'Nguyễn Văn A',
            role: 'Học viên IELTS',
            content: 'Sau 6 tháng học tại trung tâm, tôi đã đạt được IELTS 7.0. Giảng viên rất tận tâm và phương pháp học hiệu quả.',
            rating: 5,
            avatar: '/images/student1.jpg',
            isActive: true,
            order: 1
          }
        ]
      }
    },
    {
      type: 'statistics' as const,
      title: 'Thống kê',
      description: 'Số liệu thống kê trung tâm',
      defaultContent: {
        statistics: [
          { id: '1', number: '1000+', label: 'Học viên', icon: 'people', order: 1 },
          { id: '2', number: '50+', label: 'Giảng viên', icon: 'school', order: 2 },
          { id: '3', number: '95%', label: 'Hài lòng', icon: 'star', order: 3 },
          { id: '4', number: '10+', label: 'Năm kinh nghiệm', icon: 'trending', order: 4 }
        ]
      }
    },
    {
      type: 'latest-posts' as const,
      title: 'Bài viết mới nhất',
      description: 'Tin tức và bài viết',
      defaultContent: {
        title: 'Bài viết mới nhất',
        subtitle: 'Cập nhật tin tức và thông tin mới nhất từ trung tâm',
        posts: []
      }
    },
    {
      type: 'events' as const,
      title: 'Sự kiện',
      description: 'Các sự kiện và hoạt động',
      defaultContent: {
        title: 'Sự kiện mới nhất',
        subtitle: 'Các sự kiện và hoạt động sắp diễn ra tại trung tâm',
        events: []
      }
    }
  ];

  // Initialize sections with default content - NO API CALL
  const initializeSections = () => {
    const defaultSections = fixedSections.map((section, index) => ({
      id: `section-${index + 1}`,
      type: section.type,
      title: section.title,
      subtitle: section.description,
      isActive: true,
      order: index + 1,
      content: section.defaultContent
    }));
    setSections(defaultSections);
  };

  const getSectionByType = (type: string): HomepageSection | null => {
    return sections.find(section => section.type === type) || null;
  };

  // Update section locally - NO API CALL
  const updateSection = (type: string, data: Partial<HomepageSectionData>) => {
    setSections(prev => prev.map(section =>
      section.type === type ? { ...section, ...data } : section
    ));
  };

  // Toggle section locally - NO API CALL
  const toggleSection = (type: string, isActive: boolean) => {
    setSections(prev => prev.map(section =>
      section.type === type ? { ...section, isActive } : section
    ));
  };

  const getSectionConfig = (type: string) => {
    return fixedSections.find(section => section.type === type);
  };

  useEffect(() => {
    initializeSections();
  }, []);

  return {
    sections,
    fixedSections,
    getSectionByType,
    updateSection,
    toggleSection,
    getSectionConfig
  };
};
