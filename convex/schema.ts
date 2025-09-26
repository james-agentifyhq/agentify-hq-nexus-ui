import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

const schema = defineSchema({
  ...authTables,
  workspaces: defineTable({
    name: v.string(),
    userId: v.id('users'),
    joinCode: v.string(),
  }),
  members: defineTable({
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    role: v.union(v.literal('admin'), v.literal('member')),
  })
    .index('by_user_id', ['userId'])
    .index('by_workspace_id', ['workspaceId'])
    .index('by_workspace_id_user_id', ['workspaceId', 'userId']),
  channels: defineTable({
    name: v.string(),
    workspaceId: v.id('workspaces'),
  }).index('by_workspace_id', ['workspaceId']),
  conversations: defineTable({
    workspaceId: v.id('workspaces'),
    memberOneId: v.id('members'),
    memberTwoId: v.id('members'),
  }).index('by_workspace_id', ['workspaceId']),
  messages: defineTable({
    body: v.string(),
    image: v.optional(v.id('_storage')),
    memberId: v.id('members'),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    parentMessageId: v.optional(v.id('messages')),
    conversationId: v.optional(v.id('conversations')),
    updatedAt: v.optional(v.number()),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_member_id', ['memberId'])
    .index('by_channel_id', ['channelId'])
    .index('by_conversation_id', ['conversationId'])
    .index('by_parent_message_id', ['parentMessageId'])
    .index('by_channel_id_parent_message_id_conversation_id', [
      'channelId',
      'parentMessageId',
      'conversationId',
    ]),
  reactions: defineTable({
    workspaceId: v.id('workspaces'),
    messageId: v.id('messages'),
    memberId: v.id('members'),
    value: v.string(),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_message_id', ['messageId'])
    .index('by_member_id', ['memberId']),
  userProfiles: defineTable({
    userId: v.id('users'),
    userType: v.union(v.literal('human'), v.literal('ai-agent')),
    metadata: v.optional(
      v.object({
        agentId: v.optional(v.id('agents')),
      })
    ),
  }).index('by_user_id', ['userId']),
  agents: defineTable({
    name: v.string(),
    type: v.string(),
    configuration: v.object({
      endpoint: v.optional(v.string()),
      apiKey: v.optional(v.string()),
    }),
    workspaceId: v.id('workspaces'),
    memberId: v.optional(v.id('members')),
    status: v.union(
      v.literal('inactive'),
      v.literal('active'),
      v.literal('error')
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index('by_workspace_id', ['workspaceId']),
  notifications: defineTable({
    userId: v.id('users'),
    messageId: v.id('messages'),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    conversationId: v.optional(v.id('conversations')),
    type: v.union(v.literal('mention')),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_message_id', ['messageId'])
    .index('by_channel_id', ['channelId'])
    .index('by_conversation_id', ['conversationId'])
    .index('by_workspace_id', ['workspaceId'])
    .index('by_user_id_read', ['userId', 'read']),
  notificationPreferences: defineTable({
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    // Global notification preferences
    globalPreferences: v.object({
      mentions: v.boolean(),
      directMessages: v.boolean(),
      sound: v.boolean(),
      desktop: v.boolean(),
      email: v.boolean(),
      mobile: v.boolean(),
      quietHours: v.object({
        enabled: v.boolean(),
        startTime: v.string(), // Format: "HH:mm"
        endTime: v.string(),   // Format: "HH:mm"
        timezone: v.string(),  // IANA timezone identifier
      }),
    }),
    // Channel-specific preference overrides
    channelPreferences: v.array(v.object({
      channelId: v.id('channels'),
      mentions: v.union(v.literal('inherit'), v.literal('enabled'), v.literal('disabled')),
      allMessages: v.union(v.literal('inherit'), v.literal('enabled'), v.literal('disabled')),
      threads: v.union(v.literal('inherit'), v.literal('enabled'), v.literal('disabled')),
      keywords: v.array(v.string()),
      mutedUntil: v.optional(v.number()), // Unix timestamp
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_workspace_id', ['workspaceId'])
    .index('by_user_workspace', ['userId', 'workspaceId']),
});

export default schema;
