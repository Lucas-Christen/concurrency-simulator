import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Factory, TrendingUp, TrendingDown, PackagePlus, PackageMinus } from 'lucide-react'; // Ícones atualizados
import Button from '../components/Button';
import Slider from '../components/Slider';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const ProducerConsumerPage = () => {
  const [buffer, setBuffer] = useState([]);
  const [stats, setStats] = useState({ produced: 0, consumed: 0 });
  const [config, setConfig] = useState({ bufferSize: 8 }); // Apenas bufferSize é configurável agora
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // Para mensagens como "Buffer cheio"
  const itemIdRef = useRef(0);

  const showFeedback = (message, type, duration = 1500) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), duration);
  };

  // --- Lógica Manual ---
  const handleProduce = () => {
    if (buffer.length >= config.bufferSize) {
      showFeedback('Buffer Cheio! Não é possível produzir.', 'error');
      return;
    }
    const id = ++itemIdRef.current;
    setStats(s => ({ ...s, produced: s.produced + 1 }));
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    setBuffer(prev => [...prev, {
      id,
      color: colors[id % colors.length] // Mantém a cor aleatória
    }]);
     showFeedback(`Item ${id} produzido!`, 'success');
  };

  const handleConsume = () => {
    if (buffer.length === 0) {
      showFeedback('Buffer Vazio! Não é possível consumir.', 'error');
      return;
    }
    const consumedItem = buffer[0];
    setStats(s => ({ ...s, consumed: s.consumed + 1 }));
    setBuffer(prev => prev.slice(1));
    showFeedback(`Item ${consumedItem.id} consumido!`, 'success');
  };

  // --- Reset ---
  const handleReset = () => {
    setBuffer([]);
    setStats({ produced: 0, consumed: 0 });
    itemIdRef.current = 0;
    setFeedback({ message: '', type: '' });
     showFeedback('Simulação Reiniciada.', 'info');
  };

  // --- Determinar cores de feedback ---
   let feedbackColorClass = '';
   if (feedback.type === 'error') feedbackColorClass = 'bg-red-100 text-red-700 border-red-300';
   if (feedback.type === 'success') feedbackColorClass = 'bg-green-100 text-green-700 border-green-300';
   if (feedback.type === 'info') feedbackColorClass = 'bg-blue-100 text-blue-700 border-blue-300';


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Produtor-Consumidor (Manual)" icon={Factory} />

        <AnimatePresence>
          {feedback.message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-3 rounded border text-center font-semibold ${feedbackColorClass}`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="space-y-8">
              {/* Produtor */}
              <div className="flex items-center gap-4">
                <motion.div
                  // Animação removida ou alterada, já que não é mais baseada em tempo
                  className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl"
                >
                  <Factory size={32} />
                  <span className="text-sm mt-1">Produtor</span>
                </motion.div>
                 <Button
                    onClick={handleProduce}
                    variant="success"
                    icon={PackagePlus}
                    disabled={buffer.length >= config.bufferSize}
                 >
                    Produzir Item
                 </Button>
                <motion.div
                  // Animação pode ser mantida se desejado
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-gray-400"
                >
                  <TrendingUp size={40} />
                </motion.div>
              </div>

              {/* Buffer */}
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-6 border-4 border-gray-500 shadow-inner">
                <h3 className="font-bold mb-4 text-xl text-gray-800">
                  Buffer ({buffer.length}/{config.bufferSize})
                </h3>
                <div className="flex gap-3 flex-wrap min-h-[80px]">
                  <AnimatePresence>
                    {buffer.map(item => (
                      <motion.div
                        key={item.id}
                        layout // Adiciona animação suave ao adicionar/remover
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.id}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {/* Renderiza espaços vazios */}
                  {Array(config.bufferSize - buffer.length).fill(0).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-400 bg-white/50"
                    />
                  ))}
                </div>
                 {/* Mensagens de estado do buffer */}
                 {buffer.length === config.bufferSize && (
                   <p className="mt-4 text-center text-red-600 font-semibold">Buffer Cheio!</p>
                 )}
                 {buffer.length === 0 && (
                   <p className="mt-4 text-center text-blue-600 font-semibold">Buffer Vazio!</p>
                 )}
              </div>

              {/* Consumidor */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-gray-400"
                >
                  <TrendingDown size={40} />
                </motion.div>
                 <Button
                    onClick={handleConsume}
                    variant="warning"
                    icon={PackageMinus}
                    disabled={buffer.length === 0}
                 >
                    Consumir Item
                 </Button>
                <motion.div
                  // Animação removida ou alterada
                  className="w-28 h-28 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl"
                >
                  <Factory size={32} />
                  <span className="text-sm mt-1">Consumidor</span>
                </motion.div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center border-2 border-blue-200"
              >
                <div className="text-sm text-gray-600 font-semibold">Itens Produzidos</div>
                <div className="text-4xl font-bold text-blue-600 mt-2">{stats.produced}</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center border-2 border-green-200"
              >
                <div className="text-sm text-gray-600 font-semibold">Itens Consumidos</div>
                <div className="text-4xl font-bold text-green-600 mt-2">{stats.consumed}</div>
              </motion.div>
            </div>
          </Card>

          {/* Painel Lateral */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold mb-4 text-lg">Controles</h3>
              <div className="space-y-3">
                 {/* Botões de Produzir/Consumir foram movidos para a área principal */}
                <Button
                  onClick={handleReset}
                  variant="secondary"
                  icon={RotateCcw}
                >
                  Reiniciar Simulação
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">Configurações</h3>
              <div className="space-y-4">
                <Slider
                  label="Tamanho do Buffer"
                  value={config.bufferSize}
                  onChange={(v) => {
                     // Ao mudar o tamanho, reinicia para evitar inconsistências
                     handleReset();
                     setConfig(prev => ({ ...prev, bufferSize: Math.floor(v) }));
                  }}
                  min={3}
                  max={15}
                  step={1}
                  unit="" // Remove 's' da unidade
                />
                 {/* Sliders de Taxa removidos */}
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">💡 Conceito</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                O problema <strong>Produtor-Consumidor</strong> demonstra sincronização
                entre processos/threads que produzem dados e aqueles que consomem, usando
                um buffer compartilhado de tamanho fixo.
              </p>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs">
                <strong>Desafios (Buffer Limitado):</strong>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>Produtor deve esperar (ou falhar) se o buffer estiver cheio.</li>
                  <li>Consumidor deve esperar (ou falhar) se o buffer estiver vazio.</li>
                  <li>Acesso ao buffer deve ser seguro (exclusão mútua se concorrente).</li>
                </ul>
              </div>
               <p className="text-sm text-gray-700 leading-relaxed mt-3">
                   Clique nos botões "Produzir" e "Consumir" para observar o comportamento, especialmente quando o buffer está cheio ou vazio.
               </p>
              {/* <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Técnica de Sincronização:</strong> Semáforos (Cheio, Vazio, Mutex) ou Monitores/Condition Variables.
                </p>
              </div> */}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerConsumerPage;