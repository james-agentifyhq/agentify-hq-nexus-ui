import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { auth } from './auth';

/**
 * Notification Preferences API
 * Story 1.2 AC4: Control @mention notifications per channel and globally
 */

/**
 * Get user's notification preferences for a workspace
 */
export const getByUserWorkspace = query({
  args: {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);

    // Users can only access their own preferences
    if (!currentUserId || currentUserId !== args.userId) {
      return null;
    }

    const preferences = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user_workspace', (q) =>
        q.eq('userId', args.userId).eq('workspaceId', args.workspaceId)
      )
      .unique();

    // Return defaults if no preferences exist
    if (!preferences) {
      return createDefaultPreferences(args.userId, args.workspaceId);
    }

    return preferences;
  },
});

/**
 * Create default notification preferences for a new user
 */
export const createDefaults = mutation({
  args: {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);

    if (!currentUserId || currentUserId !== args.userId) {
      throw new Error('Unauthorized');
    }

    // Check if preferences already exist
    const existing = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user_workspace', (q) =>
        q.eq('userId', args.userId).eq('workspaceId', args.workspaceId)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    // Create default preferences
    const now = Date.now();
    const defaultPrefs = createDefaultPreferences(args.userId, args.workspaceId);

    return await ctx.db.insert('notificationPreferences', {
      ...defaultPrefs,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update global notification preferences
 */
export const updateGlobal = mutation({
  args: {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    preferences: v.object({
      mentions: v.optional(v.boolean()),
      directMessages: v.optional(v.boolean()),
      sound: v.optional(v.boolean()),
      desktop: v.optional(v.boolean()),
      email: v.optional(v.boolean()),
      mobile: v.optional(v.boolean()),
      quietHours: v.optional(v.object({
        enabled: v.boolean(),
        startTime: v.string(),
        endTime: v.string(),
        timezone: v.string(),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);

    if (!currentUserId || currentUserId !== args.userId) {
      throw new Error('Unauthorized');
    }

    // Get or create user preferences
    let userPrefs = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user_workspace', (q) =>
        q.eq('userId', args.userId).eq('workspaceId', args.workspaceId)
      )
      .unique();

    if (!userPrefs) {
      // Create default preferences first
      const defaultPrefs = createDefaultPreferences(args.userId, args.workspaceId);
      const prefsId = await ctx.db.insert('notificationPreferences', {
        ...defaultPrefs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      userPrefs = await ctx.db.get(prefsId);
      if (!userPrefs) throw new Error('Failed to create preferences');
    }

    // Update global preferences
    const updatedGlobalPrefs = {
      ...userPrefs.globalPreferences,
      ...args.preferences,
    };

    await ctx.db.patch(userPrefs._id, {
      globalPreferences: updatedGlobalPrefs,
      updatedAt: Date.now(),
    });

    return userPrefs._id;
  },
});

/**
 * Update channel-specific notification preferences
 */
export const updateChannel = mutation({
  args: {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    channelId: v.id('channels'),
    preferences: v.object({
      mentions: v.optional(v.union(v.literal('inherit'), v.literal('enabled'), v.literal('disabled'))),
      allMessages: v.optional(v.union(v.literal('inherit'), v.literal('enabled'), v.literal('disabled'))),
      threads: v.optional(v.union(v.literal('inherit'), v.literal('enabled'), v.literal('disabled'))),
      keywords: v.optional(v.array(v.string())),
      mutedUntil: v.optional(v.union(v.number(), v.null())),
    }),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);

    if (!currentUserId || currentUserId !== args.userId) {
      throw new Error('Unauthorized');
    }

    // Get or create user preferences
    let userPrefs = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user_workspace', (q) =>
        q.eq('userId', args.userId).eq('workspaceId', args.workspaceId)
      )
      .unique();

    if (!userPrefs) {
      const defaultPrefs = createDefaultPreferences(args.userId, args.workspaceId);
      const prefsId = await ctx.db.insert('notificationPreferences', {
        ...defaultPrefs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      userPrefs = await ctx.db.get(prefsId);
      if (!userPrefs) throw new Error('Failed to create preferences');
    }

    // Update or add channel preferences
    const channelPrefs = [...userPrefs.channelPreferences];
    const existingIndex = channelPrefs.findIndex(pref => pref.channelId === args.channelId);

    const channelUpdate = {
      channelId: args.channelId,
      mentions: args.preferences.mentions || 'inherit',
      allMessages: args.preferences.allMessages || 'disabled',
      threads: args.preferences.threads || 'enabled',
      keywords: args.preferences.keywords || [],
      ...(args.preferences.mutedUntil !== undefined ?
        args.preferences.mutedUntil === null ? {} : { mutedUntil: args.preferences.mutedUntil } : {}),
    };

    if (existingIndex >= 0) {
      channelPrefs[existingIndex] = {
        ...channelPrefs[existingIndex],
        ...channelUpdate,
      };
    } else {
      channelPrefs.push(channelUpdate);
    }

    await ctx.db.patch(userPrefs._id, {
      channelPreferences: channelPrefs,
      updatedAt: Date.now(),
    });

    return userPrefs._id;
  },
});

/**
 * Check if a notification should be sent based on user preferences
 */
export const shouldSendNotification = query({
  args: {
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    notificationType: v.union(v.literal('mention'), v.literal('direct_message'), v.literal('all_messages')),
  },
  handler: async (ctx, args) => {
    // Get user preferences
    const preferences = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user_workspace', (q) =>
        q.eq('userId', args.userId).eq('workspaceId', args.workspaceId)
      )
      .unique();

    // Use defaults if no preferences exist
    const prefs = preferences || createDefaultPreferences(args.userId, args.workspaceId);

    // Check quiet hours
    if (isInQuietHours(prefs.globalPreferences.quietHours)) {
      return false;
    }

    // Check channel-specific muting
    if (args.channelId) {
      const channelPref = prefs.channelPreferences.find(cp => cp.channelId === args.channelId);
      if (channelPref?.mutedUntil && channelPref.mutedUntil > Date.now()) {
        return false;
      }
    }

    // Check notification type preferences
    switch (args.notificationType) {
      case 'mention':
        return shouldSendMentionNotification(prefs, args.channelId);
      case 'direct_message':
        return prefs.globalPreferences.directMessages;
      case 'all_messages':
        return shouldSendAllMessagesNotification(prefs, args.channelId);
      default:
        return false;
    }
  },
});

/**
 * Helper function to create default preferences
 */
function createDefaultPreferences(userId: any, workspaceId: any) {
  return {
    userId,
    workspaceId,
    globalPreferences: {
      mentions: true,
      directMessages: true,
      sound: true,
      desktop: true,
      email: false,
      mobile: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC',
      },
    },
    channelPreferences: [],
  };
}

/**
 * Check if current time is within quiet hours
 */
function isInQuietHours(quietHours: any): boolean {
  if (!quietHours.enabled) return false;

  // Simple implementation - could be enhanced with timezone support
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = quietHours.startTime.split(':').map(Number);
  const [endHour, endMinute] = quietHours.endTime.split(':').map(Number);
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  } else {
    return currentTime >= startTime && currentTime < endTime;
  }
}

/**
 * Check if mention notification should be sent
 */
function shouldSendMentionNotification(prefs: any, channelId: any): boolean {
  if (channelId) {
    const channelPref = prefs.channelPreferences.find((cp: any) => cp.channelId === channelId);
    if (channelPref) {
      switch (channelPref.mentions) {
        case 'enabled':
          return true;
        case 'disabled':
          return false;
        case 'inherit':
        default:
          return prefs.globalPreferences.mentions;
      }
    }
  }

  return prefs.globalPreferences.mentions;
}

/**
 * Check if all messages notification should be sent
 */
function shouldSendAllMessagesNotification(prefs: any, channelId: any): boolean {
  if (channelId) {
    const channelPref = prefs.channelPreferences.find((cp: any) => cp.channelId === channelId);
    if (channelPref) {
      switch (channelPref.allMessages) {
        case 'enabled':
          return true;
        case 'disabled':
          return false;
        case 'inherit':
        default:
          return false; // Default for all messages is disabled
      }
    }
  }

  return false; // Default for all messages is disabled
}