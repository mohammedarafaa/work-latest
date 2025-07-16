export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  icon: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  timestamp: string;
}
