import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Camera, User, Phone, Mail, MapPin, Lock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { STORE_NAME } from '../constants';

export default function RegisterPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const name = data.get('name') as string;
    const phone = data.get('phone') as string;
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirmPassword') as string;
    const address = data.get('address') as string;

    if (!email) {
      setError("O e-mail é obrigatório.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As palavras-passe não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || "Erro ao enviar código.");
      }

      setFormData({ name, phone, email, password, address });
      setOtpStep(true);
    } catch (err: any) {
      console.error("OTP send error:", err);
      setError(err.message || "Erro ao enviar código de verificação.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Verify OTP via Server API
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpCode }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyResult.error || "Código inválido.");
      }

      // 2. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      let photoURL = '';
      // 3. Upload Photo if exists
      if (profileFile) {
        const storageRef = ref(storage, `profiles/${user.uid}`);
        await uploadBytes(storageRef, profileFile);
        photoURL = await getDownloadURL(storageRef);
      }

      // 4. Save to Firestore
      const isAdminEmail = formData.email.toLowerCase() === 'reciadodaniel@gmail.com';
      const userDocPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          photoURL,
          role: isAdminEmail ? 'admin' : 'user',
          createdAt: serverTimestamp()
        });
      } catch (firestoreErr: any) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, userDocPath);
      }

      navigate('/');
    } catch (err: any) {
      console.error("OTP verification error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está associado a outra conta.");
      } else {
        setError(err.message || "Erro ao verificar código. Tenta novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex font-sans overflow-hidden">
      {/* Left Side: Image & Text (Hidden on Mobile/Tablet) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-900">
        <motion.img 
          initial={isMobile ? false : { scale: 1.1, opacity: 0 }}
          animate={isMobile ? false : { scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5 }}
          src="/Assets/imagens/sacolas.avif" 
          alt="Shopping Community" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/40 to-neutral-900/80" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2 text-white group">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl group-hover:bg-orange-600 transition-all">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">{STORE_NAME.toLowerCase()}</span>
          </Link>

          <motion.div
            initial={isMobile ? false : { opacity: 0, x: -30 }}
            animate={isMobile ? false : { opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-5xl font-black text-white leading-tight mb-4 tracking-tighter">
              Faz parte da <br />
              <span className="text-orange-400">nossa família.</span> <br />
              Cria a tua conta.
            </h2>
            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Acede a promoções exclusivas, gere as tuas encomendas e recebe tudo no conforto da tua casa.
            </p>
          </motion.div>

          <div className="flex items-center gap-4 text-white/60 text-xs font-medium">
            <span>© 2024 {STORE_NAME}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Segurança garantida</span>
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 bg-neutral-50 lg:bg-white overflow-y-auto">
        <motion.div 
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          animate={isMobile ? false : { opacity: 1, y: 0 }}
          className="max-w-md w-full py-4"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="bg-orange-600 p-2 rounded-xl mb-3 shadow-lg shadow-orange-200">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-neutral-900 tracking-tight">shoppando.ao</h1>
          </div>

          <div className="mb-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-neutral-400 hover:text-orange-600 transition-colors mb-4 font-bold text-xs">
              <ArrowLeft className="w-3 h-3" /> Já tenho conta
            </Link>
            <h1 className="text-3xl font-black text-neutral-900 mb-1 tracking-tighter">Criar Conta</h1>
            <p className="text-neutral-500 text-sm">
              Preenche os teus dados para começar.
            </p>
          </div>


          {!otpStep ? (
            <form className="space-y-4" onSubmit={handleRegister}>
              {/* Profile Picture Upload */}
              <div className="flex items-center gap-6 mb-6 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-neutral-200 overflow-hidden border-2 border-white shadow-md flex items-center justify-center">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-neutral-400" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 bg-orange-600 p-2 rounded-xl text-white shadow-lg cursor-pointer hover:bg-orange-700 transition-all active:scale-90">
                    <Camera className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">Foto de Perfil</span>
                  <p className="text-[10px] text-neutral-500 font-medium">Opcional. Formatos: JPG, PNG.</p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 ml-1 uppercase tracking-wider">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      name="name"
                      type="text" 
                      placeholder="Ex: Daniel Reciado"
                      className="w-full pl-11 pr-4 py-3 bg-neutral-100 lg:bg-neutral-50 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white transition-all outline-none text-neutral-900 text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-700 ml-1 uppercase tracking-wider">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input 
                        name="phone"
                        type="tel" 
                        placeholder="+244..."
                        className="w-full pl-11 pr-4 py-3 bg-neutral-100 lg:bg-neutral-50 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white transition-all outline-none text-neutral-900 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-700 ml-1 uppercase tracking-wider">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input 
                        name="email"
                        type="email" 
                        placeholder="daniel@..."
                        className="w-full pl-11 pr-4 py-3 bg-neutral-100 lg:bg-neutral-50 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white transition-all outline-none text-neutral-900 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-700 ml-1 uppercase tracking-wider">Palavra-passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input 
                        name="password"
                        type="password" 
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-neutral-100 lg:bg-neutral-50 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white transition-all outline-none text-neutral-900 text-sm font-medium"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-700 ml-1 uppercase tracking-wider">Confirmar Palavra-passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input 
                        name="confirmPassword"
                        type="password" 
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-neutral-100 lg:bg-neutral-50 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white transition-all outline-none text-neutral-900 text-sm font-medium"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 ml-1 uppercase tracking-wider">Endereço de Morada</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3 w-4 h-4 text-neutral-400" />
                    <textarea 
                      name="address"
                      placeholder="Ex: Rua Direita da Samba, Luanda"
                      rows={2}
                      className="w-full pl-11 pr-4 py-3 bg-neutral-100 lg:bg-neutral-50 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white transition-all outline-none text-neutral-900 text-sm font-medium resize-none"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Terms and Policy */}
              <div className="flex items-start gap-3 ml-1 py-1">
                <input type="checkbox" id="terms" className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 cursor-pointer" required />
                <label htmlFor="terms" className="text-[11px] text-neutral-600 font-medium cursor-pointer leading-tight">
                  Li e aceito os <a href="#" className="text-orange-600 font-bold hover:underline">Termos</a> e a <a href="#" className="text-orange-600 font-bold hover:underline">Política de Privacidade</a>
                </label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-600 text-white font-black text-base rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    A processar...
                  </>
                ) : (
                  'Criar Minha Conta'
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div className="text-center">
                <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-xl font-black text-neutral-900 mb-2">Verifica o teu E-mail</h2>
                <p className="text-neutral-500 text-sm">
                  Enviamos um código para <span className="font-bold text-neutral-900">{formData?.email}</span>.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 ml-1 uppercase tracking-wider text-center">Código de 6 dígitos</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-neutral-100 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white transition-all outline-none text-neutral-900"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-4 bg-orange-600 text-white font-black text-base rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    A verificar...
                  </>
                ) : (
                  'Verificar e Criar Conta'
                )}
              </button>

              <button 
                type="button"
                onClick={() => setOtpStep(false)}
                className="w-full text-neutral-400 font-bold text-sm hover:text-neutral-600 transition-colors"
              >
                Voltar para o formulário
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
            <p className="text-neutral-500 text-sm font-medium">
              Já fazes parte da família? 
              <Link to="/login" className="text-orange-600 font-bold hover:underline ml-1">Inicia sessão</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
