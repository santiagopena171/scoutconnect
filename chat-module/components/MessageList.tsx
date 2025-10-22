// ============================================
// COMPONENT: MessageList
// ============================================

import React, { useRef, useEffect, useState } from 'react';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import type { MessageWithSender, PresenceState } from '../types';
import './MessageList.css';

interface MessageListProps {
  messages: MessageWithSender[];
  presenceState: PresenceState;
  currentUserId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onEdit?: (messageId: string, newBody: string) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  presenceState,
  currentUserId,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onEdit,
  onDelete,
  onReport,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (shouldAutoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    
    // Check if user is near bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);

    // Load more when scrolled to top
    if (scrollTop === 0 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  const groupMessagesByDate = (messages: MessageWithSender[]) => {
    const groups: { date: string; messages: MessageWithSender[] }[] = [];
    
    messages.forEach((message) => {
      const date = new Date(message.created_at);
      const dateStr = formatDateHeader(date);
      
      const existingGroup = groups.find(g => g.date === dateStr);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateStr, messages: [message] });
      }
    });
    
    return groups;
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    
    return date.toLocaleDateString('es-UY', { 
      day: 'numeric', 
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const messageGroups = groupMessagesByDate(messages);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="message-list empty">
        <div className="empty-state-messages">
          <div className="empty-icon">
            <i className="fas fa-comments"></i>
          </div>
          <h3>Aún no hay mensajes</h3>
          <p>
            Presentate y pedile sus videos por faceta.<br />
            Compartí enlaces de YouTube o Google Drive.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="message-list" 
      ref={listRef}
      onScroll={handleScroll}
    >
      {/* Load More Indicator */}
      {hasMore && (
        <div className="load-more-indicator">
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Cargando más mensajes...</span>
            </>
          ) : (
            <button onClick={onLoadMore} className="load-more-btn">
              Cargar mensajes anteriores
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="message-group">
          <div className="date-divider">
            <span>{group.date}</span>
          </div>
          
          {group.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
            />
          ))}
        </div>
      ))}

      {/* Typing Indicator */}
      {presenceState.typing_users.length > 0 && (
        <TypingIndicator 
          typingUsers={presenceState.typing_users}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};
