import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Instagram,
  Facebook,
  Loader2
} from 'lucide-react';
import { STORE_NAME } from '../constants';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de envio (aqui podes integrar com um serviço de email)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    setSuccess(true);

    // Reset após 3 segundos
    setTimeout(() => {
      setSuccess(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <MessageSquare className="w-4 h-4" />
            Contacto
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
            Estamos Aqui Para Ajudar
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Tens alguma questão, sugestão ou precisas de ajuda? Entra em contacto connosco!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações de Contacto */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Email</h3>
              <a
                href="mailto:suporte@shoppando.ao"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                suporte@shoppando.ao
              </a>
              <p className="text-sm text-neutral-500 mt-2">
                Resposta em até 24 horas
              </p>
            </div>

            {/* Telefone */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Telefone</h3>
              <a
                href="tel:+244923456789"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                +244 923 456 789
              </a>
              <p className="text-sm text-neutral-500 mt-2">
                Segunda a Sexta: 8h - 18h
              </p>
            </div>

            {/* Localização */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Escritório</h3>
              <p className="text-neutral-700">
                Rua dos Coqueiros, Nº 123<br />
                Luanda, Angola
              </p>
            </div>

            {/* Horário */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Horário</h3>
              <div className="space-y-1 text-sm text-neutral-700">
                <p><strong>Segunda - Sexta:</strong> 8h - 18h</p>
                <p><strong>Sábado:</strong> 9h - 14h</p>
                <p><strong>Domingo:</strong> Fechado</p>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Redes Sociais</h3>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-orange-100 hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-5 h-5 text-orange-600" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-orange-100 hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-5 h-5 text-orange-600" />
                </a>
              </div>
            </div>
          </div>

          {/* Formulário de Contacto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Envia-nos uma Mensagem
              </h2>

              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-neutral-600">
                    Recebemos a tua mensagem. Entraremos em contacto em breve!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-neutral-900 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="O teu nome"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-neutral-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>

                  {/* Assunto */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-neutral-900 mb-2">
                      Assunto
                    </label>
                    <select
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="">Seleciona um assunto</option>
                      <option value="pedido">Dúvida sobre Pedido</option>
                      <option value="produto">Informações sobre Produto</option>
                      <option value="devolucao">Devolução ou Troca</option>
                      <option value="pagamento">Pagamento</option>
                      <option value="sugestao">Sugestão</option>
                      <option value="reclamacao">Reclamação</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-neutral-900 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                      placeholder="Escreve a tua mensagem aqui..."
                    />
                  </div>

                  {/* Botão Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        A enviar...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar Mensagem
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Rápido */}
            <div className="mt-8 bg-orange-50 rounded-2xl p-8 border border-orange-100">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">
                Perguntas Frequentes
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1">
                    Quanto tempo demora a entrega?
                  </h4>
                  <p className="text-sm text-neutral-700">
                    O prazo de entrega varia entre 2 a 5 dias úteis em Luanda e até 10 dias úteis
                    para outras províncias.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1">
                    Posso devolver um produto?
                  </h4>
                  <p className="text-sm text-neutral-700">
                    Sim! Tens até 30 dias após a receção para devolver produtos. Consulta a nossa{' '}
                    <Link to="/devolucao" className="text-orange-600 hover:underline font-bold">
                      Política de Devolução
                    </Link>
                    .
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1">
                    Quais os métodos de pagamento aceites?
                  </h4>
                  <p className="text-sm text-neutral-700">
                    Aceitamos Multicaixa, Transferência Bancária, e pagamento na entrega em Luanda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
