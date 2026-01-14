// Audit Log types
export interface AuditLogItem {
  id: string;
  entityName: string;
  entityId: string | null;
  path: string;
  method: string;
  description: string;
  action?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  changedFields?: string[];
  newValue?: unknown;
  oldValue?: unknown;
}

export interface AuditLogResponse {
  statusCode: number;
  message: string;
  data: {
    meta: {
      limit: number;
      page: number;
      totalPages: number;
      totalItems: number;
    };
    result: AuditLogItem[];
  };
}

export interface AuditLogFilters {
  userEmail?: string;
  entityName?: string;
  entityId?: string;
  startTime?: Date;
  endTime?: Date;
}
