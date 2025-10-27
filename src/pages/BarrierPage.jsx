import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Shield } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const BarrierPage = () => {
  const NUM_THREADS = 3;
  const TRACK_WIDTH = 600;
  const BARRIER_1_X = TRACK_WIDTH * 0.3;
  const BARRIER_2_X = TRACK_WIDTH * 0.6;
  const END_X = TRACK_WIDTH;

  const [threads, setThreads] = useState([
    { id: 1, x: 0, fase: 1, estado: 'Pronto', cor: '#3B82F6', velocidade: 0.8, emMovimento: false },
    { id: 2, x: 0, fase: 1, estado: 'Pronto', cor: '#EF4444', velocidade: 1.2, emMovimento: false },
    { id: 3, x: 0, fase: 1, estado: 'Pronto', cor: '#10B981', velocidade: 1.0, emMovimento: false },
  ]);
  const [barrier1Count, setBarrier1Count] = useState(0);
  const [barrier2Count, setBarrier2Count] = useState(0);
  const [processoIniciado, setProcessoIniciado] = useState(false);
  const [todasCompletas, setTodasCompletas] = useState(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!processoIniciado || todasCompletas) return;

    const animate = () => {
      setThreads(prev => {
        let updatedThreads = prev.map(thread => {
          if (!thread.emMovimento) return thread;

          let newX = thread.x + thread.velocidade;
          let newEstado = thread.estado;
          let newEmMovimento = thread.emMovimento;
          let newFase = thread.fase;

          if (thread.fase === 1 && newX >= BARRIER_1_X) {
            newX = BARRIER_1_X;
            newEmMovimento = false;
            newEstado = 'Esperando Barreira 1';
          } else if (thread.fase === 2 && newX >= BARRIER_2_X) {
            newX = BARRIER_2_X;
            newEmMovimento = false;
            newEstado = 'Esperando Barreira 2';
          } else if (thread.fase === 3 && newX >= END_X) {
            newX = END_X;
            newEmMovimento = false;
            newEstado = 'Completo';
            newFase = 4;
          }

          return { ...thread, x: newX, estado: newEstado, emMovimento: newEmMovimento, fase: newFase };
        });

        const waitingB1 = updatedThreads.filter(t => t.estado === 'Esperando Barreira 1').length;
        const waitingB2 = updatedThreads.filter(t => t.estado === 'Esperando Barreira 2').length;

        setBarrier1Count(waitingB1);
        setBarrier2Count(waitingB2);

        if (waitingB1 === NUM_THREADS) {
          updatedThreads = updatedThreads.map(t => 
            t.estado === 'Esperando Barreira 1'
              ? { ...t, fase: 2, estado: 'Fase 2: Running', emMovimento: true, velocidade: 0.5 + Math.random() * 1.0 }
              : t
          );
          setBarrier1Count(0);
        }

        if (waitingB2 === NUM_THREADS) {
          updatedThreads = updatedThreads.map(t => 
            t.estado === 'Esperando Barreira 2'
              ? { ...t, fase: 3, estado: 'Fase 3: Running', emMovimento: true, velocidade: 0.5 + Math.random() * 1.0 }
              : t
          );
          setBarrier2Count(0);
        }

        if (updatedThreads.every(t => t.fase === 4)) {
          setTodasCompletas(true);
        }

        return updatedThreads;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [processoIniciado, todasCompletas, BARRIER_1_X, BARRIER_2_X, END_X, NUM_THREADS]);

  const handleIniciar = () => {
    setProcessoIniciado(true);
    setThreads(prev => prev.map(t => ({ 
      ...t, 
      emMovimento: true, 
      estado: 'Fase 1: Running' 
    })));
  };

  const handleReiniciar = () => {
    setThreads(prev => prev.map(t => ({ 
      ...t, 
      x: 0, 
      fase: 1, 
      estado: 'Pronto', 
      emMovimento: false,
      velocidade: 0.5 + Math.random() * 1.0
    })));
    setProcessoIniciado(false);
    setTodasCompletas(false);
    setBarrier1Count(0);
    setBarrier2Count(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Sincronização por Barreiras" icon={Shield} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg p-8 shadow-inner" style={{ height: '400px' }}>
              {threads.map((thread, index) => (
                <div
                  key={thread.id}
                  className="absolute h-2 bg-gray-500 rounded shadow-sm"
                  style={{
                    top: `${80 + index * 100}px`,
                    left: '50px',
                    width: `${TRACK_WIDTH}px`
                  }}
                ></div>
              ))}

              <div
                className="absolute bg-yellow-400 rounded shadow-lg"
                style={{
                  left: `${50 + BARRIER_1_X}px`,
                  top: '50px',
                  width: '8px',
                  height: '320px'
                }}
              >
                <div className="absolute -top-8 -left-16 text-yellow-600 font-bold text-sm whitespace-nowrap">
                  BARREIRA 1
                </div>
                <div className="absolute -bottom-6 -left-12 text-gray-700 text-xs font-semibold">
                  {barrier1Count}/{NUM_THREADS}
                </div>
              </div>

              <div
                className="absolute bg-purple-500 rounded shadow-lg"
                style={{
                  left: `${50 + BARRIER_2_X}px`,
                  top: '50px',
                  width: '8px',
                  height: '320px'
                }}
              >
                <div className="absolute -top-8 -left-16 text-purple-600 font-bold text-sm whitespace-nowrap">
                  BARREIRA 2
                </div>
                <div className="absolute -bottom-6 -left-12 text-gray-700 text-xs font-semibold">
                  {barrier2Count}/{NUM_THREADS}
                </div>
              </div>

              <div
                className="absolute bg-green-500 rounded shadow-lg"
                style={{
                  left: `${50 + END_X}px`,
                  top: '50px',
                  width: '8px',
                  height: '320px'
                }}
              >
                <div className="absolute -top-8 -left-8 text-green-600 font-bold text-sm">
                  FIM
                </div>
              </div>

              {threads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  animate={{ x: thread.x }}
                  className="absolute w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-white font-bold shadow-xl"
                  style={{
                    backgroundColor: thread.cor,
                    top: `${70 + index * 100}px`,
                    left: '45px'
                  }}
                >
                  T{thread.id}
                </motion.div>
              ))}

              {threads.map((thread, index) => (
                <div
                  key={`label-${thread.id}`}
                  className="absolute text-gray-800 text-sm font-semibold"
                  style={{
                    top: `${95 + index * 100}px`,
                    left: '10px'
                  }}
                >
                  <div className="font-bold">T{thread.id}</div>
                  <div className="text-xs text-gray-600">v: {thread.velocidade.toFixed(1)}</div>
                  <div className="text-xs text-gray-700">{thread.estado}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              {!processoIniciado && !todasCompletas && (
                <Button onClick={handleIniciar} variant="success" icon={Play}>
                  Iniciar Simulação
                </Button>
              )}
              {todasCompletas && (
                <Button onClick={handleReiniciar} variant="primary" icon={RotateCcw}>
                  Reiniciar
                </Button>
              )}
            </div>

            {todasCompletas && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-4 p-4 bg-green-500 text-white rounded-lg text-center font-bold text-xl shadow-lg"
              >
                ✅ Todas as threads completaram!
              </motion.div>
            )}
          </Card>

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold mb-4 text-lg">💡 Conceito: Barreira</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p className="leading-relaxed">
                  <strong className="text-purple-600">Barreira (Barrier)</strong> é um ponto 
                  de sincronização onde threads devem esperar umas pelas outras antes de continuar.
                </p>
                
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <strong className="text-purple-700">Como funciona:</strong>
                  <ul className="list-disc ml-4 mt-2 space-y-1 text-gray-700">
                    <li>Thread chega na barreira e espera</li>
                    <li>Quando TODAS chegam → libera todas</li>
                    <li>Threads continuam para próxima fase</li>
                    <li>Velocidades aleatórias a cada fase</li>
                  </ul>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <strong className="text-yellow-700">Aplicações:</strong>
                  <ul className="list-disc ml-4 mt-1 space-y-1 text-gray-700">
                    <li>Computação paralela (iterações)</li>
                    <li>Algoritmos distribuídos</li>
                    <li>Sincronização de fases</li>
                  </ul>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <strong className="text-blue-700">Técnicas:</strong>
                  <p className="mt-1 text-gray-700">pthread_barrier, threading.Barrier(n)</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">📊 Status das Barreiras</h3>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-yellow-700">Barreira 1</span>
                    <span className="text-yellow-600">{barrier1Count}/{NUM_THREADS}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-4">
                    <motion.div
                      animate={{ width: `${(barrier1Count / NUM_THREADS) * 100}%` }}
                      className="bg-yellow-400 h-4 rounded-full shadow-sm"
                    />
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-purple-700">Barreira 2</span>
                    <span className="text-purple-600">{barrier2Count}/{NUM_THREADS}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-4">
                    <motion.div
                      animate={{ width: `${(barrier2Count / NUM_THREADS) * 100}%` }}
                      className="bg-purple-500 h-4 rounded-full shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">🎯 Fases da Simulação</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                  <span>Fase 1: Até Barreira 1</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-800">⏸</div>
                  <span>Espera em Barreira 1</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                  <span>Fase 2: Até Barreira 2</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-200">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">⏸</div>
                  <span>Espera em Barreira 2</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                  <span>Fase 3: Até o Fim</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded border border-gray-300">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white">✓</div>
                  <span>Completo</span>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gray-800">
              <h3 className="font-bold mb-4 text-lg text-white">⚙️ Características</h3>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="p-2 bg-gray-700 rounded">
                  <strong>🎲 Velocidades Aleatórias:</strong>
                  <p className="mt-1">Cada thread tem velocidade diferente, renovada a cada fase</p>
                </div>
                <div className="p-2 bg-gray-700 rounded">
                  <strong>🔄 Sincronização:</strong>
                  <p className="mt-1">Threads rápidas esperam pelas lentas em cada barreira</p>
                </div>
                <div className="p-2 bg-gray-700 rounded">
                  <strong>📍 Progresso Visual:</strong>
                  <p className="mt-1">Contador mostra quantas threads chegaram em cada barreira</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800">
              <h3 className="font-bold mb-4 text-lg text-white">🔬 Observações</h3>
              <div className="text-xs text-gray-300 space-y-2">
                <p>
                  • Note como threads mais rápidas <strong className="text-blue-400">param e esperam</strong> nas barreiras
                </p>
                <p>
                  • Quando a última thread chega, <strong className="text-green-400">todas são liberadas simultaneamente</strong>
                </p>
                <p>
                  • As velocidades mudam a cada fase, simulando <strong className="text-yellow-400">trabalho de duração variável</strong>
                </p>
                <p>
                  • Este padrão é comum em <strong className="text-purple-400">loops paralelos</strong> onde cada iteração precisa terminar antes da próxima começar
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarrierPage;