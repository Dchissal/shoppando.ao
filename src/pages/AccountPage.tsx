import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  MapPin, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { STORE_NAME } from '../constants';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: any;
  items: any[];
}

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;
      
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-600';
      case 'processing': return 'bg-blue-100 text-blue-600';
      case 'shipped': return 'bg-purple-100 text-purple-600';
      case 'delivered': return 'bg-green-100 text-green-600';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Settings className="w-4 h-4 animate-spin-slow" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Header */}
      <nav className="bg-white border-b border-neutral-100 px-4 md:px-8 py-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/store" className="flex items-center gap-2 group">
            <div className="bg-orange-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-neutral-900">{STORE_NAME.split('.')[0].toUpperCase()}</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-400 hover:text-red-600 font-bold transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="lg:w-80 space-y-4">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-neutral-100 text-center">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                <User className="w-12 h-12 text-orange-600" />
              </div>
              <h2 className="text-xl font-black text-neutral-900 mb-1">{auth.currentUser?.displayName || 'Utilizador'}</h2>
              <p className="text-neutral-400 text-sm font-medium mb-6">{auth.currentUser?.email}</p>
              <div className="bg-neutral-50 rounded-2xl p-4 flex justify-around">
                <div className="text-center">
                  <span className="block text-lg font-black text-neutral-900">{orders.length}</span>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pedidos</span>
                </div>
                <div className="w-[1px] bg-neutral-200" />
                <div className="text-center">
                  <span className="block text-lg font-black text-neutral-900">0</span>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Favoritos</span>
                </div>
              </div>
            </div>

            <nav className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-neutral-100 space-y-2">
              {[
                { id: 'orders', name: 'Meus Pedidos', icon: Package },
                { id: 'profile', name: 'Dados Pessoais', icon: User },
                { id: 'addresses', name: 'Endereços', icon: MapPin },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    activeTab === item.id 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' 
                      : 'text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">Meus Pedidos</h1>
                    <div className="text-sm font-bold text-neutral-400">Total: {orders.length}</div>
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white h-32 rounded-3xl animate-pulse border border-neutral-100" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white p-20 rounded-[4rem] text-center border border-neutral-100">
                      <div className="bg-neutral-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-neutral-200" />
                      </div>
                      <h3 className="text-xl font-black text-neutral-900 mb-2">Nenhum pedido encontrado</h3>
                      <p className="text-neutral-400 mb-8">Você ainda não realizou nenhuma compra na nossa loja.</p>
                      <Link to="/store" className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all">
                        Ir às Compras <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-neutral-100 hover:border-orange-200 transition-all group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-100">
                                <Package className="w-8 h-8 text-neutral-300" />
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-lg font-black text-neutral-900">#{order.id.slice(-6).toUpperCase()}</span>
                                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status === 'pending' ? 'Pendente' : 
                                     order.status === 'processing' ? 'Processando' :
                                     order.status === 'shipped' ? 'Enviado' : 'Entregue'}
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-neutral-400">
                                  {order.createdAt?.toDate().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                              <div className="text-right">
                                <span className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">Total</span>
                                <span className="text-xl font-black text-orange-600">{order.total.toLocaleString()} Kz</span>
                              </div>
                              <button className="p-4 bg-neutral-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                                <ChevronRight className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white p-8 md:p-12 rounded-[3rem] border border-neutral-100"
                >
                  <h1 className="text-3xl font-black text-neutral-900 tracking-tighter mb-8">Dados Pessoais</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Nome</label>
                      <input 
                        type="text" 
                        readOnly
                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-6 font-bold text-neutral-600 outline-none"
                        value={auth.currentUser?.displayName || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">E-mail</label>
                      <input 
                        type="email" 
                        readOnly
                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-6 font-bold text-neutral-600 outline-none"
                        value={auth.currentUser?.email || ''}
                      />
                    </div>
                  </div>
                  <div className="mt-12 p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-start gap-4">
                    <div className="bg-orange-600 p-2 rounded-xl">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-orange-900 mb-1">Edição de Perfil</h4>
                      <p className="text-orange-700 text-sm font-medium">Para alterar os seus dados, por favor contacte o suporte ou utilize as definições da sua conta Google.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">Endereços</h1>
                    <button className="bg-neutral-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-orange-600 transition-all">
                      Novo Endereço
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-orange-600 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-orange-600 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase">Principal</div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-orange-100 p-3 rounded-2xl">
                          <MapPin className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-black text-neutral-900">Casa</h3>
                      </div>
                      <p className="text-neutral-500 font-medium mb-8">
                        Rua Direita da Samba, Prédio 12<br />
                        Apartamento 4B, Luanda<br />
                        Angola
                      </p>
                      <div className="flex gap-4">
                        <button className="text-sm font-black text-neutral-900 hover:text-orange-600 transition-colors">Editar</button>
                        <button className="text-sm font-black text-neutral-400 hover:text-red-600 transition-colors">Remover</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountPage;
