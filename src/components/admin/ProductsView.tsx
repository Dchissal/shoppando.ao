import React, { useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  Plus,
  Loader2,
  Package,
  Edit3,
  Trash2,
  Star,
  Filter,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { ProductWizardModal } from './product-wizard';

interface ProductsViewProps {
  products: Product[];
}

export function ProductsView({
  products
}: ProductsViewProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Estados dos filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'not_featured'>('all');

  // Extrair categorias únicas dos produtos
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtro de pesquisa
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCategory = product.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory) return false;
      }

      // Filtro de categoria
      if (filterCategory && product.category !== filterCategory) return false;

      // Filtro de preço mínimo
      if (filterPriceMin && product.price < Number(filterPriceMin)) return false;

      // Filtro de preço máximo
      if (filterPriceMax && product.price > Number(filterPriceMax)) return false;

      // Filtro de stock
      if (filterStock !== 'all') {
        if (filterStock === 'in_stock' && product.stock <= 0) return false;
        if (filterStock === 'low_stock' && (product.stock <= 0 || product.stock >= 5)) return false;
        if (filterStock === 'out_of_stock' && product.stock > 0) return false;
      }

      // Filtro de estado
      if (filterStatus !== 'all' && product.status !== filterStatus) return false;

      // Filtro de destaque
      if (filterFeatured !== 'all') {
        if (filterFeatured === 'featured' && !product.featured) return false;
        if (filterFeatured === 'not_featured' && product.featured) return false;
      }

      return true;
    });
  }, [products, searchQuery, filterCategory, filterPriceMin, filterPriceMax, filterStock, filterStatus, filterFeatured]);

  // Verificar se há filtros activos
  const hasActiveFilters = filterCategory || filterPriceMin || filterPriceMax || filterStock !== 'all' || filterStatus !== 'all' || filterFeatured !== 'all';

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setFilterStock('all');
    setFilterStatus('all');
    setFilterFeatured('all');
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        status: currentStatus === 'active' ? 'inactive' : 'active'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        featured: !currentFeatured
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Tens a certeza que queres eliminar este artigo?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setShowWizard(true);
  };

  const closeWizard = () => {
    setShowWizard(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar no catálogo..."
              className="w-full bg-neutral-50 border border-neutral-100 rounded-xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-orange-50 border-orange-200 text-orange-600'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-orange-600 text-white text-xs font-black rounded-full flex items-center justify-center">
                  !
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setShowWizard(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="pt-4 border-t border-neutral-100 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Filtro Categoria */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Categoria
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-orange-500 outline-none font-medium text-sm appearance-none cursor-pointer"
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Preço Mínimo */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Preço Mín.
                </label>
                <input
                  type="number"
                  value={filterPriceMin}
                  onChange={(e) => setFilterPriceMin(e.target.value)}
                  placeholder="0 Kz"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-orange-500 outline-none font-medium text-sm"
                />
              </div>

              {/* Filtro Preço Máximo */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Preço Máx.
                </label>
                <input
                  type="number"
                  value={filterPriceMax}
                  onChange={(e) => setFilterPriceMax(e.target.value)}
                  placeholder="∞ Kz"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-orange-500 outline-none font-medium text-sm"
                />
              </div>

              {/* Filtro Stock */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Stock
                </label>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value as typeof filterStock)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-orange-500 outline-none font-medium text-sm appearance-none cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="in_stock">Em stock</option>
                  <option value="low_stock">Stock baixo (&lt;5)</option>
                  <option value="out_of_stock">Sem stock</option>
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Estado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-orange-500 outline-none font-medium text-sm appearance-none cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {/* Filtro Destaque */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">
                  Destaque
                </label>
                <select
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value as typeof filterFeatured)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-orange-500 outline-none font-medium text-sm appearance-none cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="featured">Em destaque</option>
                  <option value="not_featured">Normal</option>
                </select>
              </div>
            </div>

            {/* Botão Limpar Filtros */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Indicador de resultados */}
        {(searchQuery || hasActiveFilters) && (
          <div className="pt-3 border-t border-neutral-100">
            <p className="text-sm text-neutral-500">
              <span className="font-bold text-neutral-900">{filteredProducts.length}</span> de{' '}
              <span className="font-bold text-neutral-900">{products.length}</span> produtos encontrados
            </p>
          </div>
        )}
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Artigo</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Preço</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Destaque</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <Package className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                    <p className="text-neutral-900 font-bold text-lg">
                      {products.length === 0 ? 'Catálogo vazio' : 'Nenhum produto encontrado'}
                    </p>
                    <p className="text-neutral-400">
                      {products.length === 0
                        ? 'Começa por adicionar o teu primeiro produto.'
                        : 'Tenta ajustar os filtros de pesquisa.'}
                    </p>
                    {hasActiveFilters && products.length > 0 && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Limpar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img src={product.imageURL} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 truncate">{product.name}</p>
                        <p className="text-[10px] text-neutral-400 font-medium truncate">ID: {product.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-[10px] font-black uppercase rounded-lg">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-neutral-900">{product.price.toLocaleString()} Kz</p>
                    {product.oldPrice && <p className="text-xs text-neutral-400 line-through">{product.oldPrice.toLocaleString()} Kz</p>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className={`font-bold ${product.stock < 5 ? 'text-red-600' : 'text-neutral-600'}`}>{product.stock} un.</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(product.id, product.status)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      {product.status === 'active' ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleFeatured(product.id, product.featured || false)}
                      className={`p-2 rounded-lg transition-all ${
                        product.featured
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                          : 'bg-neutral-100 text-neutral-300 hover:bg-neutral-200 hover:text-neutral-500'
                      }`}
                      title={product.featured ? 'Remover da Landing' : 'Adicionar à Landing'}
                    >
                      <Star className={`w-5 h-5 ${product.featured ? 'fill-orange-600' : ''}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Wizard Modal */}
      <ProductWizardModal
        isOpen={showWizard}
        onClose={closeWizard}
        editingProduct={editingProduct}
      />
    </div>
  );
}
