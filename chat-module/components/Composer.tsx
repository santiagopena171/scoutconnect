// ============================================
// COMPONENT: Composer
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { getFacetTagsByPosition } from '../utils/facetTags';
import type { FacetTag, SendMessageParams } from '../types';
import './Composer.css';

interface ComposerProps {
  playerPosition?: string;
  canSend: boolean;
  messagesRemaining: number;
  onSend: (params: SendMessageParams) => Promise<void>;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  playerPosition,
  canSend,
  messagesRemaining,
  onSend,
  onTypingStart,
  onTypingStop,
}) => {
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedTag, setSelectedTag] = useState<FacetTag | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const facetTags = playerPosition 
    ? getFacetTagsByPosition(playerPosition)
    : [];

  const charCount = body.length;
  const maxChars = 5000;
  const isOverLimit = charCount > maxChars;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 120; // 5 lines approx
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [body]);

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);

    // Typing indicator
    onTypingStart();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSend = async () => {
    const trimmedBody = body.trim();
    const trimmedUrl = linkUrl.trim();

    // Validation
    if (!trimmedBody && !trimmedUrl) {
      return;
    }

    if (trimmedUrl && !validateUrl(trimmedUrl)) {
      alert('El enlace debe ser una URL válida (HTTP o HTTPS)');
      return;
    }

    if (!canSend) {
      alert(`Límite de mensajes alcanzado. Esperá unos segundos. (${messagesRemaining} mensajes restantes)`);
      return;
    }

    if (isOverLimit) {
      alert('El mensaje excede el límite de 5000 caracteres');
      return;
    }

    // Send
    try {
      setIsSending(true);
      
      const params: SendMessageParams = {
        body: trimmedBody || undefined,
        link_url: trimmedUrl || undefined,
        facet_tag: selectedTag || undefined,
      };

      await onSend(params);

      // Clear inputs
      setBody('');
      setLinkUrl('');
      setSelectedTag(null);
      setShowLinkInput(false);
      setShowTagSelector(false);
      
      onTypingStop();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="composer">
      {/* Facet Tag Selector */}
      {showTagSelector && facetTags.length > 0 && (
        <div className="facet-tag-selector">
          <div className="tag-selector-header">
            <span>Seleccioná una faceta:</span>
            <button onClick={() => setShowTagSelector(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="tag-chips">
            {facetTags.map((tag) => (
              <button
                key={tag.value}
                className={`tag-chip ${selectedTag === tag.value ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTag(tag.value);
                  setShowTagSelector(false);
                }}
                title={tag.description}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Tag Display */}
      {selectedTag && (
        <div className="selected-tag-display">
          <span className="tag-label">
            {facetTags.find(t => t.value === selectedTag)?.label || selectedTag}
          </span>
          <button 
            onClick={() => setSelectedTag(null)}
            className="remove-tag"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Link Input */}
      {showLinkInput && (
        <div className="link-input-wrapper">
          <input
            type="url"
            placeholder="Pegá el enlace (YouTube, Google Drive, etc.)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="link-input"
          />
          <button 
            onClick={() => {
              setLinkUrl('');
              setShowLinkInput(false);
            }}
            className="remove-link"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Main Input Area */}
      <div className="composer-main">
        {/* Toolbar */}
        <div className="composer-toolbar">
          <button
            onClick={() => setShowLinkInput(!showLinkInput)}
            className="toolbar-btn"
            title="Agregar enlace"
          >
            <i className="fas fa-link"></i>
          </button>
          
          {facetTags.length > 0 && (
            <button
              onClick={() => setShowTagSelector(!showTagSelector)}
              className="toolbar-btn"
              title="Agregar faceta"
            >
              <i className="fas fa-tag"></i>
            </button>
          )}
        </div>

        {/* Textarea */}
        <div className="composer-input-wrapper">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={handleBodyChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribí un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
            className="composer-textarea"
            disabled={isSending}
            maxLength={maxChars + 100} // Allow typing a bit over to show warning
          />
          
          {/* Character Counter */}
          <div className={`char-counter ${isOverLimit ? 'over-limit' : ''}`}>
            {charCount}/{maxChars}
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isSending || isOverLimit || (!body.trim() && !linkUrl.trim()) || !canSend}
          className="send-button"
          title={!canSend ? `Esperá unos segundos (${messagesRemaining} mensajes restantes)` : 'Enviar mensaje'}
        >
          {isSending ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </div>

      {/* Anti-spam warning */}
      {!canSend && (
        <div className="spam-warning">
          <i className="fas fa-exclamation-triangle"></i>
          Límite de mensajes alcanzado. Esperá {messagesRemaining === 0 ? '15' : 'unos'} segundos.
        </div>
      )}
    </div>
  );
};
