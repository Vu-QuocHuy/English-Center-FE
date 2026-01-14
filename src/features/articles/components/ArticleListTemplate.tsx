import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllArticlesAPI, getArticlesByMenuIdAPI } from '@features/articles';
import ArticlesSidebar from './ArticlesSidebar';

interface Article {
  id: string;
  title: string;
  content: string;
  menuId: string;
  order?: number;
  isActive?: boolean;
  file?: string;
  publicId?: string;
  createdAt: string;
}

interface ArticleListTemplateProps {
  menuId?: string;
  title?: string;
}

const ArticleListTemplate: React.FC<ArticleListTemplateProps> = ({ menuId, title }) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = menuId
          ? await getArticlesByMenuIdAPI(menuId)
          : await getAllArticlesAPI({ page: 1, limit: 20 });

        const articlesList = menuId
          ? response.data?.data?.result || []
          : response.data?.data?.result || [];

        // Filter active articles and sort by createdAt (newest first)
        const activeArticles = articlesList
          .filter((article: Article) => article.isActive !== false)
          .sort((a: Article, b: Article) => {
            // Sort by order first, then by createdAt
            const orderA = a.order || 999;
            const orderB = b.order || 999;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

        setArticles(activeArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [menuId]);

  // Decode HTML entities and strip tags for a clean preview
  const decodeAndStrip = (html: string): string => {
    if (!html) return '';
    const parser = new DOMParser();
    const decoded = parser.parseFromString(html, 'text/html').documentElement.textContent || '';
    return decoded.replace(/<[^>]*>/g, '').trim();
  };

  const truncateContent = (html: string, maxLength: number = 150) => {
    const text = decodeAndStrip(html);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Nếu không có bài viết, không hiển thị gì
  if (articles.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content - Left Column (8 columns) */}
        <Grid item xs={12} md={8}>
          {title && (
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#000' }}>
              {title}
            </Typography>
          )}
          
          <Box>
            {articles.map((article) => (
              <Card
                key={article.id}
                sx={{
                  mb: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/bai-viet/${article.id}`)}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'stretch'
                  }}
                >
                  {/* Article Image */}
                  {article.file && (
                    <CardMedia
                      component="img"
                      image={article.file}
                      alt={article.title}
                      sx={{
                        width: { xs: '100%', sm: 300 },
                        height: { xs: 200, sm: 200 },
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                  )}
                  
                  {/* Article Content */}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1.5,
                        color: '#000',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {article.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1.5,
                        lineHeight: 1.6
                      }}
                    >
                      {truncateContent(article.content, 200)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Sidebar - Right Column (4 columns) */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            {/* TÀI LIỆU HỌC TẬP Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  color: 'primary.main',
                  textTransform: 'uppercase',
                  fontSize: '1rem'
                }}
              >
                TÀI LIỆU HỌC TẬP
              </Typography>
              <ArticlesSidebar
                menuId={menuId}
                limit={5}
                title=""
                showContent={false}
              />
            </Box>

            {/* KẾT QUẢ HỌC VIÊN Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  color: 'primary.main',
                  textTransform: 'uppercase',
                  fontSize: '1rem'
                }}
              >
                KẾT QUẢ HỌC VIÊN
              </Typography>
              {/* You can add student results component here later */}
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="body2">
                  Nội dung đang được cập nhật
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ArticleListTemplate;
