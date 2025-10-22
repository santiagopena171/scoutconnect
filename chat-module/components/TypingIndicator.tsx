// ============================================
// COMPONENT: TypingIndicator
// ============================================

import React from 'react';
import type { TypingUser } from '../types';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  currentUserId,
}) => {
  // Filter out current user
  const otherUsers = typingUsers.filter(u => u.user_id !== currentUserId);

  if (otherUsers.length === 0) return null;

  const getTypingText = () => {
    if (otherUsers.length === 1) {
      return `${otherUsers[0].name} está escribiendo`;
    }
    
    if (otherUsers.length === 2) {
      return `${otherUsers[0].name} y ${otherUsers[1].name} están escribiendo`;
    }
    
    return `${otherUsers.length} personas están escribiendo`;
  };

  return (
    <div className="typing-indicator-wrapper">
      <div className="typing-indicator">
        <div className="typing-avatar-group">
          {otherUsers.slice(0, 3).map((user) => (
            <div key={user.user_id} className="typing-avatar-mini">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="typing-text">
          <span>{getTypingText()}</span>
          <div className="typing-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
