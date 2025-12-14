// Firebase configuration and initialization for LaTomate
// Using chrome.identity for auth + Firestore for data (no Firebase Auth)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

/**
 * Get user info from Google using the access token
 */
async function getUserInfo(accessToken: string): Promise<UserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  const data = await response.json();
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

/**
 * Sign in with Google using Chrome Identity API
 * Returns user info and stores it locally
 */
export async function signInWithGoogle(): Promise<UserInfo> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!token) {
        reject(new Error('Failed to get auth token'));
        return;
      }

      try {
        // Get user info from Google
        const userInfo = await getUserInfo(token);
        
        // Store user info and token locally
        await chrome.storage.local.set({
          userInfo,
          accessToken: token,
          signedIn: true,
        });

        resolve(userInfo);
      } catch (error) {
        // If getting user info fails, revoke the token
        chrome.identity.removeCachedAuthToken({ token }, () => {
          reject(error);
        });
      }
    });
  });
}

/**
 * Sign out and clear all auth data
 */
export async function signOut(): Promise<void> {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        // Revoke the token
        chrome.identity.removeCachedAuthToken({ token }, () => {
          // Also revoke on Google's servers
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
        });
      }

      // Clear local storage
      chrome.storage.local.remove(['userInfo', 'accessToken', 'signedIn'], () => {
        resolve();
      });
    });
  });
}

/**
 * Get the current signed-in user from local storage
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userInfo', 'signedIn'], (result) => {
      if (result.signedIn && result.userInfo) {
        resolve(result.userInfo);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Get the current access token
 */
export async function getAccessToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accessToken'], (result) => {
      resolve(result.accessToken || null);
    });
  });
}

/**
 * Check if user is signed in
 */
export async function isSignedIn(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['signedIn'], (result) => {
      resolve(result.signedIn || false);
    });
  });
}
