import { auth } from './auth';
import { query } from './_generated/server';
import { v } from 'convex/values';

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);

    if (userId === null) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});

export const getUserType = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    return profile?.userType ?? 'human';
  },
});

export const isHumanUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const userType = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    return (userType?.userType ?? 'human') === 'human';
  },
});
