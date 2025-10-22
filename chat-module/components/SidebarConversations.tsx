// ============================================
// COMPONENT: SidebarConversations
// ============================================

import React, { useMemo, useState } from 'react';
import type { ConversationWithDetails } from '../types';
import './SidebarConversations.css';

interface SidebarConversationsProps {
  currentUserId: string;
  conversations: ConversationWithDetails[];
  isLoading?: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export const SidebarConversations: React.FC<SidebarConversationsProps> = ({
  currentUserId,
  conversations,
  isLoading = false,
  selectedConversationId,
  onSelectConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;

    const query = searchQuery.toLowerCase();

    return conversations.filter((conv) => {
      const participantMatch = conv.participants.some((p) =>
        p.full_name.toLowerCase().includes(query)
      );

      const messageMatch = conv.last_message?.body
        ?.toLowerCase()
        .includes(query);

      return participantMatch || messageMatch;
    });
  }, [conversations, searchQuery]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
  };

  const getOtherParticipant = (conv: ConversationWithDetails) => {
    return conv.participants.find(p => p.id !== currentUserId);
  };

  return (
    <div className="sidebar-conversations">
      {/* Search Bar */}
      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar conversaciones"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search"
              onClick={() => setSearchQuery('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {isLoading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Cargando conversaciones...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-comments"></i>
            <h3>No hay conversaciones</h3>
            <p>
              {searchQuery 
                ? 'No se encontraron resultados'
                : 'Aún no tenés conversaciones. Comenzá una nueva desde el perfil de un jugador.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherParticipant = getOtherParticipant(conv);
            const isSelected = conv.id === selectedConversationId;

            return (
              <div
                key={conv.id}
                className={`conversation-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectConversation(conv.id)}
              >
                {/* Avatar */}
                <div className="conversation-avatar">
                  {otherParticipant?.avatar_url ? (
                    <img 
                      src={otherParticipant.avatar_url} 
                      alt={otherParticipant.full_name}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  {conv.unread_count > 0 && (
                    <span className="unread-badge">{conv.unread_count}</span>
                  )}
                </div>

                {/* Content */}
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h4 className="conversation-name">
                      {conv.is_group 
                        ? conv.title 
                        : otherParticipant?.full_name || 'Usuario'}
                    </h4>
                    {conv.last_message && (
                      <span className="conversation-time">
                        {formatTimestamp(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  
                  {conv.last_message && (
                    <p className="conversation-preview">
                      {conv.last_message.sender_name === otherParticipant?.full_name
                        ? conv.last_message.body
                        : `Vos: ${conv.last_message.body}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
