import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface Article {
  id: string;
  title: string;
  content: string;
  menuId: string;
  menu?: {
    id: string;
    title: string;
    slug?: string;
    order?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
  };
  order?: number;
  isActive?: boolean;
  file?: string;
  publicId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticleTableProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (articleId: string) => void;
  onToggleActive: (article: Article) => void;
  menuItems: Array<{ id: string; title: string }>;
  loading?: boolean;
}

const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  onEdit,
  onDelete,
  onToggleActive,
  menuItems,
  loading = false
}) => {
  const theme = useTheme();

  const getMenuTitle = (article: Article): string => {
    // Ưu tiên sử dụng menu object từ API response
    if (article.menu?.title) {
      return article.menu.title;
    }
    // Fallback: tìm trong menuItems array
    const menu = menuItems.find(m => m.id === article.menuId);
    return menu?.title || 'Không xác định';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (articles.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có bài viết nào</Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={2}
      sx={{
        backgroundColor: 'white',
        '& .MuiTableBody-root .MuiTableCell-root': {
          color: 'black !important'
        },
        '& .MuiTableBody-root .MuiTypography-root': {
          color: 'inherit !important'
        }
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Tiêu đề</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Menu</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thứ tự</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Ngày tạo</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {articles && Array.isArray(articles) && articles.map((article) => (
            <TableRow key={article.id} hover sx={{
              '& .MuiTableCell-root': { color: '#000000 !important' },
              '& .MuiTypography-root': { color: '#000000 !important' },
              '& .MuiTableCell-root .MuiTypography-root': { color: '#000000 !important' },
              '& .MuiTableCell-root > *:not(.MuiSvgIcon-root):not(.MuiIconButton-root):not(.MuiChip-root)': {
                color: '#000000 !important'
              }
            }}>
              <TableCell>
                <Typography 
                  variant="body1" 
                  fontWeight="medium"
                  sx={{
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={article.title}
                >
                  {article.title}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {getMenuTitle(article)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {article.order || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={article.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  size="small"
                  color={article.isActive ? 'success' : 'default'}
                  variant={article.isActive ? 'filled' : 'outlined'}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {article.createdAt
                    ? new Date(article.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })
                    : 'Chưa cập nhật'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => onToggleActive(article)}
                    sx={{ color: article.isActive ? 'warning.main' : 'success.main' }}
                    title={article.isActive ? 'Ẩn bài viết' : 'Hiện bài viết'}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(article)}
                    sx={{ color: 'grey.600' }}
                    title="Chỉnh sửa"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(article.id)}
                    sx={{ color: '#f44336' }}
                    title="Xóa"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {(!articles || !Array.isArray(articles) || articles.length === 0) && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.primary' }}>
                <Typography variant="body2" color="text.secondary">
                  Không có dữ liệu bài viết
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ArticleTable;

