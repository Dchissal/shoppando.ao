/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './firebase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import ContactPage from './pages/ContactPage';
import LandingPage from './pages/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

// User Role Type
type UserRole = 'admin' | 'user';

interface UserProfile {
  uid: string;
  name: string;
  role: UserRole;
  photoURL?: string;
}

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      if (firebaseUser) {
        // Listen to user profile changes in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error listening to user profile:', error);
          setUserProfile(null);
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 font-bold">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <NotificationProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route
                path="/"
                element={
                  userProfile
                    ? <StorePage userProfile={userProfile} />
                    : <LandingPage userProfile={userProfile} />
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/store" element={<StorePage userProfile={userProfile} />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/devolucao" element={<ReturnPolicyPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route
                path="/admin"
                element={
                  userProfile?.role === 'admin'
                    ? <AdminDashboard />
                    : <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Acesso Negado</h1>
                          <p className="text-neutral-600">Não tens permissão para aceder a esta página.</p>
                        </div>
                      </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </NotificationProvider>
    </CartProvider>
  );
}