import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '../../../config/api';
import type { AuditLogResponse, AuditLogFilters } from '../types';

export const getAuditLogsAPI = (params: {
  page?: number;
  limit?: number;
  filter?: AuditLogFilters;
} = {}) => {
  const { page = 1, limit = 10, filter } = params;

  const queryParams: any = { page, limit };

  if (filter && Object.keys(filter).length > 0) {
    // Convert Date objects to ISO strings in the filter object
    const filterWithISODates: any = { ...filter };
    if (filter.startTime) filterWithISODates.startTime = filter.startTime.toISOString();
    if (filter.endTime) filterWithISODates.endTime = filter.endTime.toISOString();

    // Stringify the entire filter object
    queryParams.filters = JSON.stringify(filterWithISODates);
  }

  return axiosInstance.get<AuditLogResponse>(API_CONFIG.ENDPOINTS.AUDIT!.LOGS, {
    params: queryParams,
  });
};
