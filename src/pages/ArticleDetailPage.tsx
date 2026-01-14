import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getArticleByIdAPI } from '@features/articles';
import PublicLayout from '@shared/components/layouts/PublicLayout';
import { Button } from '@mui/material';

interface Article {
  id: string;
  title: string;
  content: string;
  menuId: string;
  menu?: {
    id: string;
    title: string;
    slug?: string;
  };
  order?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top when component mounts or article id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError('Không tìm thấy bài viết');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getArticleByIdAPI(id);
        const articleData = response.data?.data || response.data;
        
        if (!articleData) {
          setError('Không tìm thấy bài viết');
          return;
        }

        setArticle(articleData);
        // Scroll to top after article is loaded
        window.scrollTo(0, 0);
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.response?.data?.message || 'Không thể tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        </Container>
      </PublicLayout>
    );
  }

  if (error || !article) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Không tìm thấy bài viết'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Trang chủ
          </Link>
          {article.menu && article.menu.title?.toLowerCase() !== 'trang chủ' && (
            <Typography color="text.primary" sx={{ textTransform: 'capitalize' }}>
              {article.menu.title}
            </Typography>
          )}
          <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
            {article.title}
          </Typography>
        </Breadcrumbs>

        {/* Main Content */}
        <Box>
          {/* Article Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                lineHeight: 1.3
              }}
            >
              {article.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
              {article.menu && (
                <Chip
                  label={article.menu.title}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Typography variant="body2" color="text.secondary">
                {new Date(article.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
          </Box>

          {/* Article Content */}
          <Box
            sx={{
              '& p': {
                mb: 2,
                lineHeight: 1.8,
                fontSize: '1.1rem',
                color: 'text.primary'
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                mt: 3,
                mb: 2,
                fontWeight: 'bold',
                color: 'text.primary'
              },
              '& h2': {
                fontSize: '1.75rem',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              },
              '& h3': {
                fontSize: '1.5rem'
              },
              '& ul, & ol': {
                mb: 2,
                pl: 3
              },
              '& li': {
                mb: 1,
                lineHeight: 1.8
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 1,
                my: 2
              },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                pl: 2,
                ml: 2,
                fontStyle: 'italic',
                color: 'text.secondary',
                my: 2
              },
              '& code': {
                backgroundColor: 'grey.100',
                padding: '2px 6px',
                borderRadius: 1,
                fontSize: '0.9em'
              },
              '& pre': {
                backgroundColor: 'grey.100',
                padding: 2,
                borderRadius: 1,
                overflow: 'auto',
                my: 2
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                my: 2
              },
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                padding: 1,
                textAlign: 'left'
              },
              '& th': {
                backgroundColor: 'grey.100',
                fontWeight: 'bold'
              }
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Box>

        {/* Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Quay lại
        </Button>
      </Container>
    </PublicLayout>
  );
};

export default ArticleDetailPage;

