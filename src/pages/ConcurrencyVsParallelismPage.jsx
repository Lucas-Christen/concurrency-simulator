import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, Pause, RotateCcw } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const ConcurrencyVsParallelismPage = () => {
  const [mode, setMode] = useState('concurrency'); // 'concurrency' or 'parallelism'
  const [tasks, setTasks] = useState([
    { id: 1, progress: 0, color: '#3B82F6', name: 'Tarefa A' },
    { id: 2, progress: 0, color: '#EF4444', name: 'Tarefa B' },
    { id: 3, progress: 0, color: '#10B981', name: 'Tarefa C' },
  ]);
  const [paused, setPaused] = useState(false);
  const [cores, setCores] = useState(1); // 1 = concorrência, 3 = paralelismo

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setTasks(prev => {
        if (mode === 'concurrency') {
          // Concorrência: 1 core alterna entre tarefas
          const updated = prev.map((task, index) => {
            const increment = index === Math.floor(Date.now() / 300) % 3 ? 2 : 0;
            return {
              ...task,
              progress: Math.min(task.progress + increment, 100)
            };
          });
          return updated;
        } else {
          // Paralelismo: 3 cores, todas progridem juntas
          return prev.map(task => ({
            ...task,
            progress: Math.min(task.progress + 1, 100)
          }));
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [paused, mode]);

  useEffect(() => {
    setCores(mode === 'concurrency' ? 1 : 3);
  }, [mode]);

  const handleReset = () => {
    setTasks(prev => prev.map(task => ({ ...task, progress: 0 })));
  };

  const allComplete = tasks.every(task => task.progress === 100);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Concorrência vs Paralelismo" icon={Zap} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            {/* Seletor de Modo */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => {
                  setMode('concurrency');
                  handleReset();
                }}
                className={`flex-1 p-4 rounded-lg font-bold transition-all ${
                  mode === 'concurrency'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔄 Concorrência
              </button>
              <button
                onClick={() => {
                  setMode('parallelism');
                  handleReset();
                }}
                className={`flex-1 p-4 rounded-lg font-bold transition-all ${
                  mode === 'parallelism'
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⚡ Paralelismo
              </button>
            </div>

            {/* Visualização de Cores */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white font-bold mb-3">
                Núcleos de CPU ({cores} {cores === 1 ? 'núcleo' : 'núcleos'})
              </h3>
              <div className="flex gap-3">
                {Array(cores).fill(0).map((_, index) => (
                  <motion.div
                    key={index}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 0px rgba(255,255,255,0.5)',
                        '0 0 20px rgba(255,255,255,0.8)',
                        '0 0 0px rgba(255,255,255,0.5)'
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex-1 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                  >
                    Core {index + 1}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tarefas */}
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-bold" style={{ color: task.color }}>
                      {task.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {task.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
                    <motion.div
                      animate={{ width: `${task.progress}%` }}
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ backgroundColor: task.color }}
                    >
                      {task.progress > 10 && (
                        <span className="text-white text-xs font-bold">
                          {task.progress}%
                        </span>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {allComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-6 p-4 bg-green-500 text-white rounded-lg text-center font-bold"
              >
                ✅ Todas as tarefas concluídas!
              </motion.div>
            )}

            {/* Explicação Visual */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <h4 className="font-bold mb-2">
                {mode === 'concurrency' ? '🔄 Concorrência' : '⚡ Paralelismo'}
              </h4>
              <p className="text-sm text-gray-700">
                {mode === 'concurrency' 
                  ? 'Um único núcleo alterna rapidamente entre as tarefas, dando a impressão de execução simultânea (time-sharing).'
                  : 'Múltiplos núcleos executam as tarefas verdadeiramente ao mesmo tempo, completando mais rápido.'}
              </p>
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
              <h3 className="font-bold mb-4 text-lg">💡 Conceitos</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 text-sm mb-1">🔄 Concorrência</h4>
                  <p className="text-xs text-gray-700">
                    Múltiplas tarefas progridem <strong>alternadamente</strong> no mesmo período. 
                    Uma CPU alterna entre tarefas tão rápido que parece simultâneo.
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Exemplo:</strong> Um chef preparando 3 pratos ao mesmo tempo, 
                    alternando entre eles.
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-purple-800 text-sm mb-1">⚡ Paralelismo</h4>
                  <p className="text-xs text-gray-700">
                    Múltiplas tarefas executam <strong>literalmente ao mesmo tempo</strong> 
                    em diferentes núcleos/processadores.
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Exemplo:</strong> 3 chefs, cada um preparando um prato diferente 
                    simultaneamente.
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">📊 Comparação</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-semibold">Núcleos Usados:</span>
                  <span>{mode === 'concurrency' ? '1' : '3'}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-semibold">Velocidade:</span>
                  <span>{mode === 'concurrency' ? 'Média' : 'Rápida'}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-semibold">Tipo:</span>
                  <span>{mode === 'concurrency' ? 'Time-sharing' : 'Paralelo'}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">🎯 Na Prática</h3>
              <ul className="text-xs space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span>🔹</span>
                  <span><strong>Concorrência:</strong> Node.js, async/await, event loop</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🔹</span>
                  <span><strong>Paralelismo:</strong> Multi-threading, GPU processing, clusters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🔹</span>
                  <span><strong>Ambos:</strong> Servidores web modernos usam os dois!</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcurrencyVsParallelismPage;