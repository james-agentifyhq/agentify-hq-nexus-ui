import { v } from 'convex/values';
import { mutation, query, QueryCtx } from './_generated/server';
import { auth } from './auth';
import { Id } from './_generated/dataModel';

const populateUser = (ctx: QueryCtx, id: Id<'users'>) => {
  return ctx.db.get(id);
};

export const current = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', userId),
      )
      .unique();

    if (!member) {
      return null;
    }

    return member;
  },
});

export const getById = query({
  args: {
    id: v.id('members'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const member = await ctx.db.get(args.id);

    if (!member) {
      return null;
    }

    const currentMember = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', member.workspaceId).eq('userId', userId),
      );

    if (!currentMember) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);

    if (!user) {
      return null;
    }

    return { ...member, user };
  },
});

export const get = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return [];
    }

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', userId),
      )
      .unique();

    if (!member) {
      return [];
    }

    const data = await ctx.db
      .query('members')
      .withIndex('by_workspace_id', (q) =>
        q.eq('workspaceId', args.workspaceId),
      )
      .collect();

    const members = [];

    for (const member of data) {
      const user = await populateUser(ctx, member.userId);

      if (user) {
        members.push({ ...member, user });
      }
    }

    return members;
  },
});

export const update = mutation({
  args: {
    id: v.id('members'),
    role: v.union(v.literal('admin'), v.literal('member')),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const member = await ctx.db.get(args.id);

    if (!member) {
      throw new Error('Member not found');
    }

    const currentMember = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', member.workspaceId).eq('userId', userId),
      )
      .unique();

    if (!currentMember || currentMember.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await ctx.db.patch(args.id, { role: args.role });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id('members'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const member = await ctx.db.get(args.id);

    if (!member) {
      throw new Error('Member not found');
    }

    const currentMember = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', member.workspaceId).eq('userId', userId),
      )
      .unique();

    if (!currentMember) {
      throw new Error('Unauthorized');
    }

    if (member.role === 'admin') {
      throw new Error('Admin cannot be removed');
    }

    if (currentMember._id === args.id && currentMember.role === 'admin') {
      throw new Error('Cannot remove self assuming that self is an admin');
    }

    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query('messages')
        .withIndex('by_member_id', (q) => q.eq('memberId', member._id))
        .collect(),
      ctx.db
        .query('reactions')
        .withIndex('by_member_id', (q) => q.eq('memberId', member._id))
        .collect(),
      ctx.db
        .query('conversations')
        .filter((q) =>
          q.or(
            q.eq(q.field('memberOneId'), member._id),
            q.eq(q.field('memberTwoId'), member._id),
          ),
        )
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Search for members by username for @mention autocomplete
 *
 * Story 1.2 AC1: Autocomplete dropdown of workspace members
 */
export const getByUsername = query({
  args: {
    workspaceId: v.id('workspaces'),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return [];
    }

    // Verify current user is member of the workspace
    const currentMember = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', userId),
      )
      .unique();

    if (!currentMember) {
      return [];
    }

    // Require minimum search length for performance
    if (args.searchTerm.trim().length < 1) {
      return [];
    }

    const limit = args.limit || 10;
    const searchTerm = args.searchTerm.toLowerCase().trim();

    // Get all members in workspace
    const members = await ctx.db
      .query('members')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();

    // Populate with user data and filter by search term
    const matchingMembers = [];

    for (const member of members) {
      if (matchingMembers.length >= limit) {
        break;
      }

      const user = await populateUser(ctx, member.userId);
      if (!user) continue;

      // Search in user's name and email
      const name = user.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';

      // Check if search term matches name or email username part
      const emailUsername = email.split('@')[0] || '';

      if (
        name.includes(searchTerm) ||
        emailUsername.includes(searchTerm) ||
        email.includes(searchTerm)
      ) {
        matchingMembers.push({
          _id: member._id,
          userId: member.userId,
          workspaceId: member.workspaceId,
          role: member.role,
          user,
          // Provide displayName and username for autocomplete
          displayName: user.name || 'Unknown User',
          username: emailUsername || user.email || 'unknown',
        });
      }
    }

    return matchingMembers;
  },
});
