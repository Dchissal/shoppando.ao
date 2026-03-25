import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Facebook, Instagram, Twitter, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { STORE_NAME } from '../../constants';

interface UserProfile {
  uid: string;
  name: string;
  role: 'admin' | 'user';
  photoURL?: string;
}

interface FooterProps {
  userProfile: UserProfile | null;
  setIsWishlistOpen: (open: boolean) => void;
}

export default function Footer({ userProfile, setIsWishlistOpen }: FooterProps) {
  const navigate = useNavigate();

  return (
    <footer className="bg-white pt-16 pb-8 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-orange-600">
                {STORE_NAME.split('.')[0]}<span className="text-neutral-900">.{STORE_NAME.split('.')[1] || 'ao'}</span>
              </span>
            </div>
            <p className="text-neutral-500 mb-6">
              A tua loja online de confiança em Angola. Entregamos em todas as províncias com rapidez e segurança.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-600 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-600 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-600 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Links Úteis</h4>
            <ul className="space-y-4 text-neutral-500">
              <li>
                <button
                  onClick={() => navigate(userProfile ? '/account' : '/login', { state: { redirectTo: '/account' } })}
                  className="hover:text-orange-600 transition-colors"
                >
                  Minha Conta
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(userProfile ? '/account' : '/login', { state: { redirectTo: '/account', section: 'orders' } })}
                  className="hover:text-orange-600 transition-colors"
                >
                  Meus Pedidos
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="hover:text-orange-600 transition-colors flex items-center gap-1"
                >
                  <Heart className="w-4 h-4" />
                  Lista de Desejos
                </button>
              </li>
              <li>
                <Link to="/terms" className="hover:text-orange-600 transition-colors">
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-orange-600 transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Apoio ao Cliente</h4>
            <ul className="space-y-4 text-neutral-500">
              <li>
                <button
                  onClick={() => navigate('/devolucao')}
                  className="hover:text-orange-600 transition-colors text-left"
                >
                  Política de Devolução
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contacto')}
                  className="hover:text-orange-600 transition-colors text-left"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Contactos</h4>
            <ul className="space-y-4 text-neutral-500">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-600" />
                <span>+244 923 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-600" />
                <span>suporte@shoppando.ao</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-600" />
                <span>Luanda, Angola</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p>© 2024 {STORE_NAME}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Pagamentos Aceites:</span>
            <div className="flex gap-2">
              <div className="bg-neutral-100 px-2 py-1 rounded font-bold text-[10px]">MULTICAIXA</div>
              <div className="bg-neutral-100 px-2 py-1 rounded font-bold text-[10px]">VISA</div>
              <div className="bg-neutral-100 px-2 py-1 rounded font-bold text-[10px]">CASH</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}