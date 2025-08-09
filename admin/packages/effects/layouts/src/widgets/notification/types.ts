interface NotificationItem {
  avatar: string;
  date: string;
  isRead?: boolean;
  message: string;
  title: string;
  userId: number | string;
}

export type { NotificationItem };
