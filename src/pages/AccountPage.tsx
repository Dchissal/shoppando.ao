import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  Phone,
  Camera,
  Loader,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, storage } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { STORE_NAME } from '../constants';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: any;
  items: any[];
  customer?: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city?: string;
    paymentMethod: string;
  };
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  address?: string;
}

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [showRemoveAddressConfirm, setShowRemoveAddressConfirm] = useState(false);
  const [removingAddress, setRemovingAddress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

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

    fetchUserData();
    fetchOrders();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione apenas arquivos de imagem.', 'error');
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 2MB.', 'error');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Criar referência no Storage
      const storageRef = ref(storage, `profile-photos/${auth.currentUser.uid}/${Date.now()}_${file.name}`);

      // Upload do arquivo
      await uploadBytes(storageRef, file);

      // Obter URL da foto
      const photoURL = await getDownloadURL(storageRef);

      // Atualizar Firestore
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { photoURL });

      // Atualizar estado local
      setUserData(prev => prev ? { ...prev, photoURL } : null);

      showToast('Foto de perfil atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      showToast('Erro ao atualizar foto de perfil. Tente novamente.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCancelOrder = async (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    setCancellingOrder(true);
    setShowCancelConfirm(false);

    try {
      const orderRef = doc(db, 'orders', orderToCancel);
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelledAt: new Date()
      });

      // Atualizar lista local
      setOrders(prev => prev.map(order =>
        order.id === orderToCancel ? { ...order, status: 'cancelled' } : order
      ));

      // Fechar modal
      setSelectedOrder(null);

      showToast('Pedido cancelado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      showToast('Erro ao cancelar pedido. Tente novamente.', 'error');
    } finally {
      setCancellingOrder(false);
      setOrderToCancel(null);
    }
  };

  const handleEditAddress = () => {
    setEditingAddress(userData?.address || '');
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (!auth.currentUser) return;

    setSavingAddress(true);

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { address: editingAddress.trim() });

      setUserData(prev => prev ? { ...prev, address: editingAddress.trim() } : null);
      setShowAddressModal(false);
      showToast('Endereço atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      showToast('Erro ao atualizar endereço. Tente novamente.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleRemoveAddress = async () => {
    if (!auth.currentUser) return;

    setRemovingAddress(true);

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { address: '' });

      setUserData(prev => prev ? { ...prev, address: '' } : null);
      setShowRemoveAddressConfirm(false);
      showToast('Endereço removido com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao remover endereço:', error);
      showToast('Erro ao remover endereço. Tente novamente.', 'error');
    } finally {
      setRemovingAddress(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-600';
      case 'processing': return 'bg-blue-100 text-blue-600';
      case 'shipped': return 'bg-purple-100 text-purple-600';
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Settings className="w-4 h-4 animate-spin-slow" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
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
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                  {userData?.photoURL || auth.currentUser?.photoURL ? (
                    <img
                      src={userData?.photoURL || auth.currentUser?.photoURL || ''}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-orange-600" />
                  )}
                </div>
                <button
                  onClick={triggerPhotoUpload}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Alterar foto de perfil"
                >
                  {uploadingPhoto ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <h2 className="text-xl font-black text-neutral-900 mb-1">
                {userData?.name || auth.currentUser?.displayName || 'Utilizador'}
              </h2>
              <p className="text-neutral-400 text-sm font-medium mb-6">
                {userData?.email || auth.currentUser?.email}
              </p>
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
                                    {getStatusText(order.status)}
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
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-4 bg-neutral-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all"
                              >
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

                  {/* Foto de Perfil */}
                  <div className="flex items-center gap-6 mb-10 p-6 bg-neutral-50 rounded-3xl">
                    <div className="relative">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                        {userData?.photoURL || auth.currentUser?.photoURL ? (
                          <img
                            src={userData?.photoURL || auth.currentUser?.photoURL || ''}
                            alt="Foto de perfil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-orange-600" />
                        )}
                      </div>
                      <button
                        onClick={triggerPhotoUpload}
                        disabled={uploadingPhoto}
                        className="absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-700 text-white p-1.5 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Alterar foto de perfil"
                      >
                        {uploadingPhoto ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <Camera className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-neutral-900 mb-1">Foto de Perfil</h3>
                      <p className="text-sm text-neutral-400 font-medium mb-2">
                        {userData?.photoURL || auth.currentUser?.photoURL ? 'Foto personalizada' : 'Nenhuma foto definida'}
                      </p>
                      <button
                        onClick={triggerPhotoUpload}
                        disabled={uploadingPhoto}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
                      >
                        {uploadingPhoto ? 'Enviando...' : 'Alterar foto'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-6 font-bold text-neutral-600 outline-none"
                        value={userData?.name || auth.currentUser?.displayName || 'Não informado'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">E-mail</label>
                      <input
                        type="email"
                        readOnly
                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-6 font-bold text-neutral-600 outline-none"
                        value={userData?.email || auth.currentUser?.email || 'Não informado'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        readOnly
                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-6 font-bold text-neutral-600 outline-none"
                        value={userData?.phone || 'Não informado'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        Endereço
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-neutral-50 border-none rounded-2xl py-4 px-6 font-bold text-neutral-600 outline-none"
                        value={userData?.address || 'Não informado'}
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
                        {userData?.address || 'Endereço não informado'}
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={handleEditAddress}
                          className="text-sm font-black text-neutral-900 hover:text-orange-600 transition-colors"
                        >
                          Editar
                        </button>
                       {/* <button
                          onClick={() => setShowRemoveAddressConfirm(true)}
                          disabled={!userData?.address}
                          className="text-sm font-black text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remover
                        </button>*/}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Drawer de Detalhes do Pedido */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-full md:w-[600px] bg-white shadow-2xl overflow-y-auto"
            >
              {/* Header Fixo */}
              <div className="sticky top-0 bg-white border-b border-neutral-100 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-neutral-900">
                      #{selectedOrder.id.slice(-6).toUpperCase()}
                    </h2>
                    <p className="text-sm text-neutral-400 font-bold mt-1">
                      {selectedOrder.createdAt?.toDate().toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-3 hover:bg-neutral-100 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className={`p-5 rounded-3xl flex items-center justify-between ${
                  selectedOrder.status === 'pending' ? 'bg-orange-50' :
                  selectedOrder.status === 'processing' ? 'bg-blue-50' :
                  selectedOrder.status === 'shipped' ? 'bg-purple-50' :
                  selectedOrder.status === 'delivered' ? 'bg-green-50' :
                  'bg-red-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      selectedOrder.status === 'pending' ? 'bg-orange-600' :
                      selectedOrder.status === 'processing' ? 'bg-blue-600' :
                      selectedOrder.status === 'shipped' ? 'bg-purple-600' :
                      selectedOrder.status === 'delivered' ? 'bg-green-600' :
                      'bg-red-600'
                    }`}>
                      <div className="text-white">
                        {getStatusIcon(selectedOrder.status)}
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</span>
                      <span className="block text-lg font-black text-neutral-900">{getStatusText(selectedOrder.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Botão Cancelar (apenas se pending) */}
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={cancellingOrder}
                    className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {cancellingOrder ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" />
                        Cancelar Pedido
                      </>
                    )}
                  </button>
                )}

                {/* Itens do Pedido */}
                <div>
                  <h3 className="text-lg font-black text-neutral-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Itens do Pedido
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl">
                        <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
                          <img
                            src={item.imageURL || '/placeholder.png'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-neutral-900 text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-neutral-400 font-bold">
                            {item.quantity}x · {item.price.toLocaleString()} Kz
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="block text-base font-black text-orange-600 whitespace-nowrap">
                            {(item.price * item.quantity).toLocaleString()} Kz
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações de Entrega */}
                {selectedOrder.customer && (
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Informações de Entrega
                    </h3>
                    <div className="p-5 bg-neutral-50 rounded-3xl space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Nome</span>
                          <span className="block font-bold text-neutral-900">{selectedOrder.customer.name}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Telefone</span>
                          <span className="block font-bold text-neutral-900">{selectedOrder.customer.phone}</span>
                        </div>
                      </div>

                      {selectedOrder.customer.email && (
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Email</span>
                            <span className="block font-bold text-neutral-900">{selectedOrder.customer.email}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Endereço</span>
                          <span className="block font-bold text-neutral-900">
                            {selectedOrder.customer.address}
                            {selectedOrder.customer.city && `, ${selectedOrder.customer.city}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pagamento</span>
                          <span className="block font-bold text-neutral-900">{selectedOrder.customer.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="sticky bottom-0 bg-white pt-4 border-t border-neutral-100">
                  <div className="p-5 bg-orange-50 rounded-3xl border-2 border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-neutral-900">Total</span>
                      <span className="text-2xl font-black text-orange-600">
                        {selectedOrder.total.toLocaleString()} Kz
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Cancelamento */}
      <AnimatePresence>
        {showCancelConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCancelConfirm(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[90%] max-w-md"
            >
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-neutral-100">
                {/* Ícone */}
                <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" />
                </div>

                {/* Título */}
                <h3 className="text-2xl font-black text-neutral-900 text-center mb-3">
                  Cancelar Pedido?
                </h3>

                {/* Mensagem */}
                <p className="text-neutral-500 text-center font-medium mb-8">
                  Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
                </p>

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl font-black transition-all"
                  >
                    Não, voltar
                  </button>
                  <button
                    onClick={confirmCancelOrder}
                    disabled={cancellingOrder}
                    className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {cancellingOrder ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      'Sim, cancelar'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Edição de Endereço */}
      <AnimatePresence>
        {showAddressModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddressModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[90%] max-w-md"
            >
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-neutral-100">
                {/* Ícone */}
                <div className="w-16 h-16 mx-auto mb-6 bg-orange-50 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>

                {/* Título */}
                <h3 className="text-2xl font-black text-neutral-900 text-center mb-6">
                  Editar Endereço
                </h3>

                {/* Campo de texto */}
                <div className="mb-6">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1 block mb-2">
                    Endereço Completo
                  </label>
                  <textarea
                    value={editingAddress}
                    onChange={(e) => setEditingAddress(e.target.value)}
                    placeholder="Ex: Rua Direita da Samba, Prédio 12, Apartamento 4B, Luanda, Angola"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 px-6 font-medium text-neutral-900 outline-none focus:border-orange-600 transition-colors resize-none"
                    rows={4}
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl font-black transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAddress}
                    disabled={savingAddress || !editingAddress.trim()}
                    className="flex-1 px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savingAddress ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Remoção de Endereço */}
      <AnimatePresence>
        {showRemoveAddressConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowRemoveAddressConfirm(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[90%] max-w-md"
            >
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-neutral-100">
                {/* Ícone */}
                <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" />
                </div>

                {/* Título */}
                <h3 className="text-2xl font-black text-neutral-900 text-center mb-3">
                  Remover Endereço?
                </h3>

                {/* Mensagem */}
                <p className="text-neutral-500 text-center font-medium mb-8">
                  Tem certeza que deseja remover este endereço? Você poderá adicionar um novo depois.
                </p>

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRemoveAddressConfirm(false)}
                    className="flex-1 px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl font-black transition-all"
                  >
                    Não, voltar
                  </button>
                  <button
                    onClick={handleRemoveAddress}
                    disabled={removingAddress}
                    className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {removingAddress ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Removendo...
                      </>
                    ) : (
                      'Sim, remover'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className={`px-6 py-4 rounded-2xl shadow-lg border-2 flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-500 text-green-900'
                : 'bg-red-50 border-red-500 text-red-900'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
              <span className="font-bold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountPage;
