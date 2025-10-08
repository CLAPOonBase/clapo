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
          className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
        >
          @{username}
        </span>
      );
    } else {
      // Mention without user data (just style it)
      parts.push(
        <span key={`mention-${key++}`} className="text-blue-400 font-medium">
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
