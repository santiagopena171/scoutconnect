// ============================================
// COMPONENT: MessageItem
// ============================================

import React, { useState } from 'react';
import type { MessageWithSender, FacetTag } from '../types';
import './MessageItem.css';

interface MessageItemProps {
  message: MessageWithSender;
  onEdit?: (messageId: string, newBody: string) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onEdit,
  onDelete,
  onReport,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.body || '');
  const [showActions, setShowActions] = useState(false);

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(message.body || '');
    setIsEditing(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-UY', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFacetTagLabel = (tag: FacetTag) => {
    const labels: Record<FacetTag, string> = {
      definicion: '⚽ Definición',
      desmarque: '🏃 Desmarque',
      presion: '💪 Presión',
      control_pase: '🎯 Control y Pase',
      recuperacion: '🛡️ Recuperación',
      transicion: '⚡ Transición',
      anticipos: '👀 Anticipos',
      duelo_aereo: '🦅 Duelo Aéreo',
      salida: '🚀 Salida',
      reflejos: '🧤 Reflejos',
      juego_pies: '👟 Juego con Pies',
      centros_1v1: '🥅 Centros y 1v1',
    };
    return labels[tag] || tag;
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Deleted message
  if (message.deleted_at) {
    return (
      <div className={`message-wrapper ${message.is_own ? 'own' : 'other'}`}>
        <div className="message-bubble deleted">
          <i className="fas fa-ban"></i>
          <span>Mensaje eliminado</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`message-wrapper ${message.is_own ? 'own' : 'other'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!message.is_own && (
        <div className="message-avatar">
          {message.sender.avatar_url ? (
            <img src={message.sender.avatar_url} alt={message.sender.full_name} />
          ) : (
            <div className="avatar-placeholder-small">
              {message.sender.full_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div className="message-content">
        {!message.is_own && (
          <span className="sender-name">{message.sender.full_name}</span>
        )}

        <div className="message-bubble">
          {/* Facet Tag */}
          {message.facet_tag && (
            <div className="facet-tag-badge">
              {getFacetTagLabel(message.facet_tag)}
            </div>
          )}

          {/* Message Body */}
          {isEditing ? (
            <div className="message-edit">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={5000}
                autoFocus
              />
              <div className="edit-actions">
                <button onClick={handleCancelEdit} className="btn-cancel">
                  Cancelar
                </button>
                <button onClick={handleSaveEdit} className="btn-save">
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <>
              {message.body && (
                <p className="message-text">{message.body}</p>
              )}

              {/* Link Preview */}
              {message.link_url && (
                <div className="link-preview">
                  {message.link_url.includes('youtube.com') || message.link_url.includes('youtu.be') ? (
                    <div className="youtube-embed">
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${extractYouTubeId(message.link_url)}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video"
                      ></iframe>
                    </div>
                  ) : (
                    <a 
                      href={message.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="external-link"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      {message.link_url}
                    </a>
                  )}
                </div>
              )}
            </>
          )}

          {/* Message Meta */}
          <div className="message-meta">
            <span className="message-time">{formatTime(message.created_at)}</span>
            {message.edited_at && (
              <span className="edited-indicator">(editado)</span>
            )}
            {message.is_own && (
              <span className="status-icon">
                {message.status === 'seen' ? (
                  <i className="fas fa-check-double seen"></i>
                ) : (
                  <i className="fas fa-check delivered"></i>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Message Actions */}
        {showActions && (
          <div className="message-actions">
            {message.is_own ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="action-btn"
                  title="Editar"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  onClick={() => onDelete?.(message.id)}
                  className="action-btn danger"
                  title="Eliminar"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </>
            ) : (
              <button 
                onClick={() => onReport?.(message.id)}
                className="action-btn"
                title="Reportar"
              >
                <i className="fas fa-flag"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
