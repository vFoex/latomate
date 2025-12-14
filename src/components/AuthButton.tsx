import { useState, useEffect } from 'react';
import { signInWithGoogle, signOut, getCurrentUser, UserInfo } from '../utils/firebase';
import { Language, getTranslation } from '../utils/i18n';

interface AuthButtonProps {
  language: Language;
}

export default function AuthButton({ language }: AuthButtonProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load current user on mount
    loadUser();

    // Listen to storage changes (for cross-tab sync)
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.userInfo || changes.signedIn) {
        loadUser();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  async function loadUser() {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = await signInWithGoogle();
      setUser(userInfo);
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-button-container loading">
        <div className="auth-loading">
          <span className="material-symbols-outlined icon-md spinning">progress_activity</span>
          <span>{getTranslation('auth.loading', language)}</span>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-button-container signed-in">
        <div className="user-profile">
          {user.picture && (
            <img src={user.picture} alt={user.name} className="user-avatar" />
          )}
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
        <button className="btn-sign-out" onClick={handleSignOut}>
          <span className="material-symbols-outlined icon-sm">logout</span>
          {getTranslation('auth.signOut', language)}
        </button>
        {error && <div className="auth-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="auth-button-container signed-out">
      <div className="auth-prompt">
        <span className="material-symbols-outlined icon-md">cloud_sync</span>
        <p>{getTranslation('auth.prompt', language)}</p>
      </div>
      <button className="btn-sign-in" onClick={handleSignIn}>
        <span className="material-symbols-outlined icon-sm">login</span>
        {getTranslation('auth.signIn', language)}
      </button>
      {error && <div className="auth-error">{error}</div>}
    </div>
  );
}
