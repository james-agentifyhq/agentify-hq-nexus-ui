'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';

interface MentionUser {
  _id: Id<'members'>;
  userId: Id<'users'>;
  displayName: string;
  username: string;
}

interface MentionAutocompleteProps {
  workspaceId: Id<'workspaces'>;
  searchTerm: string;
  position?: { x: number; y: number };
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
  className?: string;
}

export function MentionAutocomplete({
  workspaceId,
  searchTerm,
  position = { x: 0, y: 0 },
  onSelect,
  onClose,
  className,
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Query members with search term
  const members = useQuery(api.members.getByUsername, {
    workspaceId,
    searchTerm,
    limit: 10,
  });

  useEffect(() => {
    if (members !== undefined) {
      setIsLoading(false);
      setSelectedIndex(0); // Reset selection when results change
    }
  }, [members]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement> | KeyboardEvent) => {
      if (!members?.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < members.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : members.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (members[selectedIndex]) {
            onSelect(members[selectedIndex]);
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (members.length > 0) {
            onSelect(members[0]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    // Add event listener to document for global keyboard handling
    document.addEventListener('keydown', handleKeyDown as any);

    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [members, selectedIndex, onSelect, onClose]);

  // Don't render if no results or still loading and no cache
  if (!members || (isLoading && !members.length)) {
    return (
      <div
        className={cn(
          "absolute z-50 bg-white border border-slate-200 rounded-md shadow-lg p-2 min-w-[200px]",
          className
        )}
        style={{ left: position.x, top: position.y }}
      >
        <div className="text-sm text-slate-500 p-2">
          Loading members...
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div
        className={cn(
          "absolute z-50 bg-white border border-slate-200 rounded-md shadow-lg p-2 min-w-[200px]",
          className
        )}
        style={{ left: position.x, top: position.y }}
      >
        <div className="text-sm text-slate-500 p-2">
          No members found
        </div>
      </div>
    );
  }

  return (
    <div
      ref={autocompleteRef}
      className={cn(
        "absolute z-50 bg-white border border-slate-200 rounded-md shadow-lg py-1 min-w-[200px] max-h-[200px] overflow-y-auto",
        className
      )}
      style={{ left: position.x, top: position.y }}
    >
      {members.map((member, index) => (
        <div
          key={member._id}
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors",
            index === selectedIndex
              ? "bg-slate-100 text-slate-900"
              : "text-slate-700 hover:bg-slate-50"
          )}
          onClick={() => onSelect(member)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="flex-shrink-0 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
            {member.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-slate-900 truncate">
              {member.displayName}
            </div>
            <div className="text-xs text-slate-500 truncate">
              @{member.username}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}