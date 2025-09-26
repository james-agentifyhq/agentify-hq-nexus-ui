import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { auth } from './auth';

/**
 * Notifications System - Convex Functions
 *
 * Supports Story 1.2 @Mentions and Notification System:
 * - Create notifications for @mentions
 * - Query notifications by user
 * - Get unread counts per channel
 * - Mark notifications as read
 */

/**
 * Create a new notification
 * AC2: When @mention is sent, mentioned user receives real-time notification
 */
export const create = mutation({
  args: {
    userId: v.id('users'),
    messageId: v.id('messages'),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    conversationId: v.optional(v.id('conversations')),
    type: v.union(v.literal('mention')),
  },
  handler: async (ctx, args) => {
    // Auth check - ensure user is authenticated
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error('Unauthorized');
    }

    // Create notification
    const notificationId = await ctx.db.insert('notifications', {
      userId: args.userId,
      messageId: args.messageId,
      workspaceId: args.workspaceId,
      channelId: args.channelId,
      conversationId: args.conversationId,
      type: args.type,
      read: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

/**
 * Get notifications for a specific user
 * AC3: User can view notifications with message preview, sender, channel context
 */
export const getByUserId = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Auth check
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error('Unauthorized');
    }

    // Only allow users to fetch their own notifications
    if (currentUserId !== args.userId) {
      throw new Error('Forbidden: Can only access own notifications');
    }

    const limit = args.limit || 50;

    // Get notifications ordered by creation time (newest first)
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit);

    return notifications;
  },
});

/**
 * Get unread notification count per channel for a user
 * AC5: Badge count on channels with unread mentions
 */
export const getUnreadCountByChannel = query({
  args: {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    // Auth check
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error('Unauthorized');
    }

    // Only allow users to fetch their own notification counts
    if (currentUserId !== args.userId) {
      throw new Error('Forbidden: Can only access own notifications');
    }

    // Get all unread notifications for user in workspace
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_id_read', (q) => q.eq('userId', args.userId).eq('read', false))
      .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
      .collect();

    // Group by channel and count
    const channelCounts: Record<string, number> = {};

    for (const notification of unreadNotifications) {
      if (notification.channelId) {
        channelCounts[notification.channelId] = (channelCounts[notification.channelId] || 0) + 1;
      }
    }

    return channelCounts;
  },
});

/**
 * Get unread notification count for conversations (DMs) for a user
 */
export const getUnreadCountByConversation = query({
  args: {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    // Auth check
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error('Unauthorized');
    }

    // Only allow users to fetch their own notification counts
    if (currentUserId !== args.userId) {
      throw new Error('Forbidden: Can only access own notifications');
    }

    // Get all unread DM notifications for user in workspace
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_id_read', (q) => q.eq('userId', args.userId).eq('read', false))
      .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
      .filter((q) => q.neq(q.field('conversationId'), undefined))
      .collect();

    // Group by conversation and count
    const conversationCounts: Record<string, number> = {};

    for (const notification of unreadNotifications) {
      if (notification.conversationId) {
        conversationCounts[notification.conversationId] = (conversationCounts[notification.conversationId] || 0) + 1;
      }
    }

    return conversationCounts;
  },
});

/**
 * Mark a notification as read
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    // Auth check
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error('Unauthorized');
    }

    // Get the notification to verify ownership
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Verify user can only mark their own notifications as read
    if (notification.userId !== currentUserId) {
      throw new Error('Forbidden: Can only mark own notifications as read');
    }

    // Update read status
    await ctx.db.patch(args.notificationId, {
      read: true,
    });

    return { success: true };
  },
});

/**
 * Mark all notifications as read for a user in a specific channel
 */
export const markChannelAsRead = mutation({
  args: {
    userId: v.id('users'),
    channelId: v.id('channels'),
  },
  handler: async (ctx, args) => {
    // Auth check
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error('Unauthorized');
    }

    // Only allow users to mark their own notifications as read
    if (currentUserId !== args.userId) {
      throw new Error('Forbidden: Can only mark own notifications as read');
    }

    // Get all unread notifications for user in this channel
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_id_read', (q) => q.eq('userId', args.userId).eq('read', false))
      .filter((q) => q.eq(q.field('channelId'), args.channelId))
      .collect();

    // Mark all as read
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        read: true,
      });
    }

    return { count: unreadNotifications.length };
  },
});

/**
 * Mark all notifications as read for a user in a specific conversation
 */
export const markConversationAsRead = mutation({
  args: {
    userId: v.id('users'),
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    // Auth check
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error('Unauthorized');
    }

    // Only allow users to mark their own notifications as read
    if (currentUserId !== args.userId) {
      throw new Error('Forbidden: Can only mark own notifications as read');
    }

    // Get all unread notifications for user in this conversation
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_id_read', (q) => q.eq('userId', args.userId).eq('read', false))
      .filter((q) => q.eq(q.field('conversationId'), args.conversationId))
      .collect();

    // Mark all as read
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        read: true,
      });
    }

    return { count: unreadNotifications.length };
  },
});