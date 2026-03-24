import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  CheckCircle2,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { STORE_NAME } from '../constants';

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: auth.currentUser?.email || '',
    phone: '',
    address: '',
    city: 'Luanda',
    paymentMethod: 'multicaixa'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        userId: auth.currentUser?.uid || 'anonymous',
        customer: formData,
        items: cart,
        total: cartTotal,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);
      clearCart();
      setStep(3);
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl shadow-neutral-200/50 max-w-md w-full">
          <div className="bg-neutral-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-neutral-300" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-2">O seu carrinho está vazio</h2>
          <p className="text-neutral-500 mb-8">Adicione alguns produtos antes de finalizar a compra.</p>
          <Link to="/store" className="block w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all">
            Voltar à Loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 pb-20">
      {/* Header */}
      <nav className="bg-white border-b border-neutral-100 px-4 md:px-8 py-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/store" className="flex items-center gap-2 group">
            <div className="bg-orange-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-neutral-900">{STORE_NAME.split('.')[0].toUpperCase()}</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-orange-600' : 'text-neutral-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-neutral-100'}`}>1</div>
              <span className="font-bold">Dados</span>
            </div>
            <div className="w-12 h-[2px] bg-neutral-100" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-orange-600' : 'text-neutral-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-neutral-100'}`}>2</div>
              <span className="font-bold">Pagamento</span>
            </div>
            <div className="w-12 h-[2px] bg-neutral-100" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-orange-600' : 'text-neutral-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-neutral-100'}`}>3</div>
              <span className="font-bold">Sucesso</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-neutral-100">
                  <h2 className="text-2xl font-black text-neutral-900 mb-8 flex items-center gap-3">
                    <User className="w-6 h-6 text-orange-600" />
                    Dados de Entrega
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                        <input 
                          type="text" 
                          name="name"
                          placeholder="Ex: Daniel Reciado"
                          className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                        <input 
                          type="email" 
                          name="email"
                          placeholder="Ex: seu@email.com"
                          className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                        <input 
                          type="tel" 
                          name="phone"
                          placeholder="Ex: 923 000 000"
                          className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Cidade</label>
                      <select 
                        name="city"
                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none font-bold text-neutral-600"
                        value={formData.city}
                        onChange={handleInputChange}
                      >
                        <option value="Luanda">Luanda</option>
                        <option value="Benguela">Benguela</option>
                        <option value="Huambo">Huambo</option>
                        <option value="Lubango">Lubango</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Endereço Completo</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                        <input 
                          type="text" 
                          name="address"
                          placeholder="Ex: Rua Direita da Samba, Prédio X, Apto Y"
                          className="w-full bg-neutral-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-neutral-100">
                  <h2 className="text-2xl font-black text-neutral-900 mb-8 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                    Método de Pagamento
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'multicaixa', name: 'Multicaixa Express', icon: '💳' },
                      { id: 'visa', name: 'Cartão Visa', icon: '🌎' },
                      { id: 'cash', name: 'Dinheiro na Entrega', icon: '💵' }
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                          formData.paymentMethod === method.id 
                            ? 'border-orange-600 bg-orange-50 text-orange-600' 
                            : 'border-neutral-100 hover:border-neutral-200 text-neutral-500'
                        }`}
                      >
                        <span className="text-3xl">{method.icon}</span>
                        <span className="font-bold text-sm">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-neutral-100 sticky top-32">
                  <h3 className="text-xl font-black text-neutral-900 mb-6">Resumo do Pedido</h3>
                  <div className="space-y-4 mb-8">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-neutral-500 font-medium">
                          <span className="font-black text-neutral-900">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="font-bold">{(item.price * item.quantity).toLocaleString()} Kz</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3 pt-6 border-t border-neutral-50 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400 font-bold">Subtotal</span>
                      <span className="font-bold">{cartTotal.toLocaleString()} Kz</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400 font-bold">Portes de Envio</span>
                      <span className="text-green-600 font-bold">Grátis</span>
                    </div>
                    <div className="flex justify-between items-end pt-4">
                      <span className="text-lg font-black text-neutral-900">Total</span>
                      <span className="text-3xl font-black text-orange-600">{cartTotal.toLocaleString()} Kz</span>
                    </div>
                  </div>

                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading || !formData.name || !formData.phone || !formData.address}
                    className="w-full py-5 bg-neutral-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Confirmar Pedido <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center text-center p-4 bg-neutral-50 rounded-2xl">
                      <Truck className="w-5 h-5 text-neutral-400 mb-2" />
                      <span className="text-[10px] font-bold text-neutral-500 uppercase">Entrega em 24h</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-neutral-50 rounded-2xl">
                      <ShieldCheck className="w-5 h-5 text-neutral-400 mb-2" />
                      <span className="text-[10px] font-bold text-neutral-500 uppercase">Compra Segura</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl shadow-neutral-200/50 border border-neutral-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-4xl font-black text-neutral-900 mb-4 tracking-tighter">Pedido Confirmado!</h2>
                <p className="text-neutral-500 text-lg mb-8 font-medium">
                  Obrigado pela sua compra, <span className="text-neutral-900 font-black">{formData.name}</span>. 
                  O seu pedido <span className="text-orange-600 font-black">#{orderId?.slice(-6).toUpperCase()}</span> foi recebido e está a ser processado.
                </p>
                
                <div className="bg-neutral-50 p-8 rounded-3xl mb-12 text-left space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-bold">Método de Pagamento</span>
                    <span className="font-black text-neutral-900 uppercase">{formData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-bold">Previsão de Entrega</span>
                    <span className="font-black text-neutral-900">Hoje até às 18:00</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/store" className="flex-1 py-4 bg-neutral-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-neutral-200">
                    Continuar a Comprar
                  </Link>
                  <Link to="/account" className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-900 font-black rounded-2xl hover:bg-neutral-50 transition-all flex items-center justify-center">
                    Ver Meus Pedidos
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CheckoutPage;
