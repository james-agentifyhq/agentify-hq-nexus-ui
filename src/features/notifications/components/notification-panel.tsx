'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PanelNotificationBadge } from './notification-badge';
import { Bell, MessageSquare, Hash, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface NotificationPanelProps {
  workspaceId: Id<'workspaces'>;
  userId: Id<'users'>;
  className?: string;
}

interface NotificationItemProps {
  notification: {
    _id: Id<'notifications'>;
    messageId: Id<'messages'>;
    channelId?: Id<'channels'>;
    conversationId?: Id<'conversations'>;
    read: boolean;
    createdAt: number;
    // Populated data from message and user
    messagePreview?: string;
    senderName?: string;
    channelName?: string;
    memberName?: string;
  };
  onNavigate: (notification: NotificationItemProps['notification']) => void;
  onMarkRead: (notificationId: Id<'notifications'>) => void;
}

/**
 * Individual notification item component
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onNavigate,
  onMarkRead,
}) => {
  const handleClick = useCallback(() => {
    if (!notification.read) {
      onMarkRead(notification._id);
    }
    onNavigate(notification);
  }, [notification, onNavigate, onMarkRead]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Format relative timestamp
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'yesterday';
    return `${days}d`;
  };

  const contextLabel = notification.channelId
    ? `#${notification.channelName || 'channel'}`
    : `@${notification.memberName || 'direct message'}`;

  const contextIcon = notification.channelId ? Hash : User;
  const ContextIcon = contextIcon;

  return (
    <div
      data-testid="notification-item"
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer border-l-2",
        notification.read ? "border-l-transparent" : "border-l-blue-500 bg-blue-50/50"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Notification from ${notification.senderName} in ${contextLabel}`}
    >
      {/* Message Icon */}
      <div className="flex-shrink-0 mt-1">
        <MessageSquare className="h-4 w-4 text-slate-500" />
      </div>

      {/* Notification Content */}
      <div className="flex-1 min-w-0">
        {/* Header: Sender and Context */}
        <div className="flex items-center gap-2 mb-1">
          <span
            data-testid="notification-sender"
            className="font-medium text-sm text-slate-900 truncate"
          >
            {notification.senderName || 'Unknown User'}
          </span>
          <span className="text-slate-500">mentioned you in</span>
          <div
            data-testid="notification-channel"
            className="flex items-center gap-1 text-sm text-slate-600"
          >
            <ContextIcon className="h-3 w-3" />
            <span className="truncate">{contextLabel}</span>
          </div>
        </div>

        {/* Message Preview */}
        <div
          data-testid="notification-preview"
          className="text-sm text-slate-700 line-clamp-2 mb-2"
        >
          {notification.messagePreview || 'No preview available'}
        </div>

        {/* Timestamp */}
        <div
          data-testid="notification-timestamp"
          className="text-xs text-slate-500"
        >
          {formatRelativeTime(notification.createdAt)}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      )}
    </div>
  );
};

/**
 * Main notification panel component
 * Story 1.2 AC3: Show message preview, sender, and channel context
 * Status: Working after fixing reduce() error
 */
export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  workspaceId,
  userId,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Fetch notifications
  const notifications = useQuery(api.notifications.getByUserId, {
    userId,
    limit: 20
  });

  // Get unread count for badge
  const unreadCount = useQuery(api.notifications.getUnreadCountByChannel, {
    userId,
    workspaceId,
  });

  // Mark notification as read
  const markAsRead = useMutation(api.notifications.markAsRead);

  const handleNavigateToNotification = useCallback((notification: NotificationItemProps['notification']) => {
    setIsOpen(false);

    // Navigate to channel or conversation
    if (notification.channelId) {
      router.push(`/workspace/${workspaceId}/channel/${notification.channelId}`);
    } else if (notification.conversationId) {
      // Extract member ID from conversation to build direct message URL
      router.push(`/workspace/${workspaceId}/member/direct-message`);
    }
  }, [workspaceId, router]);

  const handleMarkAsRead = useCallback(async (notificationId: Id<'notifications'>) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [markAsRead]);

  // Mark all visible notifications as read when panel opens
  useEffect(() => {
    if (isOpen && notifications?.length) {
      const unreadNotifications = notifications.filter(n => !n.read);
      unreadNotifications.forEach(notification => {
        handleMarkAsRead(notification._id);
      });
    }
  }, [isOpen, notifications, handleMarkAsRead]);

  const totalUnreadCount = unreadCount ? Object.values(unreadCount).reduce((acc, count) => acc + count, 0) : 0;

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            data-testid="notification-panel-trigger"
            variant="ghost"
            size="iconSm"
            className="relative"
            aria-label={`Notifications ${totalUnreadCount > 0 ? `(${totalUnreadCount} unread)` : ''}`}
          >
            <Bell className="h-4 w-4" />
            {totalUnreadCount > 0 && (
              <PanelNotificationBadge count={totalUnreadCount} />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          data-testid="notification-panel"
          className="w-80 p-0"
          align="end"
          sideOffset={8}
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-200">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {notifications === undefined ? (
              // Loading state
              <div
                data-testid="notifications-loading"
                className="p-6 text-center text-slate-500"
              >
                <div className="animate-spin w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-2" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              // Empty state
              <div
                data-testid="notifications-empty-state"
                className="p-6 text-center text-slate-500"
              >
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm">No unread mentions</p>
                <p className="text-xs text-slate-400 mt-1">
                  When someone mentions you, it will appear here
                </p>
              </div>
            ) : (
              // Notification list
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onNavigate={handleNavigateToNotification}
                    onMarkRead={handleMarkAsRead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  // Future: Navigate to full notifications page
                  console.log('View all notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};