// Audit Log for tracking changes

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  entityType: 'transaction' | 'party' | 'settings' | 'report';
  entityId: string;
  userId?: string;
  changes?: Record<string, { from: any; to: any }>;
  ipAddress?: string;
  userAgent?: string;
}

const AUDIT_LOG_STORAGE_KEY = 'kyatflow_audit_log';
const MAX_LOG_ENTRIES = 1000;

export const auditLog = {
  log: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void => {
    try {
      const logs = auditLog.getAll();
      const newEntry: AuditLogEntry = {
        ...entry,
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      logs.unshift(newEntry);

      // Keep only last MAX_LOG_ENTRIES entries
      if (logs.length > MAX_LOG_ENTRIES) {
        logs.splice(MAX_LOG_ENTRIES);
      }

      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging audit entry:', error);
    }
  },

  getAll: (): AuditLogEntry[] => {
    try {
      const data = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      if (!data) return [];
      const logs = JSON.parse(data);
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    } catch {
      return [];
    }
  },

  getByEntity: (entityType: string, entityId: string): AuditLogEntry[] => {
    return auditLog.getAll().filter(
      (log) => log.entityType === entityType && log.entityId === entityId
    );
  },

  export: (): string => {
    const logs = auditLog.getAll();
    const csv = [
      'Timestamp,Action,Entity Type,Entity ID,Changes',
      ...logs.map((log) =>
        [
          log.timestamp.toISOString(),
          log.action,
          log.entityType,
          log.entityId,
          log.changes ? JSON.stringify(log.changes) : '',
        ].join(',')
      ),
    ].join('\n');
    return csv;
  },

  clear: (): void => {
    localStorage.removeItem(AUDIT_LOG_STORAGE_KEY);
  },
};

