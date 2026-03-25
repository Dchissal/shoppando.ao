import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Package,
  Sparkles,
  CheckCircle,
  Loader2,
  Smartphone,
  Shirt,
  Home,
  Sparkle,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Apple,
  LucideIcon
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { STORE_NAME } from '../constants';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: string; name: string; icon: LucideIcon; description: string }[] = [
  { id: 'eletronicos', name: 'Eletrónicos', icon: Smartphone, description: 'Smartphones, computadores, gadgets' },
  { id: 'moda', name: 'Moda', icon: Shirt, description: 'Roupas, calçados, acessórios' },
  { id: 'casa', name: 'Casa & Decoração', icon: Home, description: 'Móveis, decoração, utensílios' },
  { id: 'beleza', name: 'Beleza', icon: Sparkle, description: 'Cosméticos, perfumes, cuidados' },
  { id: 'desporto', name: 'Desporto', icon: Dumbbell, description: 'Equipamentos, roupas desportivas' },
  { id: 'livros', name: 'Livros & Papelaria', icon: BookOpen, description: 'Livros, material escolar' },
  { id: 'brinquedos', name: 'Brinquedos', icon: Gamepad2, description: 'Jogos, brinquedos, consolas' },
  { id: 'alimentacao', name: 'Alimentação', icon: Apple, description: 'Produtos alimentares, bebidas' },
];

const PRODUCTS_BY_CATEGORY: Record<string, string[]> = {
  eletronicos: ['iPhone', 'Samsung Galaxy', 'MacBook', 'iPad', 'AirPods', 'Smart TV', 'PlayStation', 'Xbox', 'Câmara Digital', 'Smartwatch', 'Drone', 'Outro'],
  moda: ['Vestidos', 'Calças', 'T-shirts', 'Sapatos', 'Sapatilhas', 'Bolsas', 'Relógios', 'Óculos de Sol', 'Joias', 'Roupa de Criança', 'Outro'],
  casa: ['Sofás', 'Camas', 'Mesas', 'Cadeiras', 'Tapetes', 'Cortinas', 'Eletrodomésticos', 'Panelas', 'Talheres', 'Decoração', 'Outro'],
  beleza: ['Maquilhagem', 'Perfumes', 'Cremes', 'Shampoo', 'Produtos Capilares', 'Unhas', 'Cuidados de Pele', 'Sets de Presente', 'Outro'],
  desporto: ['Bolas', 'Equipamento de Ginásio', 'Bicicletas', 'Roupa de Treino', 'Ténis de Corrida', 'Yoga', 'Camping', 'Natação', 'Outro'],
  livros: ['Romances', 'Autoajuda', 'Infantil', 'Escolar', 'Cadernos', 'Canetas', 'Mochilas', 'Material de Escritório', 'Outro'],
  brinquedos: ['Bonecas', 'Carros', 'LEGO', 'Puzzles', 'Jogos de Tabuleiro', 'Peluches', 'Consolas', 'Jogos de Vídeo', 'Outro'],
  alimentacao: ['Snacks', 'Bebidas', 'Produtos Importados', 'Produtos Bio', 'Chocolates', 'Café', 'Chá', 'Outro'],
};

