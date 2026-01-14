/**
 * Helper function to create filter string as JSON (not encoded)
 * Example: createFilterString({ name: 'Nguyễn', email: 'test@example.com' })
 * Returns: JSON string like '{"name":"Nguyễn","email":"test@example.com"}'
 */
export const createFilterString = (filters: Record<string, any>): string => {
  // Convert filters object to JSON string (let axios handle encoding)
  return JSON.stringify(filters);
};

/**
 * Helper function to create query params with filters
 * Example: createQueryParams({ page: 1, limit: 10, name: 'Nguyễn' })
 * Returns: { page: 1, limit: 10, filters: JSON string }
 */
export const createQueryParams = (params: Record<string, any>): Record<string, any> => {
  const { page, limit, name, email, filters: rawFilters, ...otherParams } = params;

  const queryParams: Record<string, any> = {};

  if (page) queryParams.page = page;
  if (limit) queryParams.limit = limit;

  // If filters is already provided by caller, pass it through as-is
  if (rawFilters !== undefined && rawFilters !== null && rawFilters !== '') {
    queryParams.filters = typeof rawFilters === 'string' ? rawFilters : createFilterString(rawFilters);
    return queryParams;
  }

  // Otherwise, build filters from known keys and other params
  const filters: Record<string, any> = {};
  if (name) filters.name = name;
  if (email) filters.email = email;

  Object.entries(otherParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      filters[key] = value;
    }
  });

  if (Object.keys(filters).length > 0) {
    queryParams.filters = createFilterString(filters);
  }

  return queryParams;
};
