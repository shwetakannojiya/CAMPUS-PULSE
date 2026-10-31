import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import Button from '../common/Button';
import { MAX_NOTICE_CHARS } from '../../lib/constants';
import { SAMPLE_NOTICES } from '../../lib/sampleNotices';

export default function NoticeInput({ onExtract, isLoading = false }) {
  const [text, setText] = useState('');

  const charCount = text.length;
  const isNearLimit = charCount > MAX_NOTICE_CHARS * 0.9;
  const isOverLimit = charCount > MAX_NOTICE_CHARS;
  const isEmpty = !text.trim();

  const handleSelectSample = (sampleText) => {
    setText(sampleText);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEmpty || isOverLimit || isLoading) return;
    onExtract(text);
  };

  return (
    <div className="card parser-card">
      <div className="parser-header">
        <h2>
          <Sparkles size={20} color="var(--primary)" />
          Turn any notice into an event
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          WhatsApp, emails, messy posters
        </span>
      </div>

      <div className="sample-pills">
        <span className="sample-label">Try sample:</span>
        {SAMPLE_NOTICES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="pill-btn"
            onClick={() => handleSelectSample(sample.text)}
            title={sample.badge}
          >
            {sample.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="textarea-container">
          <textarea
            className="notice-textarea"
            placeholder="Paste raw WhatsApp forwards, email announcements, or poster text here... (e.g. 'Workshop this Friday at 3 PM in Lab 2...')"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            maxLength={MAX_NOTICE_CHARS + 100} /* slight leeway to show over-limit warning */
          />
        </div>

        <div className="parser-footer">
          <div className={`char-counter ${isNearLimit ? 'near-limit' : ''}`}>
            {charCount.toLocaleString()} / {MAX_NOTICE_CHARS.toLocaleString()} characters
            {isOverLimit && ' (Exceeds 5,000 character limit!)'}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {text && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setText('')}
                disabled={isLoading}
              >
                Clear
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={isEmpty || isOverLimit || isLoading}
              icon={isLoading ? null : ArrowRight}
            >
              {isLoading ? 'Extracting Details...' : 'Extract Event Details'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

