// ============================================
// COMPONENT: ChatHeader
// ============================================

import React from 'react';
import type { Profile, PresenceState } from '../types';
import './ChatHeader.css';

interface ChatHeaderProps {
  participant: Profile | null;
  presenceState: PresenceState;
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  participant,
  presenceState,
  onBack,
}) => {
  if (!participant) {
    return (
      <div className="chat-header empty">
        <div className="header-placeholder">
          Seleccioná una conversación
        </div>
      </div>
    );
  }

  const isOnline = presenceState.online_users.some(
    u => u.user_id === participant.id
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'scout':
        return { text: 'Scout', icon: 'fa-search', color: '#00A859' };
      case 'player':
        return { text: 'Futbolista', icon: 'fa-futbol', color: '#007C45' };
      case 'admin':
        return { text: 'Admin', icon: 'fa-shield-alt', color: '#4A4A4A' };
      default:
        return { text: 'Usuario', icon: 'fa-user', color: '#4A4A4A' };
    }
  };

  const roleBadge = getRoleBadge(participant.role);

  const getLastSeenText = () => {
    if (isOnline) return 'En línea';
    
    // Could fetch last_active_at from conversation_presence
    return 'Última vez hace un momento';
  };

  return (
    <div className="chat-header">
      {onBack && (
        <button className="back-button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
      )}

      {/* Avatar */}
      <div className="header-avatar">
        {participant.avatar_url ? (
          <img src={participant.avatar_url} alt={participant.full_name} />
        ) : (
          <div className="avatar-placeholder">
            <i className="fas fa-user"></i>
          </div>
        )}
        {isOnline && <span className="online-indicator"></span>}
      </div>

      {/* Info */}
      <div className="header-info">
        <h2 className="header-name">{participant.full_name}</h2>
        <div className="header-meta">
          <span 
            className="role-badge" 
            style={{ backgroundColor: roleBadge.color }}
          >
            <i className={`fas ${roleBadge.icon}`}></i>
            {roleBadge.text}
          </span>
          <span className="status-text">
            {getLastSeenText()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button className="icon-button" title="Buscar en conversación">
          <i className="fas fa-search"></i>
        </button>
        <button className="icon-button" title="Más opciones">
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
    </div>
  );
};
