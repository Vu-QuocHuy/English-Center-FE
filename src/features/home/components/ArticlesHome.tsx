import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CircularProgress,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllArticlesAPI } from '@features/articles';

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

const ArticlesHome: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await getAllArticlesAPI({
          page: 1,
          limit: 6
        });
        const articlesList = response.data?.data?.result || [];
        
        // Filter active articles and sort by createdAt (newest first)
        const activeArticles = articlesList
          .filter((article: Article) => article.isActive !== false)
          .sort((a: Article, b: Article) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .slice(0, 6);

        setArticles(activeArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Decode HTML entities and strip tags for a clean preview
  const decodeAndStrip = (html: string): string => {
    if (!html) return '';
    const parser = new DOMParser();
    const decoded = parser.parseFromString(html, 'text/html').documentElement.textContent || '';
    return decoded.replace(/<[^>]*>/g, '').trim();
  };

  const truncateContent = (html: string, maxLength: number = 100) => {
    const text = decodeAndStrip(html);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4, 
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000'
        }}
      >
        Bài viết mới nhất
      </Typography>
      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={article.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardActionArea
                onClick={() => {
                  navigate(`/bai-viet/${article.id}`);
                }}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  height: '100%'
                }}
              >
                {/* Article Image */}
                {article.file && (
                  <CardMedia
                    component="img"
                    image={article.file}
                    alt={article.title}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                )}
                
                {/* Article Content */}
                <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      mb: 1.5,
                      color: '#000',
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flexGrow: 1
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
                      lineHeight: 1.6,
                      flexGrow: 1
                    }}
                  >
                    {truncateContent(article.content, 120)}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ display: 'block', mt: 'auto' }}
                  >
                    {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ArticlesHome;
