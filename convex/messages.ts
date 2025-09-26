import { mutation, query, QueryCtx, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { auth } from './auth';
import { paginationOptsValidator } from 'convex/server';
// Import direct preference checking logic
// Note: shouldSendNotification is a query, so we'll implement the logic here

const populateThread = async (ctx: QueryCtx, messageId: Id<'messages'>) => {
  const messages = await ctx.db
    .query('messages')
    .withIndex('by_parent_message_id', (q) =>
      q.eq('parentMessageId', messageId),
    )
    .collect();

  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: '',
    };
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

  if (!lastMessageMember) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: '',
    };
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

  return {
    count: messages.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
    name: lastMessageUser?.name || '',
  };
};

const populateReactions = (ctx: QueryCtx, messageId: Id<'messages'>) => {
  return ctx.db
    .query('reactions')
    .withIndex('by_message_id', (q) => q.eq('messageId', messageId))
    .collect();
};

const populateUser = (ctx: QueryCtx, userId: Id<'users'>) => {
  return ctx.db.get(userId);
};

const populateMember = (ctx: QueryCtx, memberId: Id<'members'>) => {
  return ctx.db.get(memberId);
};

const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<'workspaces'>,
  userId: Id<'users'>,
) => {
  return ctx.db
    .query('members')
    .withIndex('by_workspace_id_user_id', (q) =>
      q.eq('workspaceId', workspaceId).eq('userId', userId),
    )
    .unique();
};

/**
 * Extract usernames from @mention patterns in message text
 * Returns array of mentioned usernames without @ symbol
 */
const extractMentions = (messageBody: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(messageBody)) !== null) {
    mentions.push(match[1]); // Extract username without @
  }

  return Array.from(new Set(mentions)); // Remove duplicates
};

/**
 * Find user IDs for mentioned usernames in the workspace
 */
const getMentionedUsers = async (
  ctx: MutationCtx,
  workspaceId: Id<'workspaces'>,
  usernames: string[]
): Promise<Id<'users'>[]> => {
  if (usernames.length === 0) return [];

  const members = await ctx.db
    .query('members')
    .withIndex('by_workspace_id', (q) => q.eq('workspaceId', workspaceId))
    .collect();

  const users = await Promise.all(
    members.map(member => ctx.db.get(member.userId))
  );

  const mentionedUserIds: Id<'users'>[] = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user && user.name && usernames.includes(user.name)) {
      mentionedUserIds.push(user._id);
    }
  }

  return mentionedUserIds;
};

/**
 * Check if a notification should be sent based on user preferences
 */
