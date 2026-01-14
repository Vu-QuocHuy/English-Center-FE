import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  useTheme,
  Theme,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs, { Dayjs } from 'dayjs';
import { styled } from '@mui/material/styles';
import 'dayjs/locale/vi';
import updateLocale from 'dayjs/plugin/updateLocale';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Cấu hình dayjs để sử dụng tiếng Việt và plugin updateLocale
dayjs.extend(updateLocale);
dayjs.updateLocale('vi', {
  weekdays: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  weekdaysShort: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  months: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  formats: {
    L: 'DD/MM/YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd, D MMMM YYYY HH:mm',
    calendarHeader: 'MMMM [Năm] YYYY',
  },
});
dayjs.locale('vi');

interface Lesson {
  date: string;
  className: string;
  time: string;
  room?: string;
  teacher?: string;
  type?: string;
}

interface CustomCalendarHeaderProps {
  currentMonth: Dayjs;
  onMonthChange: (date: Dayjs, direction: 'left' | 'right') => void;
}

interface ServerDayProps {
  day: Dayjs;
  lessons: Lesson[];
  userType: 'teacher' | 'student';
  selected?: boolean;
  sx?: any;
  [key: string]: any;
}

interface ScheduleCalendarProps {
  lessons: Lesson[];
  title: string;
  userType: 'teacher' | 'student';
}

const CustomCalendarHeader: React.FC<CustomCalendarHeaderProps> = ({ currentMonth, onMonthChange }) => {
  const theme: Theme = useTheme();

  const handlePrevMonth = (): void => {
    onMonthChange(currentMonth.subtract(1, 'month'), 'left');
  };

  const handleNextMonth = (): void => {
    onMonthChange(currentMonth.add(1, 'month'), 'right');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, width: '100%' }}>
      <IconButton onClick={handlePrevMonth} size="small">
        <ChevronLeftIcon />
      </IconButton>
      <Typography
        variant="h6"
        sx={{
          textTransform: 'capitalize',
          fontSize: '1.6rem',
          fontWeight: '600',
          [theme.breakpoints.up('sm')]: {
            fontSize: '1.6rem',
          },
          [theme.breakpoints.up('sm')]: {
            fontSize: '1.6rem',
          },
        }}
      >
        {currentMonth.format('MMMM [Năm] YYYY')}
      </Typography>
      <IconButton onClick={handleNextMonth} size="small">
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

const weekDayNames: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7'
};

const StyledDateCalendar = styled(DateCalendar)(({ theme }) => ({
  width: '100%',
  maxWidth: 'none',
  margin: '0 auto',
  height: 'unset',
  overflow: 'unset',
  [theme.breakpoints.up('sm')]: {
    minWidth: '600px',
  },
  [theme.breakpoints.up('md')]: {
    minWidth: '800px',
  },
  '& .MuiPickersSlideTransition-root': {
    minHeight: '400px',
  },
  '& .MuiDayCalendar-monthContainer': {
    minHeight: '360px',
  },
  '& .MuiDayCalendar-weekContainer': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    justifyContent: 'space-between',
    width: '100%',
    margin: '0 auto',
    minHeight: '55px',
  },
  '& .MuiPickersCalendarHeader-root': {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  '& .MuiPickersCalendarHeader-label': {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.87)',
    '& .MuiTypography-root': {
      fontSize: '1.8rem',
      fontWeight: '600',
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '2rem',
      '& .MuiTypography-root': {
        fontSize: '2rem',
      },
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '2.2rem',
      '& .MuiTypography-root': {
        fontSize: '2.2rem',
      },
    },
  },
  '& .MuiDayCalendar-header': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    justifyContent: 'space-between',
    width: '100%',
    margin: '0 auto',
  },
  '& .MuiDayCalendar-weekDayLabel': {
    fontSize: '1.1rem',
    width: '100%',
    height: '40px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '600',
    padding: '4px',
    '&[aria-label*="Sunday"], &[aria-label*="Saturday"]': {
      color: theme.palette.error.main,
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.2rem',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1.3rem',
    },
  },
  '& .MuiPickersDay-root': {
    fontSize: '1.1rem',
    width: '45px',
    height: '45px',
    margin: '4px auto',
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '500',
    '&.MuiPickersDay-dayOutsideMonth': {
      color: 'rgba(0, 0, 0, 0.38)',
    },
    '&.MuiPickersDay-today': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.2rem',
      width: '50px',
      height: '50px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1.3rem',
      width: '55px',
      height: '55px',
    },
  },
  '& .MuiPickersArrowSwitcher-button': {
    padding: theme.spacing(1.5),
    color: 'rgba(0, 0, 0, 0.54)',
    '& svg': {
      fontSize: '2rem',
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2),
      '& svg': {
        fontSize: '2.2rem',
      },
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2.5),
      '& svg': {
        fontSize: '2.4rem',
      },
    },
  },
}));

