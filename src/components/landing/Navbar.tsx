import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react';
import { auth } from '../../firebase';
import { STORE_NAME } from '../../constants';

interface UserProfile {
  uid: string;
  name: string;
  role: 'admin' | 'user';
  photoURL?: string;
}

interface NavbarProps {
  userProfile: UserProfile | null;
  isScrolled: boolean;
  isMobile: boolean;
}

export default function Navbar({ userProfile, isScrolled, isMobile }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white border-b border-neutral-200 shadow-sm py-0'
        : 'bg-transparent py-2'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-orange-600">
              {STORE_NAME.split('.')[0]}
              <span className={isScrolled ? 'text-neutral-900' : 'text-neutral-900'}>
                .{STORE_NAME.split('.')[1] || 'ao'}
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#inicio" className={`${isScrolled ? 'text-neutral-600' : 'text-neutral-800'} font-semibold hover:text-orange-600 transition-colors`}>Início</a>
            <a href="#novidades" className={`${isScrolled ? 'text-neutral-600' : 'text-neutral-800'} font-semibold hover:text-orange-600 transition-colors`}>Novidades</a>
            <a href="#promocoes" className={`${isScrolled ? 'text-neutral-600' : 'text-neutral-800'} font-semibold hover:text-orange-600 transition-colors`}>Promoções</a>
            <a href="#sobre-nos" className={`${isScrolled ? 'text-neutral-600' : 'text-neutral-800'} font-semibold hover:text-orange-600 transition-colors`}>Sobre Nós</a>
          </div>

          {/* Auth Button */}
          <div className="hidden md:block">
            {userProfile ? (
              <div className="flex items-center gap-4">
                {userProfile.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-all"
                  >
                    Painel Admin
                  </button>
                )}
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-neutral-900 leading-none">{userProfile.name}</span>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">{userProfile.role}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-neutral-100 overflow-hidden border-2 border-white shadow-sm">
                  {userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-bold">
                      {userProfile.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => auth.signOut()}
                  className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
              >
                Entrar
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 ${isScrolled ? 'text-neutral-600' : 'text-neutral-800'}`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={isMobile ? undefined : { opacity: 0, height: 0 }}
            animate={isMobile ? undefined : { opacity: 1, height: 'auto' }}
            exit={isMobile ? undefined : { opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-neutral-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <a href="#inicio" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg">Início</a>
              <a href="#novidades" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg">Novidades</a>
              <a href="#promocoes" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg">Promoções</a>
              <a href="#sobre-nos" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg">Sobre Nós</a>
              <div className="pt-4 px-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all"
                >
                  Entrar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}