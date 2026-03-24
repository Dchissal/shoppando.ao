import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Minus, 
  Plus,
  ArrowLeft,
  Share2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [shippingZip, setShippingZip] = useState('');
  const [shippingEstimate, setShippingEstimate] = useState<{ cost: number; days: string } | null>(null);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const prodData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(prodData);
          if (prodData.colors?.length) setSelectedColor(prodData.colors[0]);
          if (prodData.sizes?.length) setSelectedSize(prodData.sizes[0]);
          
          // Fetch related products
          const q = query(
            collection(db, 'products'), 
            where('category', '==', prodData.category),
            limit(4)
          );
          const relatedSnap = await getDocs(q);
          const related = relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Product))
            .filter(p => p.id !== id);
          setRelatedProducts(related);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `products/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleCalculateShipping = () => {
    if (shippingZip.length >= 4) {
      // Mock shipping calculation
      setShippingEstimate({
        cost: 2500,
        days: '3-5 dias úteis'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 font-bold">Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Produto não encontrado</h2>
        <p className="text-neutral-500 mb-8">O produto que procura pode ter sido removido ou o link está incorreto.</p>
        <Link to="/store" className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-orange-100">
          Voltar à Loja
        </Link>
      </div>
    );
  }

  const images = product.images || [product.imageURL];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 pb-20">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-neutral-500" />
            </button>
            <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-white rounded-[3rem] overflow-hidden border border-neutral-100 relative group">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                src={images[activeImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === idx ? 'border-orange-600 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-xs font-black text-orange-600 uppercase tracking-[0.3em] mb-4">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter mb-4 leading-none">{product.name}</h1>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= (product.rating || 5) ? 'fill-current' : 'text-neutral-200'}`} />
                  ))}
                  <span className="text-sm font-bold text-neutral-400 ml-2">{product.rating || 4.9} ({product.reviews || 120} avaliações)</span>
                </div>
                <div className="h-4 w-[1px] bg-neutral-200" />
                <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  Em Stock
                </p>
              </div>
            </div>

            <div className="flex items-end gap-4 mb-10">
              <p className="text-5xl font-black text-neutral-900 leading-none">{product.price.toLocaleString()} Kz</p>
              {product.oldPrice && (
                <div className="flex flex-col">
                  <p className="text-xl text-neutral-400 line-through font-bold leading-none">{product.oldPrice.toLocaleString()} Kz</p>
                  <p className="text-xs font-black text-orange-600 mt-1">POUPE {Math.round((1 - product.price / product.oldPrice) * 100)}%</p>
                </div>
              )}
            </div>

            <div className="space-y-8 mb-12">
              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4">Cores Disponíveis</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map(color => (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color ? 'border-orange-600 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Tamanho</h3>
                    <button className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                      <Info className="w-3 h-3" /> Guia de Tamanhos
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                          selectedSize === size 
                            ? 'border-orange-600 bg-orange-50 text-orange-600' 
                            : 'border-neutral-100 text-neutral-500 hover:border-neutral-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4">Quantidade</h3>
                <div className="flex items-center bg-white border border-neutral-100 rounded-2xl w-fit p-1 shadow-sm">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-3 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    <Minus className="w-5 h-5 text-neutral-400" />
                  </button>
                  <span className="w-12 text-center font-black text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="p-3 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5 text-neutral-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={() => {
                  for(let i=0; i<quantity; i++) addToCart(product);
                  navigate('/checkout');
                }}
                className="flex-1 py-5 bg-neutral-900 text-white font-black rounded-[2rem] hover:bg-orange-600 transition-all shadow-xl shadow-neutral-200 flex items-center justify-center gap-3 active:scale-95"
              >
                <ShoppingCart className="w-6 h-6" />
                Comprar Agora
              </button>
              <button className="py-5 px-8 bg-white border border-neutral-100 text-neutral-400 hover:text-red-500 rounded-[2rem] transition-all shadow-sm hover:shadow-md active:scale-95">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Shipping Estimator */}
            <div className="p-8 bg-white rounded-[2rem] border border-neutral-100 space-y-6">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-neutral-900">Cálculo de Frete</h3>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Introduza o seu Código Postal"
                  className="flex-1 bg-neutral-50 border-none rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-600 transition-all"
                  value={shippingZip}
                  onChange={(e) => setShippingZip(e.target.value)}
                />
                <button 
                  onClick={handleCalculateShipping}
                  className="px-6 py-3 bg-neutral-100 text-neutral-900 font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Calcular
                </button>
              </div>
              {shippingEstimate && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-orange-50 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Entrega Estimada</p>
                    <p className="text-sm font-black text-neutral-900">{shippingEstimate.days}</p>
                  </div>
                  <p className="text-lg font-black text-orange-600">{shippingEstimate.cost.toLocaleString()} Kz</p>
                </motion.div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-500">Garantia de 2 Anos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-500">Devolução Grátis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-20 border-t border-neutral-100 pt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-12">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-6">Descrição do Produto</h2>
                <div className="prose prose-neutral max-w-none text-neutral-500 font-medium leading-relaxed">
                  <p>{product.description || "Este produto representa o auge do design e da funcionalidade. Fabricado com materiais de alta qualidade, foi concebido para durar e proporcionar uma experiência de utilização superior. Seja para uso diário ou para ocasiões especiais, este artigo adapta-se perfeitamente às suas necessidades, combinando elegância com praticidade."}</p>
                </div>
              </div>

              {product.specifications && (
                <div>
                  <h2 className="text-2xl font-black text-neutral-900 mb-6">Especificações Técnicas</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100">
                        <span className="text-sm font-bold text-neutral-400">{key}</span>
                        <span className="text-sm font-black text-neutral-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="p-8 bg-neutral-900 rounded-[2rem] text-white">
                <h3 className="text-xl font-black mb-4 tracking-tight">Precisa de Ajuda?</h3>
                <p className="text-sm text-white/60 font-medium mb-6">A nossa equipa de suporte está disponível 24/7 para o ajudar com qualquer dúvida.</p>
                <button className="w-full py-4 bg-white text-neutral-900 font-black rounded-2xl hover:bg-orange-600 hover:text-white transition-all">
                  Contactar Suporte
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-black text-neutral-900 tracking-tighter">Também Poderá Gostar</h2>
                <p className="text-neutral-500 font-medium mt-2">Produtos selecionados com base no seu interesse.</p>
              </div>
              <Link to="/store" className="text-orange-600 font-black flex items-center gap-2 hover:underline">
                Ver Tudo <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <Link 
                  key={rel.id} 
                  to={`/product/${rel.id}`}
                  className="group bg-white rounded-3xl p-4 border border-neutral-100 hover:border-orange-200 hover:shadow-xl transition-all"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-50 mb-4">
                    <img src={rel.imageURL} alt={rel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{rel.category}</p>
                  <h4 className="font-bold text-neutral-900 line-clamp-1 mb-2">{rel.name}</h4>
                  <p className="font-black text-neutral-900">{rel.price.toLocaleString()} Kz</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetailPage;
