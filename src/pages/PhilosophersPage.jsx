import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const PhilosophersPage = () => {
  const [philosophers, setPhilosophers] = useState([
    { id: 0, state: 'THINKING', color: '#3B82F6', name: 'Sócrates' },
    { id: 1, state: 'THINKING', color: '#EF4444', name: 'Platão' },
    { id: 2, state: 'THINKING', color: '#10B981', name: 'Aristóteles' },
    { id: 3, state: 'THINKING', color: '#F59E0B', name: 'Descartes' },
    { id: 4, state: 'THINKING', color: '#8B5CF6', name: 'Kant' },
  ]);
  const [forks, setForks] = useState([true, true, true, true, true]); // true = disponível
  const [paused, setPaused] = useState(false);
  const [deadlockPrevention, setDeadlockPrevention] = useState(true);
  const [stats, setStats] = useState({ meals: 0, deadlocks: 0 });

  useEffect(() => {
    if (paused) return;

    const philosopherCycle = (id) => {
      const leftFork = id;
      const rightFork = (id + 1) % 5;

      // THINKING
      setPhilosophers(prev => {
        const updated = [...prev];
        updated[id].state = 'THINKING';
        return updated;
      });

      setTimeout(() => {
        // Tentar pegar garfos
        setForks(prevForks => {
          const newForks = [...prevForks];
          
          if (deadlockPrevention && id === 4) {
            // Último filósofo pega na ordem inversa (previne deadlock)
            if (newForks[rightFork] && newForks[leftFork]) {
              newForks[rightFork] = false;
              newForks[leftFork] = false;
              
              setPhilosophers(prev => {
                const updated = [...prev];
                updated[id].state = 'EATING';
                return updated;
              });

              // EATING
              setTimeout(() => {
                setForks(f => {
                  const released = [...f];
                  released[leftFork] = true;
                  released[rightFork] = true;
                  return released;
                });
                setStats(s => ({ ...s, meals: s.meals + 1 }));
                philosopherCycle(id);
              }, 2000);
            } else {
              setPhilosophers(prev => {
                const updated = [...prev];
                updated[id].state = 'WAITING';
                return updated;
              });
              setTimeout(() => philosopherCycle(id), 500);
            }
          } else {
            // Ordem normal (pode causar deadlock)
            if (newForks[leftFork]) {
              newForks[leftFork] = false;
              
              setTimeout(() => {
                setForks(f => {
                  const checkRight = [...f];
                  if (checkRight[rightFork]) {
                    checkRight[rightFork] = false;
                    
                    setPhilosophers(prev => {
                      const updated = [...prev];
                      updated[id].state = 'EATING';
                      return updated;
                    });

                    setTimeout(() => {
                      setForks(fr => {
                        const released = [...fr];
                        released[leftFork] = true;
                        released[rightFork] = true;
                        return released;
                      });
                      setStats(s => ({ ...s, meals: s.meals + 1 }));
                      philosopherCycle(id);
                    }, 2000);
                  } else {
                    // Deadlock potencial
                    checkRight[leftFork] = true;
                    setStats(s => ({ ...s, deadlocks: s.deadlocks + 1 }));
                    setTimeout(() => philosopherCycle(id), 1000);
                    return checkRight;
                  }
                  return checkRight;
                });
              }, 100);
            } else {
              setPhilosophers(prev => {
                const updated = [...prev];
                updated[id].state = 'WAITING';
                return updated;
              });
              setTimeout(() => philosopherCycle(id), 500);
            }
          }
          
          return newForks;
        });
      }, Math.random() * 2000 + 1000);
    };

    // Iniciar ciclo para cada filósofo
    philosophers.forEach((_, id) => {
      setTimeout(() => philosopherCycle(id), id * 200);
    });

  }, [paused, deadlockPrevention]);

  const getStateColor = (state) => {
    switch(state) {
      case 'THINKING': return 'bg-blue-200 border-blue-500';
      case 'WAITING': return 'bg-yellow-200 border-yellow-500';
      case 'EATING': return 'bg-green-200 border-green-500';
      default: return 'bg-gray-200 border-gray-500';
    }
  };

  const getStateEmoji = (state) => {
    switch(state) {
      case 'THINKING': return '🤔';
      case 'WAITING': return '⏳';
      case 'EATING': return '🍝';
      default: return '💭';
    }
  };

  const handleReset = () => {
    setPhilosophers(prev => prev.map(p => ({ ...p, state: 'THINKING' })));
    setForks([true, true, true, true, true]);
    setStats({ meals: 0, deadlocks: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Filósofos Jantando" icon={UtensilsCrossed} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="relative w-full h-[500px] flex items-center justify-center">
              {/* Mesa */}
              <div className="absolute w-64 h-64 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full shadow-2xl"></div>

              {/* Filósofos */}
              {philosophers.map((phil, index) => {
                const angle = (index * 72 - 90) * (Math.PI / 180);
                const radius = 180;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={phil.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute w-24 h-24 rounded-full ${getStateColor(phil.state)} 
                      border-4 flex flex-col items-center justify-center shadow-xl`}
                    style={{
                      left: `calc(50% + ${x}px - 48px)`,
                      top: `calc(50% + ${y}px - 48px)`,
                    }}
                  >
                    <div className="text-3xl">{getStateEmoji(phil.state)}</div>
                    <div className="text-xs font-bold mt-1">{phil.name}</div>
                  </motion.div>
                );
              })}

              {/* Garfos */}
              {forks.map((available, index) => {
                const angle = (index * 72 - 90 + 36) * (Math.PI / 180);
                const radius = 120;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={index}
                    animate={{ 
                      opacity: available ? 1 : 0.3,
                      scale: available ? 1 : 0.8
                    }}
                    className="absolute"
                    style={{
                      left: `calc(50% + ${x}px - 15px)`,
                      top: `calc(50% + ${y}px - 15px)`,
                    }}
                  >
                    <div className={`text-3xl ${available ? '' : 'grayscale'}`}>🍴</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <div className="w-6 h-6 bg-blue-200 border-2 border-blue-500 rounded-full"></div>
                <span className="text-sm font-semibold">Pensando</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-500 rounded-full"></div>
                <span className="text-sm font-semibold">Esperando</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <div className="w-6 h-6 bg-green-200 border-2 border-green-500 rounded-full"></div>
                <span className="text-sm font-semibold">Comendo</span>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold mb-4 text-lg">📊 Estatísticas</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Refeições Completas</div>
                  <div className="text-2xl font-bold text-green-600">{stats.meals}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-600">Deadlocks Detectados</div>
                  <div className="text-2xl font-bold text-red-600">{stats.deadlocks}</div>
                </div>
              </div>
            </Card>

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
              <h3 className="font-bold mb-4 text-lg">⚙️ Prevenção de Deadlock</h3>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={deadlockPrevention}
                  onChange={(e) => {
                    setDeadlockPrevention(e.target.checked);
                    handleReset();
                  }}
                  className="w-5 h-5"
                />
                <span className="text-sm font-semibold">
                  Ativar Prevenção de Deadlock
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-2">
                {deadlockPrevention 
                  ? '✅ O último filósofo pega os garfos em ordem inversa'
                  : '⚠️ Todos pegam garfos na mesma ordem (deadlock possível)'}
              </p>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">💡 Conceito</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                O problema dos <strong>Filósofos Jantando</strong> ilustra desafios 
                de sincronização e deadlock. Cada filósofo precisa de dois garfos para 
                comer, mas há apenas 5 garfos para 5 filósofos.
              </p>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 mb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                  <div>
                    <strong className="text-xs text-red-800">Deadlock:</strong>
                    <p className="text-xs text-red-700 mt-1">
                      Se todos pegarem o garfo esquerdo ao mesmo tempo, ficam esperando 
                      eternamente pelo direito!
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <strong className="text-xs text-green-800">Solução:</strong>
                <p className="text-xs text-green-700 mt-1">
                  Um filósofo pega os garfos em ordem inversa, quebrando a circularidade.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhilosophersPage;