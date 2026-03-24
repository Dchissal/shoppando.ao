import React, { useState } from 'react';
import { 
  Search, 
  TrendingUp, 
  Plus, 
  Loader2, 
  Package, 
  Edit3, 
  Trash2, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';
import { motion } from 'motion/react';
import { db, storage, auth } from '../../firebase';
import { collection, addDoc, doc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface ProductsViewProps {
  products: Product[];
}

export function ProductsView({ 
  products
}: ProductsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        status: currentStatus === 'active' ? 'inactive' : 'active'
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let imageURL = editingProduct?.imageURL || '';
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageURL = await getDownloadURL(storageRef);
      }

      const productData = {
        name: formData.get('name') as string,
        price: Number(formData.get('price')),
        oldPrice: Number(formData.get('oldPrice')) || null,
        stock: Number(formData.get('stock')),
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        colors: (formData.get('colors') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
        sizes: (formData.get('sizes') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
        imageURL,
        status: editingProduct?.status || 'active',
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        // Adicionar createdBy que é obrigatório nas regras do Firestore
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('Utilizador não autenticado');
        }
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
        });
      }

      closeForm();
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    } finally {
      setLoading(false);
    }
  };

  const seedProducts = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilizador não autenticado');
      }

      const exampleProducts = [
        { name: "iPhone 15 Pro", price: 1250000, category: "Eletrónicos", stock: 15, status: 'active', imageURL: "https://picsum.photos/seed/iphone/800/800", createdBy: currentUser.uid, createdAt: serverTimestamp() },
        { name: "MacBook Air M2", price: 1850000, category: "Eletrónicos", stock: 8, status: 'active', imageURL: "https://picsum.photos/seed/macbook/800/800", createdBy: currentUser.uid, createdAt: serverTimestamp() },
        { name: "Sapatilhas Nike Air", price: 85000, category: "Moda", stock: 24, status: 'active', imageURL: "https://picsum.photos/seed/nike/800/800", createdBy: currentUser.uid, createdAt: serverTimestamp() },
        { name: "Relógio Digital Pro", price: 45000, category: "Eletrónicos", stock: 3, status: 'active', imageURL: "https://picsum.photos/seed/watch/800/800", createdBy: currentUser.uid, createdAt: serverTimestamp() },
      ];

      for (const p of exampleProducts) {
        await addDoc(collection(db, 'products'), p);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setImagePreview(product.imageURL);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Pesquisar no catálogo..."
            className="w-full bg-neutral-50 border border-neutral-100 rounded-xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={seedProducts}
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-200 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><TrendingUp className="w-4 h-4" /> Gerar Exemplos</>}
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
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
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Package className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                    <p className="text-neutral-900 font-bold text-lg">Catálogo vazio</p>
                    <p className="text-neutral-400">Começa por adicionar o teu primeiro produto.</p>
                  </td>
                </tr>
              ) : products.map((product) => (
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

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                  {editingProduct ? 'Editar Artigo' : 'Novo Artigo'}
                </h2>
                <p className="text-neutral-500 font-medium text-sm">Preenche os detalhes do produto.</p>
              </div>
              <button 
                onClick={closeForm}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Imagem Principal</label>
                    <div className="relative group aspect-square rounded-3xl bg-neutral-100 border-2 border-dashed border-neutral-200 overflow-hidden flex items-center justify-center hover:border-orange-400 transition-colors">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                          <ImageIcon className="w-10 h-10" />
                          <span className="text-xs font-bold">Carregar Imagem</span>
                        </div>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Nome do Artigo</label>
                    <input 
                      name="name"
                      type="text" 
                      defaultValue={editingProduct?.name}
                      placeholder="Ex: iPhone 15 Pro Max"
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Preço (Kz)</label>
                      <input 
                        name="price"
                        type="number" 
                        defaultValue={editingProduct?.price}
                        placeholder="0"
                        className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Stock Inicial</label>
                      <input 
                        name="stock"
                        type="number" 
                        defaultValue={editingProduct?.stock}
                        placeholder="0"
                        className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Categoria</label>
                    <select 
                      name="category"
                      defaultValue={editingProduct?.category}
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold appearance-none"
                      required
                    >
                      <option value="">Seleciona...</option>
                      <option value="Eletrónicos">Eletrónicos</option>
                      <option value="Moda">Moda</option>
                      <option value="Casa">Casa</option>
                      <option value="Beleza">Beleza</option>
                      <option value="Desporto">Desporto</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Cores (separadas por vírgula)</label>
                  <input 
                    name="colors"
                    type="text" 
                    defaultValue={editingProduct?.colors?.join(', ')}
                    placeholder="Ex: Preto, Branco, Azul"
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Tamanhos (separados por vírgula)</label>
                  <input 
                    name="sizes"
                    type="text" 
                    defaultValue={editingProduct?.sizes?.join(', ')}
                    placeholder="Ex: S, M, L, XL"
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                <textarea 
                  name="description"
                  defaultValue={editingProduct?.description}
                  rows={4}
                  placeholder="Descreve as características principais do produto..."
                  className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-medium resize-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-4 bg-neutral-100 text-neutral-600 font-bold rounded-2xl hover:bg-neutral-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingProduct ? 'Guardar Alterações' : 'Publicar Artigo')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
