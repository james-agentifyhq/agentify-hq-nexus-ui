'use client';

import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  position?: 'static' | 'absolute';
  showZero?: boolean;
}

/**
 * NotificationBadge Component
 *
 * Displays unread notification count with proper accessibility and performance
 * Story 1.2 AC3 & AC5: Badge count on channels with unread mentions
 */
export const NotificationBadge = memo<NotificationBadgeProps>(({
  count,
  variant = 'default',
  size = 'default',
  className,
  position = 'static',
  showZero = false,
}) => {
  // Don't render if count is 0 and showZero is false
  if (count <= 0 && !showZero) {
    return null;
  }

  // Format display count (show 99+ for counts >= 100)
  const displayCount = count < 100 ? count.toString() : '99+';

  // Generate appropriate aria-label for screen readers
  const ariaLabel = count === 1
    ? '1 unread notification'
    : `${count} unread notifications`;

  // Determine badge variant based on context and count
  const effectiveVariant = count > 0 ? variant : 'secondary';

  return (
    <Badge
      variant={effectiveVariant}
      className={cn(
        // Size variants
        size === 'sm' && 'h-4 min-w-4 text-xs px-1',
        size === 'default' && 'h-5 min-w-5 text-xs px-1.5',
        size === 'lg' && 'h-6 min-w-6 text-sm px-2',

        // Position variants
        position === 'absolute' && 'absolute -top-1 -right-1',

        // Ensure proper circular shape for single digits
        count < 10 && size === 'sm' && 'w-4 justify-center',
        count < 10 && size === 'default' && 'w-5 justify-center',
        count < 10 && size === 'lg' && 'w-6 justify-center',

        // Animation for new notifications
        'transition-all duration-200 ease-in-out',

        // Base styling for notification badges
        'font-medium leading-none',

        className
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {displayCount}
    </Badge>
  );
});

NotificationBadge.displayName = 'NotificationBadge';

/**
 * Channel Badge - Specific variant for channel list items
 */
export const ChannelNotificationBadge = memo<{
  count: number;
  isCurrentChannel?: boolean;
  className?: string;
}>(({ count, isCurrentChannel = false, className }) => {
  return (
    <NotificationBadge
      count={count}
      variant={isCurrentChannel ? 'default' : 'secondary'}
      size="sm"
      position="static"
      className={cn(
        // Channel-specific styling
        'ml-auto',
        isCurrentChannel && 'bg-white text-slate-900',
        className
      )}
    />
  );
});

ChannelNotificationBadge.displayName = 'ChannelNotificationBadge';

/**
 * Panel Badge - Specific variant for notification panel trigger
 */
export const PanelNotificationBadge = memo<{
  count: number;
  className?: string;
}>(({ count, className }) => {
  return (
    <NotificationBadge
      count={count}
      variant="destructive"
      size="default"
      position="absolute"
      className={cn(
        // Panel-specific positioning and styling
        'z-10 border-2 border-white',
        className
      )}
    />
  );
});

PanelNotificationBadge.displayName = 'PanelNotificationBadge';