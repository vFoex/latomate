import { useState, useEffect } from 'react';
import { getTranslation, type Language } from '../utils/i18n';
import { getUserTags, addTag, deleteTag, updateTag } from '../utils/tags';
import type { SessionTag } from '../types/settings';
import '../styles/tags.css';

interface TagsManagerProps {
  language: Language;
}

export function TagsManager({ language }: TagsManagerProps) {
  const [tags, setTags] = useState<SessionTag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', color: '#e74c3c' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const DEFAULT_COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
  ];

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const fetchedTags = await getUserTags();
    setTags(fetchedTags);
  };

  const handleAddClick = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({ name: '', color: DEFAULT_COLORS[tags.length % DEFAULT_COLORS.length] });
    setError('');
  };

  const handleSaveTag = async () => {
    if (!formData.name.trim()) {
      setError(getTranslation('tags.tagName', language) + ' is required');
      return;
    }

    try {
      if (editingId) {
        await updateTag(editingId, { name: formData.name, color: formData.color });
      } else {
        await addTag(formData.name, formData.color);
      }
      
      await loadTags();
      setShowForm(false);
      setFormData({ name: '', color: '#e74c3c' });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving tag');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('Delete this tag?')) {
      await deleteTag(tagId);
      await loadTags();
    }
  };

  return (
    <div className="tags-manager">
      <div className="tags-manager-header">
        <h3 className="tags-manager-title">{getTranslation('tags.title', language)}</h3>
        <button className="add-tag-btn" onClick={handleAddClick}>
          {getTranslation('tags.addNew', language)}
        </button>
      </div>

      {showForm && (
        <div className="tag-input-form">
          <div className="form-group">
            <label className="form-label">{getTranslation('tags.tagName', language)}</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={getTranslation('tags.tagName', language)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{getTranslation('tags.tagColor', language)}</label>
            <div className="color-picker-container">
              {DEFAULT_COLORS.map((color) => (
                <div
                  key={color}
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                  title={color}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="form-group" style={{ color: '#e74c3c', fontSize: '12px' }}>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              className="cancel-tag-btn"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setError('');
              }}
            >
              {getTranslation('common.cancel', language)}
            </button>
            <button className="save-tag-btn" onClick={handleSaveTag}>
              {getTranslation('common.save', language)}
            </button>
          </div>
        </div>
      )}

      <div className="tags-list-container">
        {tags.length === 0 && !showForm && (
          <p className="no-tags-message">{getTranslation('tags.noTags', language)}</p>
        )}
        
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="tag-item"
            style={{ borderLeftColor: tag.color }}
          >
            <div className="tag-info">
              <div
                className="tag-color"
                style={{ backgroundColor: tag.color }}
              />
              <span className="tag-name">{tag.name}</span>
            </div>
            <button
              className="tag-delete-btn"
              onClick={() => handleDeleteTag(tag.id)}
            >
              {getTranslation('tags.delete', language)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
