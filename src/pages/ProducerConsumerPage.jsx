import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Factory, TrendingUp, TrendingDown } from 'lucide-react';
import Button from '../components/Button';
import Slider from '../components/Slider';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const ProducerConsumerPage = () => {
  const [buffer, setBuffer] = useState([]);
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({ produced: 0, consumed: 0 });
  const [config, setConfig] = useState({
    bufferSize: 8,
    produceRate: 1,
    consumeRate: 1.5
  });
  const itemIdRef = useRef(0);

  useEffect(() => {
    if (paused) return;

    // Producer
    const producerInterval = setInterval(() => {
      setBuffer(prev => {
        if (prev.length >= config.bufferSize) return prev;
        const id = ++itemIdRef.current;
        setStats(s => ({ ...s, produced: s.produced + 1 }));
        const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
        return [...prev, { 
          id, 
          color: colors[Math.floor(Math.random() * colors.length)]
        }];
      });
    }, config.produceRate * 1000);

    // Consumer
    const consumerInterval = setInterval(() => {
      setBuffer(prev => {
        if (prev.length === 0) return prev;
        setStats(s => ({ ...s, consumed: s.consumed + 1 }));
        return prev.slice(1);
      });
    }, config.consumeRate * 1000);

    return () => {
      clearInterval(producerInterval);
      clearInterval(consumerInterval);
    };
  }, [paused, config]);

  const handleReset = () => {
    setBuffer([]);
    setStats({ produced: 0, consumed: 0 });
    itemIdRef.current = 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Produtor-Consumidor" icon={Factory} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="space-y-8">
              {/* Produtor */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: config.produceRate }}
                  className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl"
                >
                  <Factory size={32} />
                  <span className="text-sm mt-1">Produtor</span>
                </motion.div>
                <motion.div
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
                        initial={{ scale: 0, x: -50, opacity: 0 }}
                        animate={{ scale: 1, x: 0, opacity: 1 }}
                        exit={{ scale: 0, x: 50, opacity: 0 }}
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.id}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {Array(config.bufferSize - buffer.length).fill(0).map((_, i) => (
                    <div 
                      key={`empty-${i}`} 
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-400 bg-white/50" 
                    />
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <span>↓ Produzindo a cada {config.produceRate}s</span>
                  <span>Consumindo a cada {config.consumeRate}s ↓</span>
                </div>
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
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: config.consumeRate }}
                  className="w-28 h-28 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl"
                >
                  <Factory size={32} />
                  <span className="text-sm mt-1">Consumidor</span>
                </motion.div>
              </div>
            </div>

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

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold mb-4 text-lg">Controles</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setPaused(!paused)}
                  variant={paused ? 'success' : 'warning'}
                  icon={paused ? Play : Pause}
                >
                  {paused ? 'Retomar' : 'Pausar'}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="secondary"
                  icon={RotateCcw}
                >
                  Reiniciar
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">Configurações</h3>
              <div className="space-y-4">
                <Slider
                  label="Tamanho do Buffer"
                  value={config.bufferSize}
                  onChange={(v) => setConfig(prev => ({ ...prev, bufferSize: Math.floor(v) }))}
                  min={3}
                  max={15}
                  step={1}
                />
                <Slider
                  label="Taxa de Produção"
                  value={config.produceRate}
                  onChange={(v) => setConfig(prev => ({ ...prev, produceRate: v }))}
                  min={0.3}
                  max={5}
                />
                <Slider
                  label="Taxa de Consumo"
                  value={config.consumeRate}
                  onChange={(v) => setConfig(prev => ({ ...prev, consumeRate: v }))}
                  min={0.3}
                  max={5}
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">💡 Conceito</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                O problema <strong>Produtor-Consumidor</strong> demonstra sincronização 
                entre threads que produzem dados e threads que consomem dados através 
                de um buffer compartilhado de tamanho fixo.
              </p>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs">
                <strong>Desafios:</strong>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>Produtor deve esperar se buffer estiver cheio</li>
                  <li>Consumidor deve esperar se buffer estiver vazio</li>
                  <li>Acesso ao buffer deve ser thread-safe</li>
                </ul>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Técnica:</strong> Semáforos ou Condition Variables
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerConsumerPage;