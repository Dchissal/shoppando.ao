import React from 'react';
import { ShoppingBag, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STORE_NAME } from '../constants';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-orange-600">
              {STORE_NAME.split('.')[0]}
              <span className="text-neutral-900">.{STORE_NAME.split('.')[1] || 'ao'}</span>
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-neutral-600 hover:text-orange-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-100">
          {/* Title */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-100">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-neutral-900">Política de Privacidade</h1>
              <p className="text-neutral-500 font-medium">Última atualização: Março 2024</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-neutral max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">1. Introdução</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                O {STORE_NAME} está comprometido em proteger a sua privacidade. Esta Política de Privacidade
                explica como recolhemos, usamos, armazenamos e protegemos as suas informações pessoais
                quando utiliza os nossos serviços.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Ao utilizar o nosso website, você consente com a recolha e uso das suas informações
                conforme descrito nesta política.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">2. Informações que Recolhemos</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Podemos recolher os seguintes tipos de informações:
              </p>

              <h3 className="text-lg font-bold text-neutral-800 mt-6 mb-3">2.1 Informações Fornecidas por Si</h3>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Nome completo</li>
                <li>Endereço de email</li>
                <li>Número de telefone</li>
                <li>Endereço de entrega</li>
                <li>Informações de pagamento</li>
              </ul>

              <h3 className="text-lg font-bold text-neutral-800 mt-6 mb-3">2.2 Informações Recolhidas Automaticamente</h3>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Endereço IP</li>
                <li>Tipo de navegador e dispositivo</li>
                <li>Páginas visitadas e tempo de permanência</li>
                <li>Cookies e tecnologias similares</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">3. Como Usamos as Suas Informações</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Utilizamos as suas informações para:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Processar e entregar as suas encomendas</li>
                <li>Comunicar sobre o estado das encomendas</li>
                <li>Fornecer suporte ao cliente</li>
                <li>Enviar promoções e novidades (com o seu consentimento)</li>
                <li>Melhorar os nossos serviços e experiência do utilizador</li>
                <li>Prevenir fraudes e garantir a segurança</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">4. Partilha de Informações</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Não vendemos as suas informações pessoais. Podemos partilhar dados com:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li><strong>Parceiros de entrega:</strong> para efetuar a entrega das suas encomendas</li>
                <li><strong>Processadores de pagamento:</strong> para processar transações de forma segura</li>
                <li><strong>Prestadores de serviços:</strong> que nos ajudam a operar o website</li>
                <li><strong>Autoridades:</strong> quando exigido por lei</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">5. Cookies</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Utilizamos cookies para melhorar a sua experiência. Os cookies são pequenos ficheiros
                armazenados no seu dispositivo que nos ajudam a:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Lembrar as suas preferências</li>
                <li>Manter a sua sessão ativa</li>
                <li>Analisar o uso do website</li>
                <li>Personalizar conteúdo e anúncios</li>
              </ul>
              <p className="text-neutral-600 leading-relaxed mt-4">
                Pode configurar o seu navegador para recusar cookies, mas isso pode afetar
                a funcionalidade do website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">6. Segurança dos Dados</h2>
              <p className="text-neutral-600 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger
                as suas informações, incluindo:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4 mt-4">
                <li>Encriptação SSL/TLS para transmissão de dados</li>
                <li>Acesso restrito a informações pessoais</li>
                <li>Monitorização regular de sistemas</li>
                <li>Backups seguros de dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">7. Os Seus Direitos</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Você tem direito a:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li><strong>Acesso:</strong> solicitar uma cópia dos seus dados pessoais</li>
                <li><strong>Retificação:</strong> corrigir informações incorretas</li>
                <li><strong>Eliminação:</strong> solicitar a eliminação dos seus dados</li>
                <li><strong>Oposição:</strong> opor-se ao processamento para marketing</li>
                <li><strong>Portabilidade:</strong> receber os seus dados em formato estruturado</li>
              </ul>
              <p className="text-neutral-600 leading-relaxed mt-4">
                Para exercer estes direitos, contacte-nos através do email indicado abaixo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">8. Retenção de Dados</h2>
              <p className="text-neutral-600 leading-relaxed">
                Mantemos as suas informações pelo tempo necessário para cumprir as finalidades
                descritas nesta política, a menos que um período de retenção mais longo seja
                exigido por lei. Dados de transações são mantidos por um período mínimo de 5 anos
                para fins fiscais e legais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">9. Menores de Idade</h2>
              <p className="text-neutral-600 leading-relaxed">
                Os nossos serviços não são direcionados a menores de 18 anos. Não recolhemos
                intencionalmente informações de menores. Se tomarmos conhecimento de que
                recolhemos dados de um menor, tomaremos medidas para eliminar essas informações.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">10. Alterações a Esta Política</h2>
              <p className="text-neutral-600 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Quaisquer alterações
                serão publicadas nesta página com a data de atualização. Recomendamos que reveja
                esta política regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">11. Contacto</h2>
              <p className="text-neutral-600 leading-relaxed">
                Para questões sobre esta Política de Privacidade ou sobre os seus dados pessoais,
                contacte o nosso Encarregado de Proteção de Dados:
              </p>
              <ul className="list-none text-neutral-600 space-y-2 mt-4">
                <li><strong>Email:</strong> privacidade@shoppando.ao</li>
                <li><strong>Telefone:</strong> +244 923 000 000</li>
                <li><strong>Endereço:</strong> Luanda, Angola</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
