import { describe, it, expect } from 'vitest';
import { extractMentions, isValidMentionUsername, findMentionAtCursor, renderMentions } from '@/lib/mentions';

/**
 * @Mentions Implementation Tests - Testing actual functions
 *
 * These tests verify the actual implementation of mention detection functions
 * against the expected behavior defined in mentions.test.ts
 */

describe('extractMentions - actual implementation', () => {
  it('should extract single @mention from text', () => {
    const messageText = 'Hey @john, can you review this?';
    const mentions = extractMentions(messageText);

    expect(mentions).toEqual(['john']);
    expect(mentions).toHaveLength(1);
  });

  it('should extract multiple @mentions from text', () => {
    const messageText = 'Hey @john and @sarah, can you both review this? @mike too!';
    const mentions = extractMentions(messageText);

    expect(mentions).toEqual(['john', 'sarah', 'mike']);
    expect(mentions).toHaveLength(3);
  });

  it('should return unique usernames only', () => {
    const messageText = 'Hey @john, @john asked about this earlier. @john?';
    const mentions = extractMentions(messageText);

    expect(mentions).toEqual(['john']);
    expect(mentions).toHaveLength(1);
  });

  it('should handle @mentions with dots, dashes, and underscores', () => {
    const messageText = 'Hey @john.doe, @sarah_smith, and @mike-jones';
    const mentions = extractMentions(messageText);

    expect(mentions).toEqual(['john.doe', 'sarah_smith', 'mike-jones']);
    expect(mentions).toHaveLength(3);
  });

  it('should ignore @mentions followed by punctuation', () => {
    const messageText = 'Hey @john! How are you @sarah? Thanks @mike.';
    const mentions = extractMentions(messageText);

    expect(mentions).toEqual(['john', 'sarah', 'mike']);
    expect(mentions).toHaveLength(3);
  });

  it('should return empty array when no mentions found', () => {
    const messageText = 'Just a regular message with no @ symbols';
    const mentions = extractMentions(messageText);

    expect(mentions).toEqual([]);
    expect(mentions).toHaveLength(0);
  });

  it('should ignore @mentions in email addresses', () => {
    const messageText = 'Contact me at john@example.com or @sarah for help';
    const mentions = extractMentions(messageText);

    expect(mentions).toEqual(['sarah']);
    expect(mentions).toHaveLength(1);
  });

  it('should ignore @mentions starting with numbers', () => {
    const messageText = 'Check @123abc and @john but not @4567';
    const mentions = extractMentions(messageText);

    expect(mentions).toEqual(['john']);
    expect(mentions).toHaveLength(1);
  });

  it('should handle edge cases gracefully', () => {
    expect(extractMentions('')).toEqual([]);
    expect(extractMentions(null as any)).toEqual([]);
    expect(extractMentions(undefined as any)).toEqual([]);
    expect(extractMentions('@')).toEqual([]);
    expect(extractMentions('@ ')).toEqual([]);
    expect(extractMentions('@a')).toEqual([]); // Single char fails minimum length requirement
    expect(extractMentions('@ab')).toEqual(['ab']); // Min 2 chars
  });
});

describe('isValidMentionUsername - actual implementation', () => {
  it('should validate minimum username length', () => {
    expect(isValidMentionUsername('a')).toBe(false);
    expect(isValidMentionUsername('ab')).toBe(true);
  });

  it('should validate maximum username length', () => {
    const longUsername = 'a'.repeat(51);
    expect(isValidMentionUsername(longUsername)).toBe(false);
    expect(isValidMentionUsername('a'.repeat(50))).toBe(true);
  });

  it('should validate username format', () => {
    expect(isValidMentionUsername('john')).toBe(true);
    expect(isValidMentionUsername('john.doe')).toBe(true);
    expect(isValidMentionUsername('john_doe')).toBe(true);
    expect(isValidMentionUsername('john-doe')).toBe(true);
    expect(isValidMentionUsername('john123')).toBe(true);

    // Invalid formats
    expect(isValidMentionUsername('123john')).toBe(false); // starts with number
    expect(isValidMentionUsername('john!')).toBe(false);   // invalid character
    expect(isValidMentionUsername('')).toBe(false);        // empty
    expect(isValidMentionUsername(' john')).toBe(false);   // starts with space
  });
});

describe('findMentionAtCursor - actual implementation', () => {
  it('should find mention at cursor position', () => {
    const text = 'Hey @joh';
    const cursor = 8; // after 'h'
    const result = findMentionAtCursor(text, cursor);

    expect(result).toEqual({
      start: 4,
      end: 8,
      username: 'joh'
    });
  });

  it('should handle cursor immediately after @', () => {
    const text = 'Hey @';
    const cursor = 5; // after @
    const result = findMentionAtCursor(text, cursor);

    expect(result).toEqual({
      start: 4,
      end: 5,
      username: ''
    });
  });

  it('should return null when no mention at cursor', () => {
    const text = 'Hey there';
    const cursor = 5;
    const result = findMentionAtCursor(text, cursor);

    expect(result).toBeNull();
  });

  it('should return null for invalid cursor positions', () => {
    const text = 'Hey @john';

    expect(findMentionAtCursor(text, -1)).toBeNull();
    expect(findMentionAtCursor(text, 100)).toBeNull();
    expect(findMentionAtCursor('', 0)).toBeNull();
  });
});

describe('renderMentions - actual implementation', () => {
  it('should replace mentions with rendered format', () => {
    const text = 'Hey @john, can you help @sarah?';
    const renderer = (username: string) => `<span class="mention">@${username}</span>`;

    const result = renderMentions(text, renderer);

    expect(result).toBe('Hey <span class="mention">@john</span>, can you help <span class="mention">@sarah</span>?');
  });

  it('should handle text without mentions', () => {
    const text = 'Just regular text';
    const renderer = (username: string) => `<span class="mention">@${username}</span>`;

    const result = renderMentions(text, renderer);

    expect(result).toBe('Just regular text');
  });

  it('should handle empty text gracefully', () => {
    const renderer = (username: string) => `<span class="mention">@${username}</span>`;

    expect(renderMentions('', renderer)).toBe('');
    expect(renderMentions(null as any, renderer)).toBe(null);
    expect(renderMentions(undefined as any, renderer)).toBe(undefined);
  });
});