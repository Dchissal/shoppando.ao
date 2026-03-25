import React from 'react';
import { ShoppingBag, ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STORE_NAME } from '../constants';

export default function TermsPage() {
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
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-neutral-900">Termos e Condições</h1>
              <p className="text-neutral-500 font-medium">Última atualização: Março 2024</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-neutral max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">1. Introdução</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Bem-vindo ao {STORE_NAME}. Estes Termos e Condições regem o uso do nosso website e serviços
                de e-commerce. Ao aceder ou utilizar a nossa plataforma, você concorda em cumprir estes termos.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                O {STORE_NAME} é uma plataforma de comércio eletrónico que opera em Angola,
                oferecendo produtos diversos com entrega em todo o território nacional.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">2. Conta de Utilizador</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Para efetuar compras no {STORE_NAME}, é necessário criar uma conta. Você é responsável por:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Manter a confidencialidade das suas credenciais de acesso</li>
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado da sua conta</li>
                <li>Todas as atividades realizadas através da sua conta</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">3. Produtos e Preços</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Todos os preços apresentados estão em Kwanzas Angolanos (Kz) e incluem impostos aplicáveis.
                Reservamo-nos o direito de:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Alterar preços sem aviso prévio</li>
                <li>Limitar quantidades de produtos por encomenda</li>
                <li>Cancelar encomendas em caso de erro de preço evidente</li>
                <li>Descontinuar produtos a qualquer momento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">4. Encomendas e Pagamentos</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Aceitamos os seguintes métodos de pagamento:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Multicaixa Express</li>
                <li>Transferência Bancária</li>
                <li>Pagamento na Entrega (em locais selecionados)</li>
              </ul>
              <p className="text-neutral-600 leading-relaxed mt-4">
                A encomenda só é processada após confirmação do pagamento ou aprovação do método escolhido.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">5. Entregas</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Realizamos entregas em todo o território angolano. Os prazos de entrega variam conforme a localização:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li><strong>Luanda:</strong> 1-3 dias úteis</li>
                <li><strong>Outras províncias:</strong> 5-10 dias úteis</li>
              </ul>
              <p className="text-neutral-600 leading-relaxed mt-4">
                Os custos de entrega são calculados no momento do checkout e variam conforme o destino e peso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">6. Devoluções e Reembolsos</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Você pode solicitar a devolução de produtos nas seguintes condições:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 ml-4">
                <li>Produto com defeito de fabrico</li>
                <li>Produto diferente do encomendado</li>
                <li>Produto danificado durante o transporte</li>
              </ul>
              <p className="text-neutral-600 leading-relaxed mt-4">
                O pedido de devolução deve ser feito em até 7 dias após a receção do produto.
                O reembolso será processado no mesmo método de pagamento utilizado na compra.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">7. Propriedade Intelectual</h2>
              <p className="text-neutral-600 leading-relaxed">
                Todo o conteúdo do website, incluindo textos, imagens, logótipos e design,
                é propriedade do {STORE_NAME} e está protegido por leis de direitos autorais.
                É proibida a reprodução sem autorização prévia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">8. Limitação de Responsabilidade</h2>
              <p className="text-neutral-600 leading-relaxed">
                O {STORE_NAME} não será responsável por danos indiretos, incidentais ou consequenciais
                resultantes do uso ou impossibilidade de uso dos nossos serviços, exceto nos casos
                previstos por lei.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">9. Alterações aos Termos</h2>
              <p className="text-neutral-600 leading-relaxed">
                Reservamo-nos o direito de atualizar estes Termos e Condições a qualquer momento.
                As alterações entram em vigor imediatamente após a publicação no website.
                Recomendamos que reveja esta página periodicamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">10. Contacto</h2>
              <p className="text-neutral-600 leading-relaxed">
                Para questões sobre estes Termos e Condições, contacte-nos através:
              </p>
              <ul className="list-none text-neutral-600 space-y-2 mt-4">
                <li><strong>Email:</strong> suporte@shoppando.ao</li>
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
