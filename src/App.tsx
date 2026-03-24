/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  Zap, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronRight, 
  Star,
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
  LogOut,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, orderBy, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './firebase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { CartProvider } from './context/CartContext';
import { STORE_NAME } from './constants';

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

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: '1.250.000 Kz',
    oldPrice: '1.400.000 Kz',
    image: '/Assets/imagens/iphone_15_Pro_Max.jpeg',
    tag: 'Destaque',
    gridClass: 'lg:col-span-2 lg:row-span-2',
  },
  {
    id: 2,
    name: 'Smart TV Samsung 4K 65"',
    price: '450.000 Kz',
    oldPrice: '520.000 Kz',
    image: '/Assets/imagens/Smart TV Samsung 4K 65.webp',
    tag: 'Mais Vendido',
    gridClass: 'lg:col-span-2 lg:row-span-1',
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    price: '145.000 Kz',
    oldPrice: '180.000 Kz',
    image: '/Assets/imagens/AirPods Pro .jpeg',
    tag: 'Oferta',
    gridClass: 'lg:col-span-1 lg:row-span-1',
  },
  {
    id: 4,
    name: 'Nike Air Max Pulse',
    price: '85.000 Kz',
    oldPrice: '110.000 Kz',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    tag: 'Novo',
    gridClass: 'lg:col-span-1 lg:row-span-1',
  },
];

