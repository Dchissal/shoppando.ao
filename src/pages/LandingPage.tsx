import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, orderBy, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { STORE_NAME } from '../constants';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import Features from '../components/landing/Features';
import ProductsSection from '../components/landing/ProductsSection';
import Footer from '../components/landing/Footer';
import WishlistModal from '../components/WishlistModal';

interface UserProfile {
  uid: string;
  name: string;
  role: 'admin' | 'user';
  photoURL?: string;
}

interface LandingPageProps {
  userProfile: UserProfile | null;
}

export default function LandingPage({ userProfile }: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const navigate = useNavigate();

  // Buscar apenas produtos featured (limitado a 6) - para todos os visitantes
  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      where('featured', '==', true),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsList);
      setLoadingProducts(false);
    }, (error) => {
      console.error('Error fetching featured products:', error);
      setLoadingProducts(false);
    });

    return () => unsubscribe();
  }, []); // Removido [userProfile] - agora carrega para todos

  useEffect(() => {
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

  const handleProductClick = (productId: string) => {
    if (!userProfile) {
      navigate('/login', { state: { redirectTo: `/product/${productId}` } });
    } else {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      <Navbar
        userProfile={userProfile}
        isScrolled={isScrolled}
        isMobile={isMobile}
      />

      <HeroSection isMobile={isMobile} />

      <Features isMobile={isMobile} />

      {/* Marquee Section */}
      <section id="novidades" className="py-6 md:py-8 bg-orange-600 overflow-hidden border-y border-orange-500/30">
        <div className="flex whitespace-nowrap">
          <motion.div
            animate={isMobile ? undefined : { x: ["-50%", "0%"] }}
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

      <ProductsSection
        products={products}
        loadingProducts={loadingProducts}
        userProfile={userProfile}
        isMobile={isMobile}
        handleProductClick={handleProductClick}
      />

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

            {/* Background elements */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-600/5 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      <Footer
        userProfile={userProfile}
        setIsWishlistOpen={setIsWishlistOpen}
      />

      {/* Wishlist Modal */}
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </div>
  );
}