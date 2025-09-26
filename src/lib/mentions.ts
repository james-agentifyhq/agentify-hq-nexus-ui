/**
 * @Mentions Detection Utility
 *
 * Supports Story 1.2 @Mentions and Notification System:
 * - Extract @username patterns from message text
 * - Validate username formats according to platform rules
 * - Support autocomplete and notification creation workflows
 */

/**
 * Extract @mention usernames from message text
 *
 * Rules:
 * - Username must start with letter (a-zA-Z)
 * - Can contain letters, numbers, dots, dashes, underscores
 * - Must be 2-50 characters long
 * - Must be at word boundaries (not inside emails/URLs)
 * - Returns unique usernames only
 *
 * @param text - Message text to search for mentions
 * @returns Array of unique usernames (without @ symbol)
 */
export function extractMentions(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Use a more comprehensive approach that finds potential mentions and validates them
  // Find all @ symbols followed by valid username characters
  const mentionRegex = /(?<!\w)@([a-zA-Z][a-zA-Z0-9._-]*)/g;

  const matches = Array.from(text.matchAll(mentionRegex));

  // Extract and validate usernames
  const usernames = matches.map(match => {
    let username = match[1];

    // Remove trailing punctuation that's not part of username
    while (username.length > 0 && /[.,!?;:]$/.test(username)) {
      username = username.slice(0, -1);
    }

    // Apply length restrictions
    if (username.length < 2 || username.length > 50) {
      return null;
    }

    return username;
  }).filter(Boolean) as string[];

  // Return unique usernames only
  return [...new Set(usernames)];
}

/**
 * Validate username format for @mentions
 *
 * @param username - Username to validate (without @ symbol)
 * @returns true if username format is valid
 */
export function isValidMentionUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }

  // Check length: 2-50 characters
  if (username.length < 2 || username.length > 50) {
    return false;
  }

  // Check format: starts with letter, contains only allowed characters
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
  return usernameRegex.test(username);
}

/**
 * Find potential @mention at cursor position for autocomplete
 *
 * Used by autocomplete UI to determine when to show mention dropdown
 * and what partial username to search for.
 *
 * @param text - Current message text
 * @param cursorPosition - Current cursor position in text
 * @returns Object with mention info or null if no mention at cursor
 */
export function findMentionAtCursor(
  text: string,
  cursorPosition: number
): { start: number; end: number; username: string } | null {
  if (!text || cursorPosition < 0 || cursorPosition > text.length) {
    return null;
  }

  // Find @ symbols before cursor position
  let atPosition = -1;
  for (let i = cursorPosition - 1; i >= 0; i--) {
    if (text[i] === '@') {
      atPosition = i;
      break;
    }
    // Stop if we hit whitespace or other word boundary
    if (/\s/.test(text[i])) {
      break;
    }
  }

  if (atPosition === -1) {
    return null;
  }

  // Extract the partial username from @ to cursor
  const partialMention = text.substring(atPosition + 1, cursorPosition);

  // Must be a valid partial username (can be empty for just @)
  if (partialMention && !isValidMentionUsernamePartial(partialMention)) {
    return null;
  }

  return {
    start: atPosition,
    end: cursorPosition,
    username: partialMention,
  };
}

/**
 * Validate partial username for autocomplete (more lenient than full validation)
 *
 * @param partial - Partial username being typed
 * @returns true if partial format could become valid
 */
function isValidMentionUsernamePartial(partial: string): boolean {
  if (!partial) {
    return true; // Empty is valid for just "@"
  }

  // Must start with letter
  if (!/^[a-zA-Z]/.test(partial)) {
    return false;
  }

  // Must contain only allowed characters
  return /^[a-zA-Z0-9._-]*$/.test(partial);
}

/**
 * Replace @mentions in text with formatted HTML or styled components
 *
 * Used for rendering mentions in messages with highlighting
 *
 * @param text - Message text containing mentions
 * @param mentionRenderer - Function to render each mention
 * @returns Text with mentions replaced by rendered components
 */
export function renderMentions(
  text: string,
  mentionRenderer: (username: string) => string
): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const mentionRegex = /(?<!\w)@([a-zA-Z][a-zA-Z0-9._-]*)/g;

  return text.replace(mentionRegex, (match, username) => {
    // Clean up trailing punctuation
    let cleanUsername = username;
    while (cleanUsername.length > 0 && /[.,!?;:]$/.test(cleanUsername)) {
      cleanUsername = cleanUsername.slice(0, -1);
    }

    // Only render valid usernames
    if (cleanUsername.length >= 2 && cleanUsername.length <= 50) {
      return mentionRenderer(cleanUsername);
    }

    return match; // Return original if invalid
  });
}

/**
 * Count @mentions in text
 *
 * @param text - Message text to analyze
 * @returns Number of unique mentions found
 */
export function countMentions(text: string): number {
  return extractMentions(text).length;
}

/**
 * Check if text contains any @mentions
 *
 * @param text - Message text to check
 * @returns true if text contains at least one mention
 */
export function hasMentions(text: string): boolean {
  return countMentions(text) > 0;
}