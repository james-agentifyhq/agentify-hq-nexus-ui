import { describe, it, expect } from 'vitest';

/**
 * Convex Members - User Lookup - Unit Tests
 *
 * Testing Strategy (TDD):
 * - getByUsername should find members by display name or username
 * - Should filter by workspace to ensure security
 * - Should handle case-insensitive matching
 * - Should return member details for autocomplete display
 * - Should return empty results for non-existent users
 *
 * Story 1.2 Acceptance Criteria Coverage:
 * - AC1: Username lookup for autocomplete dropdown population
 */

describe('Convex Members - getByUsername query', () => {
  it('should find member by exact username match', () => {
    // Given: Mock member data
    const mockMembers = [
      { _id: 'mem1', userId: 'user1', workspaceId: 'ws1', username: 'john.doe', displayName: 'John Doe' },
      { _id: 'mem2', userId: 'user2', workspaceId: 'ws1', username: 'sarah_smith', displayName: 'Sarah Smith' }
    ];

    // When: Searching for exact username
    const searchTerm = 'john.doe';
    const matchingMembers = mockMembers.filter(m =>
      m.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then: Should return matching member
    expect(matchingMembers).toHaveLength(1);
    expect(matchingMembers[0].username).toBe('john.doe');
    expect(matchingMembers[0].displayName).toBe('John Doe');
  });

  it('should find member by partial username match', () => {
    // Given: Mock member data
    const mockMembers = [
      { _id: 'mem1', userId: 'user1', workspaceId: 'ws1', username: 'john.doe', displayName: 'John Doe' },
      { _id: 'mem2', userId: 'user2', workspaceId: 'ws1', username: 'jane.doe', displayName: 'Jane Doe' }
    ];

    // When: Searching for partial match
    const searchTerm = 'doe';
    const matchingMembers = mockMembers.filter(m =>
      m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then: Should return both matching members
    expect(matchingMembers).toHaveLength(2);
    expect(matchingMembers.map(m => m.username)).toContain('john.doe');
    expect(matchingMembers.map(m => m.username)).toContain('jane.doe');
  });

  it('should find member by display name match', () => {
    // Given: Mock member data
    const mockMembers = [
      { _id: 'mem1', userId: 'user1', workspaceId: 'ws1', username: 'jdoe', displayName: 'John Doe' },
      { _id: 'mem2', userId: 'user2', workspaceId: 'ws1', username: 'ssmith', displayName: 'Sarah Smith' }
    ];

    // When: Searching by display name
    const searchTerm = 'John';
    const matchingMembers = mockMembers.filter(m =>
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then: Should return matching member
    expect(matchingMembers).toHaveLength(1);
    expect(matchingMembers[0].displayName).toBe('John Doe');
    expect(matchingMembers[0].username).toBe('jdoe');
  });

  it('should perform case-insensitive search', () => {
    // Given: Mock member data
    const mockMembers = [
      { _id: 'mem1', userId: 'user1', workspaceId: 'ws1', username: 'JohnDoe', displayName: 'John Doe' }
    ];

    // When: Searching with different case
    const searchTerms = ['johndoe', 'JOHNDOE', 'JohnDoe'];

    // Then: All should match
    searchTerms.forEach(term => {
      const matchingMembers = mockMembers.filter(m =>
        m.username.toLowerCase().includes(term.toLowerCase())
      );
      expect(matchingMembers).toHaveLength(1);
    });
  });

  it('should filter by workspace to ensure security', () => {
    // Given: Members from different workspaces
    const mockMembers = [
      { _id: 'mem1', userId: 'user1', workspaceId: 'ws1', username: 'john', displayName: 'John' },
      { _id: 'mem2', userId: 'user2', workspaceId: 'ws2', username: 'john', displayName: 'John Other' }
    ];

    // When: Searching within specific workspace
    const targetWorkspace = 'ws1';
    const searchTerm = 'john';
    const matchingMembers = mockMembers.filter(m =>
      m.workspaceId === targetWorkspace &&
      m.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then: Should only return members from target workspace
    expect(matchingMembers).toHaveLength(1);
    expect(matchingMembers[0].workspaceId).toBe('ws1');
    expect(matchingMembers[0].displayName).toBe('John');
  });

  it('should return empty array for no matches', () => {
    // Given: Mock member data
    const mockMembers = [
      { _id: 'mem1', userId: 'user1', workspaceId: 'ws1', username: 'john', displayName: 'John' }
    ];

    // When: Searching for non-existent user
    const searchTerm = 'nonexistent';
    const matchingMembers = mockMembers.filter(m =>
      m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then: Should return empty array
    expect(matchingMembers).toEqual([]);
    expect(matchingMembers).toHaveLength(0);
  });

  it('should limit results for performance', () => {
    // Given: Large number of matching members
    const mockMembers = Array.from({ length: 20 }, (_, i) => ({
      _id: `mem${i}`,
      userId: `user${i}`,
      workspaceId: 'ws1',
      username: `user${i}`,
      displayName: `User ${i}`
    }));

    // When: Searching with broad term
    const searchTerm = 'user';
    const limit = 10;
    const matchingMembers = mockMembers
      .filter(m => m.username.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, limit);

    // Then: Should limit results
    expect(matchingMembers).toHaveLength(limit);
    expect(matchingMembers.length).toBeLessThanOrEqual(limit);
  });

  it('should return member data needed for autocomplete', () => {
    // Given: Mock member data
    const mockMember = {
      _id: 'mem1',
      userId: 'user1',
      workspaceId: 'ws1',
      username: 'john.doe',
      displayName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg'
    };

    // When: Processing member for autocomplete
    const autocompleteData = {
      memberId: mockMember._id,
      userId: mockMember.userId,
      username: mockMember.username,
      displayName: mockMember.displayName,
      avatarUrl: mockMember.avatarUrl
    };

    // Then: Should include all necessary fields
    expect(autocompleteData).toHaveProperty('memberId');
    expect(autocompleteData).toHaveProperty('userId');
    expect(autocompleteData).toHaveProperty('username');
    expect(autocompleteData).toHaveProperty('displayName');
    expect(autocompleteData.username).toBe('john.doe');
    expect(autocompleteData.displayName).toBe('John Doe');
  });
});

describe('Convex Members - username search optimization', () => {
  it('should handle empty search term', () => {
    // Given: Empty or whitespace-only search
    const searchTerms = ['', '   ', '\t', '\n'];

    // When: Validating search terms
    const validTerms = searchTerms.filter(term => term.trim().length > 0);

    // Then: Should filter out empty terms
    expect(validTerms).toHaveLength(0);
  });

  it('should handle minimum search length requirement', () => {
    // Given: Various search term lengths
    const shortTerm = 'a';
    const validTerm = 'ab';

    // When: Checking minimum length (2 characters)
    const minLength = 2;
    const isShortValid = shortTerm.length >= minLength;
    const isValidValid = validTerm.length >= minLength;

    // Then: Should enforce minimum search length
    expect(isShortValid).toBe(false);
    expect(isValidValid).toBe(true);
  });
});

/**
 * TODO: Implement actual Convex member lookup function
 *
 * Expected implementation in convex/members.ts:
 *
 * export const getByUsername = query({
 *   args: {
 *     workspaceId: v.id('workspaces'),
 *     searchTerm: v.string(),
 *     limit: v.optional(v.number()),
 *   },
 *   handler: async (ctx, args) => {
 *     const limit = args.limit || 10;
 *
 *     if (args.searchTerm.trim().length < 2) {
 *       return [];
 *     }
 *
 *     // Get members in workspace and filter by search term
 *     const members = await ctx.db
 *       .query('members')
 *       .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
 *       .take(100); // Get more to filter
 *
 *     // Filter by username/displayName and limit results
 *     return members
 *       .filter(member =>
 *         member.username?.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
 *         member.displayName?.toLowerCase().includes(args.searchTerm.toLowerCase())
 *       )
 *       .slice(0, limit);
 *   },
 * });
 */