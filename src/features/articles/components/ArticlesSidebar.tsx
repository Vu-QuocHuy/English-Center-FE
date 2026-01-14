import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CircularProgress,
  Divider
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

interface ArticlesSidebarProps {
  menuId?: string;
  limit?: number;
  title?: string;
  showContent?: boolean;
}

const ArticlesSidebar: React.FC<ArticlesSidebarProps> = ({
  menuId,
  limit = 5,
  title = 'Bài viết mới',
  showContent = false
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await getAllArticlesAPI({
          page: 1,
          limit,
          filters: menuId ? { menuId } : undefined
        });
        const articlesList = response.data?.data?.result || [];
        
        // Filter active articles and sort by order/createdAt
        const activeArticles = articlesList
          .filter((article: Article) => article.isActive !== false)
          .sort((a: Article, b: Article) => {
            const orderA = a.order || 999;
            const orderB = b.order || 999;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .slice(0, limit);

        setArticles(activeArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [menuId, limit]);

  const truncateContent = (html: string, maxLength: number = 100) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {articles.map((article) => (
        <Card
          key={article.id}
          sx={{
            mb: 2,
            overflow: 'hidden',
            '&:hover': {
              boxShadow: 3,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <CardActionArea
            onClick={() => {
              navigate(`/bai-viet/${article.id}`);
            }}
            sx={{ display: 'flex', alignItems: 'stretch', flexDirection: { xs: 'column', sm: 'row' } }}
          >
            {/* Article Image */}
            {article.file && (
              <CardMedia
                component="img"
                image={article.file}
                alt={article.title}
                sx={{
                  width: { xs: '100%', sm: 200 },
                  height: { xs: 200, sm: 'auto' },
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
            )}
            
            {/* Article Content */}
            <CardContent sx={{ flex: 1, p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  color: 'primary.main',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  '&:hover': {
                    textDecoration: 'underline'
                  },
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {article.title}
              </Typography>
              {showContent && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 1,
                    lineHeight: 1.6
                  }}
                >
                  {truncateContent(article.content, 150)}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {new Date(article.createdAt).toLocaleDateString('vi-VN')}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
};

export default ArticlesSidebar;