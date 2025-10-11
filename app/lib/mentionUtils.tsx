// Utility functions for handling user mentions in posts
import React, { JSX } from 'react';

export interface Mention {
  username: string;
  userId: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract mentions from text
 * Matches @username format
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  if (!matches) return [];

  // Remove @ symbol and return unique usernames
  return [...new Set(matches.map(match => match.slice(1)))];
}

/**
 * Parse text and identify mention positions
 */
export function parseMentions(text: string): Mention[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: Mention[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      userId: '', // Will be populated when matched with user data
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
}

/**
 * Render text with mentions as JSX
 */
export function renderTextWithMentions(
  text: string,
  mentions?: Array<{ username: string; user_id: string }>,
  onMentionClick?: (userId: string, username: string) => void
): (string | JSX.Element)[] {
  if (!text) return [];

  const mentionRegex = /@(\w+)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1];
    const mentionData = mentions?.find(m => m.username === username);

    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add mention as clickable element
    if (mentionData) {
      parts.push(
        <span
          key={`mention-${key++}`}
          onClick={(e) => {
            e.stopPropagation();
            onMentionClick?.(mentionData.user_id, username);
          }}
          className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium underline"
          style={{ cursor: 'pointer' }}
          title={`View ${username}'s profile`}
        >
          @{username}
        </span>
      );
    } else {
      // Mention without user data - make it clickable but show a message
      parts.push(
        <span 
          key={`mention-${key++}`} 
          className="text-blue-400 font-medium underline cursor-pointer"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            if (onMentionClick) {
              // Try to find user by username - this will be handled by the parent component
              onMentionClick('', username);
            }
          }}
          title={`@${username}`}
        >
          @{username}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Validate username format for mentions
 */
export function isValidUsername(username: string): boolean {
  // Username should be alphanumeric and underscore, 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Resolve usernames to user data for mentions
 */
export async function resolveMentionsFromText(
  text: string,
  apiService: any
): Promise<Array<{ username: string; user_id: string }>> {
  const usernames = extractMentions(text);
  if (usernames.length === 0) return [];

  try {
    // Get user data for all mentioned usernames
    const userPromises = usernames.map(async (username) => {
      try {
        const user = await apiService.searchUsers(username, 1);
        if (user.users && user.users.length > 0) {
          const foundUser = user.users.find((u: any) => u.username === username);
          if (foundUser) {
            return {
              username: foundUser.username,
              user_id: foundUser.id
            };
          }
        }
        return null;
      } catch (error) {
        console.error(`Error fetching user ${username}:`, error);
        return null;
      }
    });

    const results = await Promise.all(userPromises);
    return results.filter((result): result is { username: string; user_id: string } => result !== null);
  } catch (error) {
    console.error('Error resolving mentions:', error);
    return [];
  }
}

/**
 * Get cursor position for mention autocomplete
 */
export function getMentionTriggerInfo(
  text: string,
  cursorPosition: number
): { triggered: boolean; searchText: string; startPos: number } | null {
  if (cursorPosition === 0) return null;

  // Look backwards from cursor to find @
  let startPos = cursorPosition - 1;
  while (startPos >= 0 && text[startPos] !== '@' && text[startPos] !== ' ' && text[startPos] !== '\n') {
    startPos--;
  }

  if (startPos >= 0 && text[startPos] === '@') {
    const searchText = text.slice(startPos + 1, cursorPosition);
    // Only trigger if searchText doesn't contain spaces
    if (!searchText.includes(' ') && !searchText.includes('\n')) {
      return {
        triggered: true,
        searchText,
        startPos,
      };
    }
  }

  return null;
}

/**
 * Replace mention text at position
 */
export function replaceMentionText(
  text: string,
  startPos: number,
  cursorPosition: number,
  username: string
): { newText: string; newCursorPosition: number } {
  const before = text.slice(0, startPos);
  const after = text.slice(cursorPosition);
  const mentionText = `@${username} `;
  const newText = before + mentionText + after;
  const newCursorPosition = startPos + mentionText.length;

  return { newText, newCursorPosition };
}
