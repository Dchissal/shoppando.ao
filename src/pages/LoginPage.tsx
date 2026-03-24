import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Lock, Mail, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { STORE_NAME } from '../constants';

export default function LoginPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;

    // Check if identifier is email or phone
    let email = identifier;
    if (!identifier.includes('@')) {
      // Assume it's a phone number and use the fallback format
      email = `${identifier.replace(/\s+/g, '')}@${STORE_NAME.toLowerCase()}`;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      console.error("Login error:", err);
      setError("E-mail ou palavra-passe incorretos.");
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
          src="/Assets/imagens/loja_aberta.avif" 
          alt="Shopping Experience" 
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
              A tua próxima <br />
              <span className="text-orange-400">grande compra</span> <br />
              começa aqui.
            </h2>
            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Junta-te a milhares de angolanos que já aproveitam as melhores ofertas e entregas rápidas em todo o país.
            </p>
          </motion.div>

          <div className="flex items-center gap-4 text-white/60 text-xs font-medium">
            <span>© 2024 {STORE_NAME}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Feito com ❤️ em Angola</span>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 bg-neutral-50 lg:bg-white overflow-y-auto">
        <motion.div 
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          animate={isMobile ? false : { opacity: 1, y: 0 }}
          className="max-w-md w-full py-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="bg-orange-600 p-2 rounded-xl mb-3 shadow-lg shadow-orange-200">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-neutral-900 tracking-tight">shoppando.ao</h1>
          </div>

          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-orange-600 transition-colors mb-4 font-bold text-xs">
              <ArrowLeft className="w-3 h-3" /> Voltar para a loja
            </Link>
            <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tighter">Bem-vindo!</h1>
            <p className="text-neutral-500 text-base">
              Entra na tua conta para continuar a poupar.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 ml-1 uppercase tracking-wider">E-mail ou Telefone</label>
              <div className="relative group">
                <input 
                  name="identifier"
                  type="text" 
                  placeholder="Ex: +244 923 000 000"
                  className="w-full px-5 py-3.5 bg-neutral-100 lg:bg-neutral-50 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white transition-all outline-none text-neutral-900 text-sm font-medium"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">Palavra-passe</label>
                <a href="#" className="text-[10px] text-orange-600 font-bold hover:underline">Esqueceste a senha?</a>
              </div>
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-neutral-100 lg:bg-neutral-50 border-2 border-transparent rounded-xl focus:border-orange-500 focus:bg-white transition-all outline-none text-neutral-900 text-sm font-medium"
                required
              />
            </div>
            
            <div className="flex items-center gap-3 ml-1 py-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 cursor-pointer" />
              <label htmlFor="remember" className="text-xs text-neutral-600 font-medium cursor-pointer">Manter sessão iniciada</label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-600 text-white font-black text-base rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A entrar...
                </>
              ) : (
                'Entrar na Conta'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-neutral-500 text-sm font-medium">
              Ainda não tens conta? 
              <Link to="/register" className="text-orange-600 font-bold hover:underline ml-1">Cria uma agora</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
