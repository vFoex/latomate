import React, { useState, useRef, useEffect } from 'react';
import { SessionTag } from '../types/settings';
import { getTranslation } from '../utils/i18n';

interface TagsSelectorProps {
  availableTags: SessionTag[];
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
  language: 'en' | 'fr';
  disabled?: boolean;
}

export const TagsSelector: React.FC<TagsSelectorProps> = ({
  availableTags,
  selectedTags,
  onToggleTag,
  language,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (tagId: string) => {
    onToggleTag(tagId);
  };

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="tags-section" ref={containerRef}>
      <p className="tags-label">{getTranslation('tags.selectTags', language)}</p>
      <div className="tags-selector-container">
        <button
          className={`tags-toggle-button ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          type="button"
        >
          <div className="tags-toggle-content">
            <span>
              {selectedTags.length === 0
                ? getTranslation('tags.selectTags', language)
                : `${selectedTags.length} ${selectedTags.length === 1 ? 'tag' : 'tags'}`}
            </span>
            {selectedTags.length > 0 && (
              <span className="tags-count">{selectedTags.length}</span>
            )}
          </div>
          <span className="material-symbols-outlined tags-toggle-icon">
            expand_more
          </span>
        </button>

        {isOpen && (
          <div className="tags-dropdown">
            {availableTags.length === 0 ? (
              <div className="tags-empty-message">
                {getTranslation('tags.noTags', language)}
              </div>
            ) : (
              <div className="tags-dropdown-list">
                {availableTags.map((tag) => (
                  <label key={tag.id} className="tag-item-toggle">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => handleToggle(tag.id)}
                      disabled={disabled}
                    />
                    <div className="tag-toggle-name">
                      <span
                        className="tag-color-dot"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
