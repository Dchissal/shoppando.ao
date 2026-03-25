import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { STORE_NAME } from '../constants';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Voltar</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 md:p-12">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Package className="w-4 h-4" />
              Política de Devolução
            </div>
            <h1 className="text-4xl font-black text-neutral-900 mb-4">
              Política de Devolução e Reembolso
            </h1>
            <p className="text-neutral-600">
              Última atualização: {new Date().toLocaleDateString('pt-AO')}
            </p>
          </div>

          <div className="prose prose-neutral max-w-none">
            {/* Introdução */}
            <section className="mb-8">
              <p className="text-neutral-700 leading-relaxed">
                No {STORE_NAME}, a tua satisfação é a nossa prioridade. Se não estiveres completamente
                satisfeito com a tua compra, estamos aqui para ajudar. Lê atentamente a nossa política
                de devolução e reembolso.
              </p>
            </section>

            {/* Prazo de Devolução */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-3">Prazo de Devolução</h2>
                  <p className="text-neutral-700 leading-relaxed mb-3">
                    Tens até <strong>30 dias</strong> após a receção do produto para solicitar a devolução.
                    O produto deve estar nas condições originais, sem uso, com etiquetas e embalagem intactas.
                  </p>
                  <p className="text-neutral-700 leading-relaxed">
                    Para iniciar o processo de devolução, contacta-nos através do email ou telefone
                    disponíveis na página de Contacto.
                  </p>
                </div>
              </div>
            </section>

            {/* Produtos Elegíveis */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-3">Produtos Elegíveis para Devolução</h2>
                  <ul className="space-y-2 text-neutral-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Produtos com defeito de fabrico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Produtos danificados durante o transporte</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Produtos diferentes do que foi encomendado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Produtos não utilizados, com embalagem original intacta</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Produtos Não Elegíveis */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-3">Produtos Não Elegíveis</h2>
                  <ul className="space-y-2 text-neutral-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Produtos de higiene pessoal (cosméticos abertos, perfumes, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Roupa íntima e fatos de banho</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Produtos alimentares perecíveis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Produtos personalizados ou feitos por encomenda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Software e conteúdo digital descarregado</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Processo de Devolução */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-3">Como Devolver um Produto</h2>
                  <ol className="space-y-3 text-neutral-700">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-orange-600 flex-shrink-0">1.</span>
                      <span>Contacta o nosso suporte através da página de Contacto ou email</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-orange-600 flex-shrink-0">2.</span>
                      <span>Indica o número do pedido e o motivo da devolução</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-orange-600 flex-shrink-0">3.</span>
                      <span>Recebe as instruções para envio do produto</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-orange-600 flex-shrink-0">4.</span>
                      <span>Envia o produto na embalagem original com todos os acessórios</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-orange-600 flex-shrink-0">5.</span>
                      <span>Após a receção e inspeção, processamos o reembolso em até 7 dias úteis</span>
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Reembolsos */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Reembolsos</h2>
              <p className="text-neutral-700 leading-relaxed mb-3">
                Após recebermos e inspecionarmos a devolução, enviaremos um email confirmando a receção.
                O reembolso será processado no mesmo método de pagamento utilizado na compra.
              </p>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                <p className="text-neutral-700 leading-relaxed">
                  <strong>Nota:</strong> O prazo para o reembolso aparecer na tua conta pode variar
                  de 5 a 10 dias úteis, dependendo da instituição bancária.
                </p>
              </div>
            </section>

            {/* Trocas */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Trocas</h2>
              <p className="text-neutral-700 leading-relaxed mb-3">
                Se desejas trocar um produto por tamanho, cor ou modelo diferente, contacta-nos.
                Verificamos a disponibilidade e fornecemos instruções para a troca.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                As trocas estão sujeitas à disponibilidade de stock. Se o produto desejado não
                estiver disponível, processamos o reembolso total.
              </p>
            </section>

            {/* Custos de Envio */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Custos de Envio</h2>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>
                    <strong>Produto com defeito ou erro nosso:</strong> Assumimos todos os custos de envio
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>
                    <strong>Desistência ou troca por preferência:</strong> Os custos de envio são da
                    responsabilidade do cliente
                  </span>
                </li>
              </ul>
            </section>

            {/* Contacto */}
            <section className="mb-8">
              <div className="bg-neutral-100 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">Precisas de Ajuda?</h2>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Se tens dúvidas sobre a nossa política de devolução ou precisas de assistência
                  com a tua devolução, não hesites em contactar-nos.
                </p>
                <Link
                  to="/contacto"
                  className="inline-block px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Contactar Suporte
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
