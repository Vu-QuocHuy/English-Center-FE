import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, SxProps, Theme } from '@mui/material';

export interface VirtualListProps<T> {
  data: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  sx?: SxProps<Theme>;
  'data-testid'?: string;
}

const VirtualList = <T extends any>({
  data,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  sx = {},
  'data-testid': dataTestId,
  ...props
}: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(height / itemHeight);
    const end = Math.min(start + visibleCount + overscan, data.length);
    const startIndex = Math.max(0, start - overscan);

    return { start: startIndex, end };
  }, [scrollTop, itemHeight, height, data.length, overscan]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return data.length * itemHeight;
  }, [data.length, itemHeight]);

  // Calculate offset for visible items
  const offsetY = useMemo(() => {
    return visibleRange.start * itemHeight;
  }, [visibleRange.start, itemHeight]);

  // Handle scroll event
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Get visible items
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end);
  }, [data, visibleRange.start, visibleRange.end]);

  // Auto-scroll to top when data changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [data.length]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height,
        overflow: 'auto',
        position: 'relative',
        ...sx,
      }}
      onScroll={handleScroll}
      data-testid={dataTestId}
      {...props}
    >
      <Box
        sx={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            return (
              <Box
                key={actualIndex}
                sx={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {renderItem(item, actualIndex)}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualList;
