import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ChevronRight, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';

interface ProductsSectionProps {
  products: Product[];
  loadingProducts: boolean;
  userProfile: any;
  isMobile: boolean;
  handleProductClick: (productId: string) => void;
}

export default function ProductsSection({
  products,
  loadingProducts,
  userProfile,
  isMobile,
  handleProductClick
}: ProductsSectionProps) {
  const navigate = useNavigate();

  return (
    <section id="promocoes" className="py-16 md:py-24 bg-neutral-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6">
          <div className="max-w-2xl">
           
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none text-neutral-900">
              Ofertas em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Destaque</span>
            </h2>
            <p className="text-neutral-500 text-lg md:text-xl font-medium">
              {products.length > 0
                ? `${products.length} artigos premium com os melhores preços.`
                : 'Os melhores artigos selecionados para ti.'}
            </p>
          </div>

          {userProfile && products.length > 0 && (
            <button
              onClick={() => navigate('/store')}
              className="group flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg"
            >
              Ver Todos
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
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
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Ainda não há artigos em destaque</h3>
              <p className="text-neutral-500">Estamos a preparar as melhores ofertas para ti. Volta em breve!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[280px]">
            {products.map((product, index) => {
              // Layout bento: primeiro item grande, outros variam
              const isHero = index === 0;
              const isTall = index === 3;
              const isWide = index === 4;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={isMobile ? undefined : { scale: 1.02 }}
                  onClick={() => handleProductClick(product.id)}
                  className={`
                    relative overflow-hidden rounded-[2rem] cursor-pointer group
                    ${isHero ? 'col-span-2 row-span-2' : ''}
                    ${isTall ? 'row-span-2' : ''}
                    ${isWide ? 'col-span-2' : ''}
                  `}
                >
                  {/* Background Image */}
                  <img
                    src={product.imageURL}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 ${isHero
                    ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'
                    : 'bg-gradient-to-t from-black/70 via-black/10 to-transparent'
                  }`} />

                  {/* Decorative glow */}
                  {isHero && (
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/30 rounded-full blur-[80px] group-hover:bg-orange-500/50 transition-all duration-500" />
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                    {/* Featured Badge */}
                    <div className={`
                      bg-gradient-to-r from-orange-500 to-red-500 text-white font-black uppercase tracking-widest
                      rounded-full shadow-lg flex items-center gap-1
                      ${isHero ? 'text-xs px-4 py-2' : 'text-[8px] px-2 py-1'}
                    `}>
                      <Star className={`fill-white ${isHero ? 'w-4 h-4' : 'w-3 h-3'}`} />
                      {isHero ? 'Destaque' : <span className="hidden sm:inline">Top</span>}
                    </div>

                    {/* Discount Badge */}
                    {product.oldPrice && (
                      <div className={`
                        bg-white text-red-600 font-black rounded-full shadow-lg
                        ${isHero ? 'text-sm px-4 py-2' : 'text-[10px] px-2 py-1'}
                      `}>
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10
                    ${isHero ? 'p-6 md:p-10' : ''}
                  `}>
                    {/* Category */}
                    <span className={`
                      text-orange-400 font-black uppercase tracking-widest
                      ${isHero ? 'text-xs mb-2' : 'text-[8px] mb-1'}
                      block
                    `}>
                      {product.category}
                    </span>

                    {/* Name */}
                    <h3 className={`
                      text-white font-black leading-tight group-hover:text-orange-300 transition-colors
                      ${isHero ? 'text-2xl md:text-4xl mb-3' : 'text-sm md:text-lg mb-2 line-clamp-2'}
                    `}>
                      {product.name}
                    </h3>

                    {/* Description - only on hero */}
                    {isHero && (
                      <p className="text-white/70 text-sm md:text-base mb-4 line-clamp-2 max-w-md">
                        {product.description || 'Artigo premium com garantia de qualidade e entrega rápida.'}
                      </p>
                    )}

                    {/* Price & CTA */}
                    <div className={`flex items-center gap-3 ${isHero ? 'flex-wrap' : ''}`}>
                      <div className="flex flex-col">
                        <span className={`
                          text-white font-black
                          ${isHero ? 'text-2xl md:text-3xl' : 'text-base md:text-xl'}
                        `}>
                          {product.price.toLocaleString()} <span className={isHero ? 'text-lg' : 'text-xs'}>Kz</span>
                        </span>
                        {product.oldPrice && (
                          <span className={`text-white/50 line-through ${isHero ? 'text-sm' : 'text-[10px]'}`}>
                            {product.oldPrice.toLocaleString()} Kz
                          </span>
                        )}
                      </div>

                      {isHero && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product.id);
                          }}
                          className="ml-auto px-6 py-3 bg-white text-neutral-900 text-sm font-black rounded-xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-xl"
                        >
                          {userProfile ? 'Ver Detalhes' : 'Fazer Login'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hover overlay for non-hero items */}
                  {!isHero && !userProfile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center gap-1 shadow-2xl">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                          <ChevronRight className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs font-black text-neutral-900">Login</p>
                      </div>
                    </div>
                  )}

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                </motion.div>
              );
            })}

            {/* Promo Card - aparece se tiver menos de 6 produtos */}
            {products.length < 6 && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className={`
                  relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6 flex flex-col justify-between
                  ${products.length <= 2 ? 'col-span-2' : ''}
                  ${products.length === 1 ? 'row-span-2' : ''}
                `}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-xl" />

                <div className="relative z-10">
                  <Star className="w-10 h-10 text-white/80 fill-white/80 mb-4" />
                  <h4 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">
                    Mais ofertas em breve!
                  </h4>
                  <p className="text-white/80 text-sm font-medium">
                    Estamos a preparar novos produtos em destaque para ti.
                  </p>
                </div>

                <button
                  onClick={() => navigate(userProfile ? '/store' : '/login')}
                  className="relative z-10 mt-4 px-6 py-3 bg-white text-orange-600 font-black text-sm rounded-xl hover:scale-105 transition-transform shadow-lg"
                >
                  {userProfile ? 'Ver Loja' : 'Criar Conta'}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}