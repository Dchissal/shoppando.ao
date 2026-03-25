import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  ShoppingCart,
  User,
  LogOut,
  ChevronRight,
  Star,
  Heart,
  LayoutGrid,
  List,
  Menu,
  X,
  Settings,
  Plus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { STORE_NAME } from '../constants';
import NotificationDropdown from '../components/NotificationDropdown';
import FilterPanel, { FilterState } from '../components/FilterPanel';

interface UserProfile {
  uid: string;
  name: string;
  role: 'admin' | 'user';
  photoURL?: string;
}

export default function StorePage({ userProfile }: { userProfile: UserProfile | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORE_NAME.toLowerCase().replace('.', '_')}_search_history`);
    return saved ? JSON.parse(saved) : [];
  });

  // Advanced Filters State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    categories: ['Todos'],
    priceRange: [0, 2000000],
    sortBy: 'relevance',
    stockStatus: [],
    status: [],
    featured: null,
    dateFilter: 'all',
    minStock: 0,
    maxStock: 1000
  });

  const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);

  const PRODUCTS_PER_PAGE = 10;

  const categories = ['Todos', 'Eletrónicos', 'Moda', 'Casa', 'Beleza', 'Desporto'];

  useEffect(() => {
    if (searchQuery.length > 1) {
      const suggestions = products
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(p => p.name)
        .slice(0, 5);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, products]);

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem(`${STORE_NAME.toLowerCase().replace('.', '_')}_search_history`, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Carregar produtos iniciais
  const loadInitialProducts = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        limit(PRODUCTS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      setProducts(prods);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PRODUCTS_PER_PAGE);
      setLoading(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    }
  }, []);

  // Carregar mais produtos
  const loadMoreProducts = useCallback(async () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PRODUCTS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const newProds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      if (newProds.length > 0) {
        setProducts(prev => [...prev, ...newProds]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PRODUCTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoadingMore(false);
    }
  }, [lastDoc, loadingMore, hasMore]);

  // Carregar produtos iniciais ao montar o componente
  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  // Intersection Observer para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loadMoreProducts]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const filteredProducts = products.filter(product => {
    // Basic search and category filters
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = advancedFilters.categories.includes('Todos') || advancedFilters.categories.includes(product.category);
    const matchesPrice = product.price >= advancedFilters.priceRange[0] && product.price <= advancedFilters.priceRange[1];

    // Advanced filters
    // Stock Status Filter
    let matchesStock = true;
    if (advancedFilters.stockStatus.length > 0) {
      const stockConditions = advancedFilters.stockStatus.map(status => {
        switch (status) {
          case 'available':
            return product.stock > 10;
          case 'low_stock':
            return product.stock > 0 && product.stock <= 10;
          case 'out_of_stock':
            return product.stock === 0;
          default:
            return false;
        }
      });
      matchesStock = stockConditions.some(condition => condition);
    }

    // Product Status Filter
    let matchesStatus = true;
    if (advancedFilters.status.length > 0) {
      matchesStatus = advancedFilters.status.includes(product.status);
    }

    // Featured Filter
    let matchesFeatured = true;
    if (advancedFilters.featured !== null) {
      matchesFeatured = Boolean(product.featured) === advancedFilters.featured;
    }

    // Date Filter
    let matchesDate = true;
    if (advancedFilters.dateFilter !== 'all' && product.createdAt) {
      const now = new Date();
      const productDate = new Date(product.createdAt.seconds * 1000);

      switch (advancedFilters.dateFilter) {
        case 'today':
          matchesDate = productDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = productDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          matchesDate = productDate >= monthAgo;
          break;
      }
    }

    // Stock Quantity Filter
    const matchesStockQuantity = product.stock >= advancedFilters.minStock && product.stock <= advancedFilters.maxStock;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesStatus && matchesFeatured && matchesDate && matchesStockQuantity;
  }).sort((a, b) => {
    if (advancedFilters.sortBy === 'price-low') return a.price - b.price;
    if (advancedFilters.sortBy === 'price-high') return b.price - a.price;
    if (advancedFilters.sortBy === 'newest') return b.createdAt?.seconds - a.createdAt?.seconds;
    if (advancedFilters.sortBy === 'stock-high') return b.stock - a.stock;
    if (advancedFilters.sortBy === 'stock-low') return a.stock - b.stock;
    return 0;
  });

  const calculateDiscount = (oldPrice?: number, newPrice?: number) => {
    if (!oldPrice || !newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  // Sync basic filters with advanced filters
  const handleFiltersChange = (newFilters: FilterState) => {
    setAdvancedFilters(newFilters);
    // Update basic state for backward compatibility
    setSelectedCategory(newFilters.categories.includes('Todos') ? 'Todos' : newFilters.categories[0]);
    setPriceRange(newFilters.priceRange);
    setSelectedSort(newFilters.sortBy);
  };

  // Update advanced filters when basic filters change
  useEffect(() => {
    setAdvancedFilters(prev => ({
      ...prev,
      categories: selectedCategory === 'Todos' ? ['Todos'] : [selectedCategory],
      priceRange,
      sortBy: selectedSort
    }));
  }, [selectedCategory, priceRange, selectedSort]);

  const promoProducts = filteredProducts.filter(p => p.oldPrice);
  const regularProducts = filteredProducts.filter(p => !p.oldPrice);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-orange-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-neutral-900">{STORE_NAME.split('.')[0].toUpperCase()}</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Pesquisar produtos, marcas e categorias..."
              className="w-full bg-neutral-100 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveSearchToHistory(searchQuery)}
            />
            
            {/* Search Suggestions & History */}
            <AnimatePresence>
              {(searchSuggestions.length > 0 || (searchQuery === '' && searchHistory.length > 0)) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden z-50"
                >
                  {searchQuery === '' && searchHistory.length > 0 && (
                    <div className="p-4 border-b border-neutral-50">
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Pesquisas Recentes</p>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map(q => (
                          <button 
                            key={q} 
                            onClick={() => setSearchQuery(q)}
                            className="px-3 py-1 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-xs font-bold text-neutral-600 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="py-2">
                    {searchSuggestions.map(s => (
                      <button 
                        key={s}
                        onClick={() => {
                          setSearchQuery(s);
                          saveSearchToHistory(s);
                        }}
                        className="w-full text-left px-6 py-3 hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                      >
                        <Search className="w-4 h-4 text-neutral-300" />
                        <span className="text-sm font-medium text-neutral-700">{s}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/account')}
                className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
                title="Minha Conta"
              >
                <User className="w-6 h-6 text-neutral-600" />
              </button>

              <NotificationDropdown />

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-neutral-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="h-8 w-[1px] bg-neutral-200 hidden md:block mx-2" />

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-neutral-900 leading-none">{userProfile?.name}</p>
                <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mt-1">{userProfile?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden border-2 border-white shadow-sm">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-bold">
                    {userProfile?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-full transition-all"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-4 md:hidden relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Pesquisar..."
            className="w-full bg-neutral-100 border-none rounded-xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Promo Banner */}
        {promoProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-6 md:p-8 text-white group cursor-pointer"
            onClick={() => {
              const promoSection = document.querySelector('#promo-section');
              promoSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {/* Animated backgrounds */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300/20 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                  <Star className="w-10 h-10 fill-white animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Tempo Limitado
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-1">Ofertas Imperdíveis!</h3>
                  <p className="text-sm md:text-base text-white/80 font-medium">
                    {promoProducts.length} produtos em promoção com até 70% de desconto
                  </p>
                </div>
              </div>

              <button className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-105 transition-transform shadow-2xl flex items-center gap-2 group-hover:gap-3 duration-300">
                Ver Promoções
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Categories Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setAdvancedFilters(prev => ({
                  ...prev,
                  categories: cat === 'Todos' ? ['Todos'] : [cat]
                }));
              }}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                advancedFilters.categories.includes(cat) || (cat === 'Todos' && advancedFilters.categories.includes('Todos'))
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                  : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Store Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">
              {advancedFilters.categories.includes('Todos') ? 'Explorar Tudo' : advancedFilters.categories[0]}
            </h1>
            <p className="text-neutral-500 mt-1 font-medium">
              {filteredProducts.length} artigos encontrados para si
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-white border border-neutral-200 rounded-xl px-4 py-2 text-sm font-bold text-neutral-600 outline-none focus:ring-2 focus:ring-orange-600 transition-all"
            >
              <option value="relevance">Mais Relevantes</option>
              <option value="price-low">Menor Preço</option>
              <option value="price-high">Maior Preço</option>
              <option value="newest">Mais Recentes</option>
              <option value="stock-high">Maior Stock</option>
              <option value="stock-low">Menor Stock</option>
            </select>

            <FilterPanel
              filters={advancedFilters}
              onFiltersChange={handleFiltersChange}
              isOpen={isFilterPanelOpen}
              onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              categories={categories}
              totalProducts={filteredProducts.length}
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4">Categorias</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setAdvancedFilters(prev => ({
                        ...prev,
                        categories: cat === 'Todos' ? ['Todos'] : [cat]
                      }));
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      advancedFilters.categories.includes(cat) || (cat === 'Todos' && advancedFilters.categories.includes('Todos'))
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-100'
                        : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4">Preço (Kz)</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="2000000"
                  step="10000"
                  value={advancedFilters.priceRange[1]}
                  onChange={(e) => {
                    const newRange: [number, number] = [advancedFilters.priceRange[0], parseInt(e.target.value)];
                    setPriceRange(newRange);
                    setAdvancedFilters(prev => ({
                      ...prev,
                      priceRange: newRange
                    }));
                  }}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
                  <span>0 Kz</span>
                  <span>{advancedFilters.priceRange[1].toLocaleString()} Kz</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-[2rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full -ml-12 -mb-12 blur-xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 fill-white animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Oferta Especial</span>
                </div>
                <h4 className="text-xl font-black leading-tight mb-2">Novas Coleções de Verão</h4>
                <p className="text-xs font-medium text-white/80 mb-4">Até 40% de desconto em artigos selecionados.</p>
                <button className="bg-white text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                  Ver Agora
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-4 border border-neutral-100 animate-pulse">
                    <div className="aspect-square bg-neutral-100 rounded-2xl mb-4" />
                    <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-neutral-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                {/* Promoções em Destaque */}
                {promoProducts.length > 0 && (
                  <div className="mb-10" id="promo-section">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 rounded-xl">
                        <Star className="w-6 h-6 text-white fill-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Ofertas Especiais</h2>
                        <p className="text-sm text-neutral-500 font-medium">Promoções por tempo limitado</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {promoProducts.map((product) => {
                        const discount = calculateDiscount(product.oldPrice, product.price);
                        return (
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={product.id}
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-3 md:p-4 border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/20 transition-all cursor-pointer relative overflow-hidden"
                          >
                            {/* Sparkle effect */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-yellow-200/50 to-orange-300/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                            {/* Discount Badge */}
                            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" />
                              <span className="text-xs font-black">-{discount}%</span>
                            </div>

                            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button className="p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-400 hover:text-red-500 transition-colors shadow-sm">
                                <Heart className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickViewProduct(product);
                                }}
                                className="p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-400 hover:text-orange-600 transition-colors shadow-sm"
                              >
                                <Search className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="aspect-square rounded-2xl overflow-hidden bg-white mb-4 relative shadow-md">
                              <img
                                src={product.imageURL}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="space-y-1 relative z-10">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{product.category}</p>
                                {product.featured && (
                                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 rounded-lg">
                                    <Star className="w-3 h-3 text-white fill-white" />
                                  </div>
                                )}
                              </div>
                              <h3 className="font-bold text-neutral-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                {product.name}
                              </h3>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-[10px] font-bold text-neutral-400">{product.rating || 4.9} ({product.reviews || 120})</span>
                                </div>

                                {/* Stock Status Badge */}
                                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                  product.stock === 0
                                    ? 'bg-red-100 text-red-600'
                                    : product.stock <= 10
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-green-100 text-green-600'
                                }`}>
                                  {product.stock === 0 ? 'Esgotado' : product.stock <= 10 ? `${product.stock} restantes` : 'Disponível'}
                                </div>
                              </div>

                              <div className="pt-2 flex items-center justify-between">
                                <div>
                                  <p className="text-lg font-black text-orange-600 leading-none">
                                    {product.price.toLocaleString()} Kz
                                  </p>
                                  <p className="text-xs text-neutral-400 line-through mt-1 font-medium">
                                    {product.oldPrice?.toLocaleString()} Kz
                                  </p>
                                  <p className="text-[10px] text-green-600 font-black mt-1">
                                    Poupa {(product.oldPrice! - product.price).toLocaleString()} Kz
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (product.stock > 0) {
                                      addToCart(product);
                                    }
                                  }}
                                  disabled={product.stock === 0}
                                  className={`p-2.5 rounded-xl transition-all shadow-lg active:scale-95 ${
                                    product.stock === 0
                                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:scale-110 shadow-orange-300'
                                  }`}
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Produtos Regulares */}
                {regularProducts.length > 0 && (
                  <>
                    {promoProducts.length > 0 && (
                      <div className="flex items-center gap-3 mb-6 mt-8">
                        <div className="bg-neutral-900 p-2 rounded-xl">
                          <LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Todos os Produtos</h2>
                          <p className="text-sm text-neutral-500 font-medium">{regularProducts.length} produtos disponíveis</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {regularProducts.map((product) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="group bg-white rounded-3xl p-3 md:p-4 border border-neutral-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-pointer relative"
                        >
                          <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button className="p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-400 hover:text-red-500 transition-colors shadow-sm">
                              <Heart className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickViewProduct(product);
                              }}
                              className="p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-400 hover:text-orange-600 transition-colors shadow-sm"
                            >
                              <Search className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-50 mb-4 relative">
                            <img
                              src={product.imageURL}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{product.category}</p>
                              {product.featured && (
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 rounded-lg">
                                  <Star className="w-3 h-3 text-white fill-white" />
                                </div>
                              )}
                            </div>
                            <h3 className="font-bold text-neutral-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                              {product.name}
                            </h3>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-[10px] font-bold text-neutral-400">{product.rating || 4.9} ({product.reviews || 120})</span>
                              </div>

                              {/* Stock Status Badge */}
                              <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                product.stock === 0
                                  ? 'bg-red-100 text-red-600'
                                  : product.stock <= 10
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-green-100 text-green-600'
                              }`}>
                                {product.stock === 0 ? 'Esgotado' : product.stock <= 10 ? `${product.stock} restantes` : 'Disponível'}
                              </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <div>
                                <p className="text-lg font-black text-neutral-900 leading-none">
                                  {product.price.toLocaleString()} Kz
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (product.stock > 0) {
                                    addToCart(product);
                                  }
                                }}
                                disabled={product.stock === 0}
                                className={`p-2.5 rounded-xl transition-all shadow-lg active:scale-95 ${
                                  product.stock === 0
                                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                    : 'bg-neutral-900 text-white hover:bg-orange-600 shadow-neutral-200'
                                }`}
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {/* Intersection Observer Target & Loading More Indicator */}
                <div ref={observerTarget} className="w-full py-8 flex justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-sm font-bold">A carregar mais produtos...</span>
                    </div>
                  )}
                  {!hasMore && products.length > 0 && (
                    <p className="text-sm text-neutral-400 font-medium">Todos os produtos foram carregados</p>
                  )}
                </div>
              </>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="bg-neutral-100 p-6 rounded-full mb-4">
                  <Search className="w-10 h-10 text-neutral-300" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Nenhum produto encontrado</h3>
                <p className="text-neutral-500 mt-2">Tente ajustar os seus filtros ou a sua pesquisa.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todos');
                    const resetFilters: FilterState = {
                      categories: ['Todos'],
                      priceRange: [0, 2000000],
                      sortBy: 'relevance',
                      stockStatus: [],
                      status: [],
                      featured: null,
                      dateFilter: 'all',
                      minStock: 0,
                      maxStock: 1000
                    };
                    setAdvancedFilters(resetFilters);
                    setPriceRange([0, 2000000]);
                    setSelectedSort('relevance');
                  }}
                  className="mt-6 text-orange-600 font-bold hover:underline"
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 p-2 rounded-xl text-white">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-neutral-900 tracking-tight">O Teu Carrinho</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-neutral-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {cart.length > 0 ? (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
                        <img src={item.imageURL} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-neutral-900 line-clamp-1">{item.name}</h4>
                        <p className="text-xs font-black text-orange-600 uppercase tracking-widest mt-0.5">{item.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-white rounded-md transition-colors"
                            >
                              <X className="w-3 h-3 text-neutral-400" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-white rounded-md transition-colors"
                            >
                              <Plus className="w-3 h-3 text-neutral-400" />
                            </button>
                          </div>
                          <p className="font-black text-neutral-900">{(item.price * item.quantity).toLocaleString()} Kz</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <ShoppingCart className="w-16 h-16 text-neutral-200 mb-4" />
                    <p className="text-neutral-500 font-bold">O seu carrinho está vazio</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-bold">Subtotal</span>
                  <span className="text-2xl font-black text-neutral-900">{cartTotal.toLocaleString()} Kz</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Finalizar Compra <ChevronRight className="w-5 h-5" />
                </button>
                <p className="text-[10px] text-center text-neutral-400 font-medium">Portes de envio calculados no checkout.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-400 hover:text-neutral-900 z-20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="md:w-1/2 aspect-square bg-neutral-100">
                <img 
                  src={quickViewProduct.imageURL} 
                  alt={quickViewProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <p className="text-xs font-black text-orange-600 uppercase tracking-[0.3em] mb-4">{quickViewProduct.category}</p>
                <h2 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tighter mb-4 leading-none">{quickViewProduct.name}</h2>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-neutral-400">4.9 (120 avaliações)</span>
                </div>

                <p className="text-neutral-500 font-medium leading-relaxed mb-8">
                  {quickViewProduct.description || "Este produto premium oferece qualidade excepcional e design moderno, perfeito para o seu estilo de vida."}
                </p>

                <div className="flex items-end gap-4 mb-10">
                  <p className="text-4xl font-black text-neutral-900 leading-none">{quickViewProduct.price.toLocaleString()} Kz</p>
                  {quickViewProduct.oldPrice && (
                    <p className="text-lg text-neutral-400 line-through font-bold mb-1">{quickViewProduct.oldPrice.toLocaleString()} Kz</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                      setIsCartOpen(true);
                    }}
                    className="flex-1 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
                  >
                    Adicionar ao Carrinho <ShoppingCart className="w-5 h-5" />
                  </button>
                  <button className="p-4 bg-neutral-100 text-neutral-400 hover:text-red-500 rounded-2xl transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Quick Access */}
      {userProfile?.role === 'admin' && (
        <Link 
          to="/admin"
          className="fixed bottom-8 right-8 bg-neutral-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:bg-orange-600 transition-all z-40"
        >
          <Settings className="w-5 h-5" />
          Painel de Administração
        </Link>
      )}
    </div>
  );
};
