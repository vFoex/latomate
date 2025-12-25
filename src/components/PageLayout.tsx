import { ReactNode } from 'react';
import './PageLayout.css';

interface PageLayoutProps {
  /** Page title (displayed in header) */
  title: string;
  /** Icon emoji or element to display before title */
  icon?: ReactNode;
  /** Main content of the page */
  children: ReactNode;
  /** Current language for translations */
  language: 'en' | 'fr';
}

/**
 * Reusable page layout template for Options and Stats pages
 * Provides consistent header and footer across all full-page views
 */
function PageLayout({ title, icon, children, language }: PageLayoutProps) {
  const madeByText = language === 'fr' ? 'Créé par' : 'Made by';
  
  return (
    <div className="page-layout-container">
      <header className="page-layout-header">
        <h1>
          {icon && <span className="page-layout-icon">{icon}</span>}
          {title}
        </h1>
      </header>

      <div className="page-layout-content">
        {children}
      </div>

      <footer className="page-layout-footer">
        <p>
          <img src="/icons/icon16.png" alt="LaTomate" className="footer-icon" />
          LaTomate v0.6.1 • {madeByText} <a href="https://github.com/vFoex" target="_blank" rel="noopener noreferrer">vFoex</a>
        </p>
      </footer>
    </div>
  );
}

export default PageLayout;