const checkNotificationPreferences = async (
  ctx: MutationCtx,
  userId: Id<'users'>,
  workspaceId: Id<'workspaces'>,
  channelId?: Id<'channels'>
): Promise<boolean> => {
  // Get user preferences
  const preferences = await ctx.db
    .query('notificationPreferences')
    .withIndex('by_user_workspace', (q) =>
      q.eq('userId', userId).eq('workspaceId', workspaceId)
    )
    .unique();

  // If no preferences exist, default to enabled
  if (!preferences) {
    return true;
  }

  // Check if notifications are globally disabled
  if (!preferences.globalPreferences.mentions) {
    return false;
  }

  // Check channel-specific preferences if available
  if (channelId && preferences.channelPreferences) {
    const channelPref = preferences.channelPreferences.find(
      cp => cp.channelId === channelId
    );

    if (channelPref) {
      // Channel is muted
      if (channelPref.mutedUntil && channelPref.mutedUntil > Date.now()) {
        return false;
      }

      // Channel mentions override global setting
      if (channelPref.mentions === 'disabled') {
        return false;
      } else if (channelPref.mentions === 'enabled') {
        return true;
      }
      // 'inherit' falls through to global setting
    }
  }

  // Check quiet hours
  if (preferences.globalPreferences.quietHours?.enabled) {
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(preferences.globalPreferences.quietHours.startTime.split(':')[0]);
    const endHour = parseInt(preferences.globalPreferences.quietHours.endTime.split(':')[0]);

    if (startHour < endHour) {
      // Same day quiet hours
      if (currentHour >= startHour && currentHour < endHour) {
        return false;
      }
    } else {
      // Cross-midnight quiet hours
      if (currentHour >= startHour || currentHour < endHour) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Handle notification creation for @mentions with preference enforcement
 */
const handleMentionNotifications = async (
  ctx: MutationCtx,
  messageId: Id<'messages'>,
  messageBody: string,
  workspaceId: Id<'workspaces'>,
  channelId?: Id<'channels'>,
  conversationId?: Id<'conversations'>,
  authorUserId?: Id<'users'>
) => {
  // Extract mentions from message
  const mentionedUsernames = extractMentions(messageBody);

  if (mentionedUsernames.length === 0) {
    return; // No mentions found
  }

  // Find user IDs for mentioned usernames
  const mentionedUserIds = await getMentionedUsers(ctx, workspaceId, mentionedUsernames);

  // Create notifications for each mentioned user (if preferences allow)
  for (const userId of mentionedUserIds) {
    // Don't notify users about their own messages
    if (authorUserId && userId === authorUserId) {
      continue;
    }

    // Check notification preferences
    const shouldNotify = await checkNotificationPreferences(
      ctx,
      userId,
      workspaceId,
      channelId
    );

    if (shouldNotify) {
      // Create notification using the notifications API
      await ctx.db.insert('notifications', {
        userId,
        messageId,
        workspaceId,
        channelId,
        conversationId,
        type: 'mention',
        read: false,
        createdAt: Date.now(),
      });
    }
  }
};

export const remove = mutation({
  args: {
    id: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error('Message not found');
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || member._id !== message.memberId) {
      throw new Error('Unauthorized');
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const update = mutation({
  args: {
    id: v.id('messages'),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error('Message not found');
    }

    const member = await getMember(ctx, message.workspaceId, userId);

    if (!member || member._id !== message.memberId) {
      throw new Error('Unauthorized');
    }

    await ctx.db.patch(args.id, {
      body: args.body,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const getById = query({
  args: {
    id: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const message = await ctx.db.get(args.id);

    if (!message) {
      throw null;
    }

    const currentMember = await getMember(ctx, message.workspaceId, userId);

    if (!currentMember) {
      return null;
    }

    const member = await populateMember(ctx, message.memberId);

    if (!member) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);

    if (!user) {
      return null;
    }

    const reactions = await populateReactions(ctx, message._id);

    const reactionsWithCounts = reactions.map((reaction) => ({
      ...reaction,
      count: reactions.filter((r) => r.value === reaction.value).length,
    }));

    const dedupedReactions = reactionsWithCounts.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);

        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId]),
          );
        } else {
          acc.push({ ...reaction, memberIds: [reaction.memberId] });
        }

        return acc;
      },
      [] as (Doc<'reactions'> & {
        count: number;
        memberIds: Id<'members'>[];
      })[],
    );

    const reactionsWithoutMemberIdProperty = dedupedReactions.map(
      ({ memberId, ...rest }) => rest,
    );

    return {
      ...message,
      image: message.image
        ? await ctx.storage.getUrl(message.image)
        : undefined,
      user,
      member,
      reactions: reactionsWithoutMemberIdProperty,
    };
  },
});

export const get = query({
  args: {
    channelId: v.optional(v.id('channels')),
    conversationId: v.optional(v.id('conversations')),
    parentMessageId: v.optional(v.id('messages')),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    let _conversationId = args.conversationId;

    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (!parentMessage) {
        throw new Error('Parent message not found');
      }

      _conversationId = parentMessage.conversationId;
    }

    const results = await ctx.db
      .query('messages')
      .withIndex('by_channel_id_parent_message_id_conversation_id', (q) =>
        q
          .eq('channelId', args.channelId)
          .eq('parentMessageId', args.parentMessageId)
          .eq('conversationId', _conversationId),
      )
      .order('desc')
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId);
            const user = member
              ? await populateUser(ctx, member?.userId)
              : null;

            if (!member || !user) return null;

            const reactions = await populateReactions(ctx, message._id);
            const thread = await populateThread(ctx, message._id);
            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;

            const reactionsWithCounts = reactions.map((reaction) => ({
              ...reaction,
              count: reactions.filter((r) => r.value === reaction.value).length,
            }));

            const dedupedReactions = reactionsWithCounts.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value,
                );

                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId]),
                  );
                } else {
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }

                return acc;
              },
              [] as (Doc<'reactions'> & {
                count: number;
                memberIds: Id<'members'>[];
              })[],
            );

            const reactionsWithoutMemberIdProperty = dedupedReactions.map(
              ({ memberId, ...rest }) => rest,
            );

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberIdProperty,
              threadCount: thread.count,
              threadImage: thread.image,
              threadName: thread.name,
              threadTimestamp: thread.timestamp,
            };
          }),
        )
      ).filter(
        (message): message is NonNullable<typeof message> => message !== null,
      ),
    };
  },
});

export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id('_storage')),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    parentMessageId: v.optional(v.id('messages')),
    conversationId: v.optional(v.id('conversations')),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const member = await getMember(ctx, args.workspaceId, userId);

    if (!member) {
      throw new Error('Unauthorized');
    }

    let _conversationId = args.conversationId;

    // only possible if we are replying in a thread in 1:1 conversation
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (!parentMessage) {
        throw new Error('Parent message not found');
      }

      _conversationId = parentMessage.conversationId;
    }

    const messageId = await ctx.db.insert('messages', {
      memberId: member._id,
      body: args.body,
      image: args.image,
      channelId: args.channelId,
      conversationId: _conversationId,
      workspaceId: args.workspaceId,
      parentMessageId: args.parentMessageId,
    });

    // Handle @mention notifications with preference enforcement
    await handleMentionNotifications(
      ctx,
      messageId,
      args.body,
      args.workspaceId,
      args.channelId,
      _conversationId,
      userId
    );

    return messageId;
  },
});
