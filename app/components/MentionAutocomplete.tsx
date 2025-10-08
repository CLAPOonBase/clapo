'use client';

import React, { useEffect, useState, useRef } from 'react';
import { apiService } from '../lib/api';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  avatar_url?: string;
  name?: string;
}

interface MentionAutocompleteProps {
  searchText: string;
  onSelect: (user: User) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export default function MentionAutocomplete({
  searchText,
  onSelect,
  onClose,
  position,
}: MentionAutocompleteProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchText.length < 1) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiService.searchUsers(searchText, 5, 0);
        setUsers(response.users || []);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!users.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % users.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (users[selectedIndex]) {
          onSelect(users[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [users, selectedIndex, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!searchText && !users.length) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '250px',
        maxWidth: '300px',
      }}
    >
      {loading ? (
        <div className="p-3 text-center text-gray-400 text-sm">
          Searching...
        </div>
      ) : users.length > 0 ? (
        <div className="max-h-64 overflow-y-auto">
          {users.map((user, index) => (
            <div
              key={user.id}
              onClick={() => onSelect(user)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`p-3 cursor-pointer flex items-center space-x-3 transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-600 bg-opacity-20'
                  : 'hover:bg-gray-700'
              }`}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  @{user.username}
                </div>
                {user.name && (
                  <div className="text-gray-400 text-xs truncate">
                    {user.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 text-center text-gray-400 text-sm">
          No users found
        </div>
      )}
    </div>
  );
}