const ServerDay: React.FC<ServerDayProps> = ({ day, lessons, userType, selected, ...other }) => {
  const hasLesson = lessons.some(l => {
    const isMatchingDay = dayjs(l.date).isSame(day, 'day');
    const isCorrectType = !l.type || l.type === userType;

    // Debug log cho ngày hiện tại
    if (dayjs().isSame(day, 'day')) {
      console.log('🔍 ServerDay debug for today:', {
        lessonDate: l.date,
        lessonType: l.type,
        userType: userType,
        isMatchingDay,
        isCorrectType,
        className: l.className
      });
    }

    return isMatchingDay && isCorrectType;
  });
  // const isToday = dayjs().isSame(day, 'day');
  const isSelected = selected;

  // Style với độ ưu tiên cao bằng selector lớp của MUI
  const dayStyle: any = {
    ...other.sx,
    position: 'relative',
    color: '#222',
    boxShadow: 'none',
    '&.Mui-selected': {
      backgroundColor: '#1976d2',
      color: '#fff',
      border: '2px solid #1976d2',
      fontWeight: 700,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: '#1976d2',
      }
    },
    '&.MuiPickersDay-today:not(.Mui-selected)': {
      backgroundColor: '#E3F2FD', // light blue
      border: '2px solid #9e9e9e',
      color: '#222',
      fontWeight: 700,
      boxShadow: 'none',
    },
  };

  // Dấu chấm lịch học: luôn hiển thị trên nền, nếu là selected thì dùng màu trắng viền xanh đậm
  const dotStyle = hasLesson
    ? {
        content: '""',
        position: 'absolute',
        bottom: '4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '6px',
        height: '6px',
        backgroundColor: isSelected ? '#fff' : '#1976d2',
        borderRadius: '50%',
        border: isSelected ? '2px solid #1976d2' : 'none',
        zIndex: 2,
      }
    : {};

  dayStyle['&::after'] = dotStyle;

  return (
    <PickersDay
      {...other}
      day={day}
      selected={selected}
      sx={dayStyle}
      onDaySelect={other.onDaySelect}
      outsideCurrentMonth={false}
      isFirstVisibleCell={false}
      isLastVisibleCell={false}
    />
  );
};

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ lessons, title, userType }) => {
  console.log('📅 ScheduleCalendar received:', { lessons, userType, lessonsCount: lessons.length });

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [lessonsOfDay, setLessonsOfDay] = useState<Lesson[]>([]);

  // Hiển thị lịch học của ngày hôm nay khi component được mount
  useEffect(() => {
    const today = dayjs();
    const filteredLessons = lessons.filter(l => {
      const isMatchingDay = dayjs(l.date).isSame(today, 'day');
      const isCorrectType = !l.type || l.type === userType;
      return isMatchingDay && isCorrectType;
    });
    setLessonsOfDay(filteredLessons);
  }, [lessons, userType]);

  const handleDateChange = (date: Dayjs | null): void => {
    if (date) {
      setSelectedDate(date);
      const filteredLessons = lessons.filter(l => {
        const isMatchingDay = dayjs(l.date).isSame(date, 'day');
        const isCorrectType = !l.type || l.type === userType;
        return isMatchingDay && isCorrectType;
      });
      setLessonsOfDay(filteredLessons);
    } else {
      setLessonsOfDay([]);
    }
  };

  const formatWeekDay = (day: string, date: Dayjs): string => {
    if (dayjs.isDayjs(date)) {
      return weekDayNames[date.day()];
    }
    return day;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{
        maxWidth: '1400px',
        margin: '0 auto',
        px: 2,
        pb: 2,
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        minHeight: '520px'
      }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontSize: { xs: '1.8rem', md: '2.2rem' }
          }}
        >
          {title}
        </Typography>

        <Box sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'center', lg: 'flex-start' }
        }}>
          {/* Calendar Section */}
        <Paper
          elevation={3}
          sx={{
            pt: { xs: 1, sm: 2 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 2, sm: 3, md: 4 },
            backgroundColor: '#fff',
            borderRadius: 2,
              width: { xs: '100%', lg: '70%' },
            overflow: 'unset',
              minHeight: '530px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <StyledDateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            slots={{
              day: (props: any) => (
                <ServerDay {...(props as any)} lessons={lessons} userType={userType} />
              ),
              calendarHeader: CustomCalendarHeader as any,
            }}
            showDaysOutsideCurrentMonth
            views={['day']}
            dayOfWeekFormatter={formatWeekDay as any}
            sx={{ overflow: 'unset', width: '100%' }}
          />
        </Paper>

          {/* Schedule Details Section */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: '#fff',
              borderRadius: 2,
              width: { xs: '100%', lg: '30%' },
              minHeight: '530px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ mb: 3, borderBottom: '2px solid #e0e0e0', pb: 0.5 }}>
              <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
                {userType === 'teacher'
                  ? `Lịch dạy ${selectedDate ? dayjs(selectedDate).format('dddd') : ''} ngày ${selectedDate ? dayjs(selectedDate).format('DD/MM/YYYY') : ''}`
                  : `Lịch học ${selectedDate ? dayjs(selectedDate).format('dddd') : ''} ngày ${selectedDate ? dayjs(selectedDate).format('DD/MM/YYYY') : ''}`}
              </Typography>
            </Box>

            {lessonsOfDay.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>
                  {lessonsOfDay.length} {userType === 'teacher' ? 'buổi dạy' : 'buổi học'}
            </Typography>
              {lessonsOfDay.map((lesson, idx) => (
                  <Paper
                  key={idx}
                    elevation={2}
                  sx={{
                      p: 2,
                      borderLeft: '6px solid #1976d2',
                      background: '#f5faff',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="body1" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 600}}>{userType === 'teacher' ? 'Lớp dạy:' : 'Lớp:'}</span>
                        <span>{lesson.className}</span>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <Typography variant="body1" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 600 }}>{userType === 'teacher' ? 'Thời gian dạy:' : 'Thời gian:'}</span>
                        <span>{lesson.time}</span>
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 600 }}>Phòng:</span>
                        <span>{lesson.room || '---'}</span>
                      </Typography>
                      {userType !== 'teacher' && lesson.teacher && (
                        <Typography variant="body1" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontWeight: 600 }}>Giáo viên:</span>
                          <span>{lesson.teacher}</span>
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
                  <Box sx={{
                    display: 'flex',
                flexDirection: 'column',
                    alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  {userType === 'teacher' ? 'Không có lịch dạy' : 'Không có lịch học'}
                    </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {userType === 'teacher' ? 'Chọn một ngày khác để xem lịch dạy' : 'Chọn một ngày khác để xem lịch học'}
                    </Typography>
                  </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleCalendar;