function LandingPage({ userProfile }: { userProfile: UserProfile | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  const words = ['COMPRAR', 'VENDER', 'ENTREGAR', 'POUPAR', 'CONFIAR'];

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
      setLoadingProducts(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    handleScroll();
    checkMobile();
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Navigation */}
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
              <span className="text-2xl font-bold tracking-tight text-orange-600">{STORE_NAME.split('.')[0]}<span className={isScrolled ? 'text-neutral-900' : 'text-neutral-900'}>.{STORE_NAME.split('.')[1] || 'ao'}</span></span>
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

      {/* Hero Section */}
      <section id="inicio" className="relative bg-white overflow-hidden min-h-[600px] flex items-center pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/Assets/imagens/hero.jpeg" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-24 relative z-10">
          <motion.div 
            initial={isMobile ? undefined : { opacity: 0, x: -50 }}
            animate={isMobile ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 leading-tight mb-6">
              Tudo o que precisas, <br />
              <span className="text-orange-600">Barato e Rápido.</span>
            </h1>
            <p className="text-lg text-neutral-600 mb-8 max-w-xl">
              Milhares de produtos com os melhores preços do mercado e entrega em tempo recorde em todo o país. {STORE_NAME} é o teu novo jeito de comprar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
              >
                Comprar Agora <ChevronRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-neutral-900 border-2 border-neutral-200 font-bold rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-2">
                Ver Promoções
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={isMobile ? undefined : { opacity: 0, scale: 0.8 }}
            animate={isMobile ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full"
          >
            <div className="relative z-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.05)] bg-white/40 backdrop-blur-md aspect-square md:aspect-[4/3] flex items-center justify-center p-4 md:p-8 border border-white/20">
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,88,12,0.05),transparent_70%)]" />
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(#ea580c 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              <div className="relative flex flex-col items-center justify-center text-center">
                <motion.div
                  animate={isMobile ? undefined : { y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-4 md:mb-6"
                >
                  <ShoppingBag className="w-16 h-16 md:w-24 md:h-24 text-orange-600 opacity-20" />
                </motion.div>

                <div className="h-16 md:h-24 w-full flex items-center justify-center relative">
                  <AnimatePresence mode="popLayout">
                    <motion.h2
                      key={wordIndex}
                      initial={isMobile ? undefined : { y: 20, opacity: 0 }}
                      animate={isMobile ? undefined : { y: 0, opacity: 1 }}
                      exit={isMobile ? undefined : { y: -20, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="text-4xl md:text-7xl font-black text-neutral-900 tracking-tighter"
                    >
                      {words[wordIndex]}
                    </motion.h2>
                  </AnimatePresence>
                </div>
                
                <motion.p 
                  initial={isMobile ? undefined : { opacity: 0 }}
                  animate={isMobile ? undefined : { opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-orange-600 font-bold tracking-[0.3em] mt-2 md:mt-4 text-[10px] md:text-sm"
                >
                  O FUTURO DO E-COMMERCE
                </motion.p>

                {/* Animated Rings */}
                {!isMobile && (
                  <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <motion.div 
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                      className="w-64 h-64 border-2 border-orange-100 rounded-full"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                      className="w-64 h-64 border-2 border-orange-50 rounded-full"
                    />
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="sobre-nos" className="py-24 bg-white relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-3">Vantagens {STORE_NAME}</h2>
            <p className="text-4xl font-bold text-neutral-900">Porquê escolher-nos?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            <motion.div 
              whileHover={isMobile ? undefined : { y: -10 }}
              className="group p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-neutral-50 border border-neutral-100 transition-all hover:bg-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] hover:border-orange-100"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-orange-600/20 group-hover:rotate-6 transition-transform">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3 md:mb-4">Entrega Flash</h3>
              <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                Recebe as tuas compras em Luanda no mesmo dia ou em 24h. Logística inteligente para a tua total conveniência.
              </p>
            </motion.div>

            <motion.div 
              whileHover={isMobile ? undefined : { y: -10 }}
              className="group p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-neutral-50 border border-neutral-100 transition-all hover:bg-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] hover:border-orange-100"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-neutral-900/20 group-hover:rotate-6 transition-transform">
                <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3 md:mb-4">Preços Imbatíveis</h3>
              <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                Negociamos directamente com fornecedores locais e internacionais para garantir que pagas sempre o preço mais justo.
              </p>
            </motion.div>

            <motion.div 
              whileHover={isMobile ? undefined : { y: -10 }}
              className="group p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-neutral-50 border border-neutral-100 transition-all hover:bg-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] hover:border-orange-100"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:rotate-6 transition-transform">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3 md:mb-4">Compra Segura</h3>
              <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                Pagamento na entrega ou via Multicaixa Express. A tua segurança é a nossa prioridade em cada transação.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section id="novidades" className="py-6 md:py-8 bg-orange-600 overflow-hidden border-y border-orange-500/30">
        <div className="flex whitespace-nowrap">
          <motion.div 
            animate={isMobile ? undefined : { x: [ "-50%", "0%" ] }}
            transition={{ 
              duration: 40, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex items-center gap-4 md:gap-8 pr-4 md:pr-8"
          >
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 md:gap-8">
                <span className="text-white text-base md:text-2xl font-black uppercase tracking-widest">
                  crie a sua conta
                </span>
                <span className="text-white/40 text-lg md:text-2xl">→</span>
                <span className="text-white text-base md:text-2xl font-black uppercase tracking-widest">
                  fique dentro das novidades
                </span>
                <span className="text-white/40 text-lg md:text-2xl">→</span>
                <span className="text-white text-base md:text-2xl font-black uppercase tracking-widest">
                  Nos segue nas redes sociais
                </span>
                <span className="text-white/40 text-lg md:text-2xl">→</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="promocoes" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-none">Ofertas em <span className="text-orange-600">Destaque</span></h2>
              <p className="text-neutral-500 text-lg md:text-xl font-medium">Os melhores artigos selecionados para ti, com a garantia de qualidade {STORE_NAME}.</p>
            </div>
            <div className="flex gap-2">
              <button className="p-4 bg-white border border-neutral-200 rounded-2xl hover:border-orange-600 transition-all shadow-sm">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <button className="p-4 bg-white border border-neutral-200 rounded-2xl hover:border-orange-600 transition-all shadow-sm">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {loadingProducts ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-neutral-400 font-bold">A carregar artigos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-6 text-center bg-white rounded-[3rem] border border-dashed border-neutral-200">
              <div className="w-20 h-20 bg-neutral-50 rounded-3xl flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-neutral-200" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Ainda não há artigos disponíveis</h3>
                <p className="text-neutral-500">Estamos a preparar as melhores ofertas para ti. Volta em breve!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <motion.div 
                  key={product.id}
                  whileHover={isMobile ? undefined : { y: -10 }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-neutral-100 group flex flex-col h-full cursor-pointer"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img 
                      src={product.imageURL} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest z-10 shadow-sm">
                      {product.category}
                    </span>

                    <button className="absolute bottom-6 right-6 bg-orange-600 text-white p-4 rounded-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl shadow-orange-600/20 active:scale-90 z-20">
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-neutral-500 text-sm mb-6 line-clamp-2 font-medium">
                      {product.description || 'Artigo de alta qualidade disponível para entrega imediata em todo o país.'}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-neutral-900">{product.price.toLocaleString()} Kz</span>
                        {product.oldPrice && (
                          <span className="text-neutral-400 text-sm line-through font-bold">{product.oldPrice.toLocaleString()} Kz</span>
                        )}
                      </div>
                      <button className="px-6 py-3 bg-neutral-900 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all active:scale-95">
                        Comprar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-900 rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Pronto para a melhor experiência de compra?
              </h2>
              <p className="text-neutral-400 text-lg mb-8">
                Junta-te a mais de 50.000 Angolanos que já compram no {STORE_NAME}. Qualidade, preço e rapidez num só lugar.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all">
                  Criar Conta Grátis
                </Link>
                <button className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm">
                  Baixar App
                </button>
              </div>
            </div>
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-20" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-8 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-orange-600 p-1.5 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-orange-600">{STORE_NAME.split('.')[0]}<span className="text-neutral-900">.{STORE_NAME.split('.')[1] || 'ao'}</span></span>
              </div>
              <p className="text-neutral-500 mb-6">
                A tua loja online de confiança em Angola. Entregamos em todas as províncias com rapidez e segurança.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-600 hover:text-white transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-600 hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-600 hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Links Úteis</h4>
              <ul className="space-y-4 text-neutral-500">
                <li><a href="#" className="hover:text-orange-600 transition-colors">Minha Conta</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Meus Pedidos</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Lista de Desejos</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Termos e Condições</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Apoio ao Cliente</h4>
              <ul className="space-y-4 text-neutral-500">
                <li><a href="#" className="hover:text-orange-600 transition-colors">Centro de Ajuda</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Política de Devolução</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Rastrear Encomenda</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Contactos</h4>
              <ul className="space-y-4 text-neutral-500">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <span>+244 923 000 000</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <span>suporte@shoppando.ao</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span>Luanda, Angola</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <p>© 2024 {STORE_NAME}. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <span>Pagamentos Aceites:</span>
              <div className="flex gap-2">
                <div className="bg-neutral-100 px-2 py-1 rounded font-bold text-[10px]">MULTICAIXA</div>
                <div className="bg-neutral-100 px-2 py-1 rounded font-bold text-[10px]">VISA</div>
                <div className="bg-neutral-100 px-2 py-1 rounded font-bold text-[10px]">CASH</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
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
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
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
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 font-bold animate-pulse">A carregar o {STORE_NAME}...</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <ErrorBoundary>
        <BrowserRouter>
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
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route 
              path="/admin" 
              element={
                userProfile?.role === 'admin' 
                  ? <AdminDashboard /> 
                  : <div className="h-screen flex items-center justify-center bg-white text-neutral-900 font-bold">Acesso negado. Apenas administradores.</div>
              } 
            />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </CartProvider>
  );
}
