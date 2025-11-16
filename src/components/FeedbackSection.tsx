import { useState } from 'react';
import { Language, getTranslation } from '../utils/i18n';

interface FeedbackSectionProps {
  language: Language;
}

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/latomate/cjfogkmednfbmgdgnpikdajnkmbpdegl/reviews';
const FEEDBACK_FORM_URL = 'https://forms.gle/zdiiA6m4pvs5zuxG9';
const GITHUB_ISSUES_URL = 'https://github.com/vFoex/latomate/issues';

export default function FeedbackSection({ language }: FeedbackSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const handleRateClick = () => {
    chrome.tabs.create({ url: CHROME_STORE_URL });
  };

  const handleFeedbackClick = () => {
    chrome.tabs.create({ url: FEEDBACK_FORM_URL });
  };

  const handleGitHubClick = () => {
    chrome.tabs.create({ url: GITHUB_ISSUES_URL });
  };

  return (
    <div className="feedback-section">
      <div className="feedback-header" onClick={() => setExpanded(!expanded)}>
        <div className="feedback-title">
          <span className="material-symbols-outlined icon-md">forum</span>
          <h3>{getTranslation('feedback.title', language)}</h3>
        </div>
        <span className="material-symbols-outlined icon-sm">
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {expanded && (
        <div className="feedback-content">
          <p className="feedback-description">
            {getTranslation('feedback.description', language)}
          </p>

          <div className="feedback-actions">
            <button className="feedback-button primary" onClick={handleRateClick}>
              <span className="material-symbols-outlined icon-sm">star</span>
              {getTranslation('feedback.rate', language)}
            </button>

            <button className="feedback-button" onClick={handleFeedbackClick}>
              <span className="material-symbols-outlined icon-sm">lightbulb</span>
              {getTranslation('feedback.suggest', language)}
            </button>

            <button className="feedback-button" onClick={handleGitHubClick}>
              <span className="material-symbols-outlined icon-sm">bug_report</span>
              {getTranslation('feedback.bug', language)}
            </button>
          </div>

          <div className="feedback-stats">
            <p className="feedback-note">
              {getTranslation('feedback.note', language)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
