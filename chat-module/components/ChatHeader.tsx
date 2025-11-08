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

function resolveProfileName(profile: Profile | null): string {
  if (!profile) {
    return 'Usuario';
  }

  if (profile.full_name && profile.full_name.trim().length > 0) {
    return profile.full_name.trim();
  }

  const raw = profile as unknown as Record<string, unknown>;
  const candidate = [
    typeof raw.first_name === 'string' ? raw.first_name.trim() : '',
    typeof raw.last_name === 'string' ? raw.last_name.trim() : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (candidate.length > 0) {
    return candidate;
  }

  const username = typeof raw.username === 'string' ? raw.username.trim() : '';
  if (username.length > 0) {
    return username;
  }

  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  if (email.length > 0) {
    return email;
  }

  return 'Usuario';
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  participant,
  presenceState,
  onBack,
}) => {
  const participantName = resolveProfileName(participant);
  const isOnline = participant
    ? presenceState.online_users.some((u) => u.user_id === participant.id)
    : false;

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

  const roleBadge = participant ? getRoleBadge(participant.role) : null;

  const getLastSeenText = () => {
    if (!participant) {
      return 'Seleccioná una conversación';
    }

    if (isOnline) {
      return 'En línea';
    }

    return 'Última vez hace un momento';
  };

  const handleAvatarClick = () => {
    if (!participant) return;
    
    // Determinar el rol del participante (usar user_type como fallback)
    const participantRole = String(participant.role || (participant as any).user_type || 'scout');
    
    // Determinar la ruta del perfil según el rol del usuario
    const isPlayer = participantRole === 'player' || participantRole === 'jugador';
    const profileRoute = isPlayer
      ? `perfil-jugador.html?id=${participant.id}`
      : `perfil-scout.html?id=${participant.id}`;
    
    // Redirigir a la carpeta public
    window.location.href = `/public/${profileRoute}`;
  };

  return (
    <div className={`chat-header ${participant ? '' : 'empty'}`}>
      {onBack && (
        <button className="header-back-btn" onClick={onBack} aria-label="Volver">
          <span aria-hidden="true">←</span>
        </button>
      )}

      <div 
        className="header-avatar" 
        onClick={handleAvatarClick}
        style={{ cursor: participant ? 'pointer' : 'default' }}
        title={participant ? `Ver perfil de ${participantName}` : ''}
      >
        <div className="header-avatar-img" aria-hidden={!participant}>
          {participant?.avatar_url ? (
            <img src={participant.avatar_url} alt={participantName} />
          ) : (
            <span>{participantName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        {participant && isOnline && <span className="header-online-indicator"></span>}
      </div>

      <div className="header-info">
        <div className="header-name-row">
          <span className="header-name">{participantName}</span>
          {participant && roleBadge && (
            <span className={`role-badge role-${participant.role}`} style={{ backgroundColor: roleBadge.color }}>
              <i className={`fas ${roleBadge.icon}`}></i>
              {roleBadge.text}
            </span>
          )}
        </div>
        <div className={`header-status ${participant ? (isOnline ? 'online' : '') : 'empty'}`}>
          {getLastSeenText()}
        </div>
      </div>

      <div className="header-actions">
        <button className="header-action-btn" title="Buscar en conversación" type="button">
          <i className="fas fa-search"></i>
        </button>
        <button className="header-action-btn" title="Más opciones" type="button">
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
    </div>
  );
};
