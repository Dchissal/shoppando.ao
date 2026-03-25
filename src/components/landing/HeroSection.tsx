import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { STORE_NAME } from '../../constants';

interface HeroSectionProps {
  isMobile: boolean;
}

export default function HeroSection({ isMobile }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
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
          {/* Background Card */}
          <div className="relative z-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.08)] bg-gradient-to-br from-orange-50 to-white aspect-square md:aspect-[4/3] flex items-center justify-center p-8 md:p-12 border border-orange-100/50">

            {/* Content */}
            <div className="relative flex flex-col items-center justify-center text-center w-full">

              {/* Main Icon */}


              {/* Static Title */}
              <motion.h2
                initial={isMobile ? undefined : { y: 20, opacity: 0 }}
                animate={isMobile ? undefined : { y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight mb-4 leading-tight"
              >
                Compras Online<br />
                <span className="text-orange-600">Simplificadas</span>
              </motion.h2>

              <motion.p
                initial={isMobile ? undefined : { opacity: 0 }}
                animate={isMobile ? undefined : { opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-orange-600/80 font-medium tracking-wider mt-2 text-sm md:text-base"
              >
                RÁPIDO • SEGURO • CONFIÁVEL
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={isMobile ? undefined : { y: 30, opacity: 0 }}
                animate={isMobile ? undefined : { y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="grid grid-cols-3 gap-6 mt-8 w-full"
              >
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-orange-600">50K+</div>
                  <div className="text-xs md:text-sm text-neutral-500 font-medium">Clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-orange-600">1K+</div>
                  <div className="text-xs md:text-sm text-neutral-500 font-medium">Produtos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-orange-600">24h</div>
                  <div className="text-xs md:text-sm text-neutral-500 font-medium">Entrega</div>
                </div>
              </motion.div>

            </div>

            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                 style={{ backgroundImage: 'radial-gradient(#ea580c 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-orange-50/30 to-orange-100/20 pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}