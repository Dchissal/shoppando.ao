import React from 'react';
import { motion } from 'motion/react';
import { Zap, ShoppingBag, ShieldCheck } from 'lucide-react';
import { STORE_NAME } from '../../constants';

interface FeaturesProps {
  isMobile: boolean;
}

export default function Features({ isMobile }: FeaturesProps) {
  return (
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
  );
}