export default function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [customProduct, setCustomProduct] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleProductToggle = (product: string) => {
    setSelectedProducts(prev =>
      prev.includes(product)
        ? prev.filter(p => p !== product)
        : [...prev, product]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return;

    // Validação adicional
    if (selectedCategories.length === 0) {
      alert('Por favor, seleciona pelo menos uma categoria.');
      return;
    }

    if (selectedProducts.length === 0 && !customProduct.trim()) {
      alert('Por favor, seleciona ou indica pelo menos um produto.');
      return;
    }

    setLoading(true);
    try {
      const wishData = {
        name: name.trim(),
        email: email.trim(),
        categories: selectedCategories,
        products: [
          ...selectedProducts,
          ...(customProduct.trim() ? [customProduct.trim()] : [])
        ],
        status: 'pending' as const,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'wishes'), wishData);
      setSuccess(true);
    } catch (error: any) {
      console.error('Error submitting wish:', error);

      // Mensagens de erro mais específicas
      if (error.code === 'permission-denied') {
        alert('Erro de permissão. Por favor, tenta novamente ou contacta o suporte.');
      } else if (error.code === 'unavailable') {
        alert('Serviço temporariamente indisponível. Verifica a tua conexão e tenta novamente.');
      } else {
        alert(`Erro ao enviar: ${error.message || 'Tenta novamente.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedCategories([]);
    setSelectedProducts([]);
    setCustomProduct('');
    setName('');
    setEmail('');
    setSuccess(false);
    onClose();
  };

  const availableProducts = selectedCategories.flatMap(cat => PRODUCTS_BY_CATEGORY[cat] || []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={resetAndClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-orange-500 to-red-500 text-white relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
              <button
                onClick={resetAndClose}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-8 h-8 fill-white" />
                  <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                    Lista de Desejos
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black">
                  {success ? 'Obrigado!' : 'O que gostarias de encontrar?'}
                </h2>
                <p className="text-white/80 font-medium mt-1">
                  {success
                    ? 'Recebemos a tua lista de desejos!'
                    : `Ajuda-nos a trazer os produtos que desejas ao ${STORE_NAME}`}
                </p>
              </div>

              {/* Step indicator */}
              {!success && (
                <div className="flex items-center gap-2 mt-6 relative z-10">
                  {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        s === step ? 'bg-white text-orange-600' : s < step ? 'bg-white/40 text-white' : 'bg-white/20 text-white/60'
                      }`}>
                        {s < step ? '✓' : s}
                      </div>
                      {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-white/40' : 'bg-white/20'}`} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 mb-3">
                      Desejo Registado!
                    </h3>
                    <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                      Vamos analisar os teus pedidos e trabalhar para trazer estes produtos ao {STORE_NAME}.
                      Entraremos em contacto quando estiverem disponíveis!
                    </p>
                    <button
                      onClick={resetAndClose}
                      className="px-8 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                    >
                      Fechar
                    </button>
                  </motion.div>
                ) : step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">
                      Seleciona as categorias que te interessam
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryToggle(cat.id)}
                          className={`p-4 rounded-2xl text-left transition-all border-2 ${
                            selectedCategories.includes(cat.id)
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-neutral-100 hover:border-orange-200 bg-white'
                          }`}
                        >
                          <cat.icon className="w-6 h-6 mb-2 text-orange-500" />
                          <p className="font-bold text-neutral-900 text-sm">{cat.name}</p>
                          <p className="text-[10px] text-neutral-500">{cat.description}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : step === 2 ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">
                      Que produtos gostarias de ver?
                    </h3>
                    {selectedCategories.length === 0 ? (
                      <p className="text-neutral-500 text-center py-8">
                        Seleciona pelo menos uma categoria no passo anterior.
                      </p>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {availableProducts.map(product => (
                            <button
                              key={product}
                              onClick={() => handleProductToggle(product)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedProducts.includes(product)
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              {product}
                            </button>
                          ))}
                        </div>

                        <div className="mt-6">
                          <label className="text-sm font-bold text-neutral-700 mb-2 block">
                            <Sparkles className="w-4 h-4 inline mr-2 text-orange-500" />
                            Outro produto específico?
                          </label>
                          <input
                            type="text"
                            value={customProduct}
                            onChange={e => setCustomProduct(e.target.value)}
                            placeholder="Ex: iPhone 16 Pro Max 256GB"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">
                      Os teus dados de contacto
                    </h3>
                    <p className="text-neutral-500 text-sm mb-6">
                      Vamos contactar-te quando os produtos estiverem disponíveis.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-500" />
                          Nome
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="O teu nome"
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-500" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="O teu email"
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-500" />
                        Resumo do Pedido
                      </h4>
                      <div className="text-sm text-neutral-600">
                        <p><strong>Categorias:</strong> {selectedCategories.map(c => CATEGORIES.find(cat => cat.id === c)?.name).join(', ') || '-'}</p>
                        <p className="mt-1"><strong>Produtos:</strong> {[...selectedProducts, ...(customProduct ? [customProduct] : [])].join(', ') || '-'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!success && (
              <div className="p-6 border-t border-neutral-100 flex justify-between gap-4 flex-shrink-0">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 && selectedCategories.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !name.trim() || !email.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Heart className="w-5 h-5 fill-white" />
                        Enviar Desejos
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
