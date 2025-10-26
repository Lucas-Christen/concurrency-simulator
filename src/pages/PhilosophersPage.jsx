import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, UtensilsCrossed, SkipForward, Settings, AlertTriangle, Zap } from 'lucide-react';
import Button from '../components/Button';
import Slider from '../components/Slider';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const PhilosophersPage = () => {
  const [philosophers, setPhilosophers] = useState([
    { id: 0, state: 'THINKING', color: '#3B82F6', name: 'Sócrates', eatCount: 0, hasLeftFork: false, hasRightFork: false },
    { id: 1, state: 'THINKING', color: '#EF4444', name: 'Platão', eatCount: 0, hasLeftFork: false, hasRightFork: false },
    { id: 2, state: 'THINKING', color: '#10B981', name: 'Aristóteles', eatCount: 0, hasLeftFork: false, hasRightFork: false },
    { id: 3, state: 'THINKING', color: '#F59E0B', name: 'Descartes', eatCount: 0, hasLeftFork: false, hasRightFork: false },
    { id: 4, state: 'THINKING', color: '#8B5CF6', name: 'Kant', eatCount: 0, hasLeftFork: false, hasRightFork: false },
  ]);
  const [forks, setForks] = useState([true, true, true, true, true]);
  const [autoMode, setAutoMode] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [deadlockPrevention, setDeadlockPrevention] = useState(true);
  const [stats, setStats] = useState({ meals: 0, deadlocks: 0, steps: 0 });
  const [logs, setLogs] = useState([]);
  const [currentPhil, setCurrentPhil] = useState(0);
  const [highlightPhil, setHighlightPhil] = useState(null);
  const [isDeadlocked, setIsDeadlocked] = useState(false);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [{
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 14)]);
  };

  const forceDeadlock = () => {
    addLog(`⚡ FORÇANDO DEADLOCK...`, 'error');
    
    // Todos pegam garfo esquerdo simultaneamente
    setTimeout(() => {
      setForks([false, false, false, false, false]);
      setPhilosophers(prev => prev.map((p, i) => ({
        ...p,
        state: 'WAITING',
        hasLeftFork: true,
        hasRightFork: false
      })));
      
      setIsDeadlocked(true);
      setStats(s => ({ ...s, deadlocks: s.deadlocks + 1 }));
      
      addLog(`🚨 Sócrates pegou GARFO ESQUERDO (1)`, 'error');
      addLog(`🚨 Platão pegou GARFO ESQUERDO (2)`, 'error');
      addLog(`🚨 Aristóteles pegou GARFO ESQUERDO (3)`, 'error');
      addLog(`🚨 Descartes pegou GARFO ESQUERDO (4)`, 'error');
      addLog(`🚨 Kant pegou GARFO ESQUERDO (5)`, 'error');
      addLog(`🚨🚨🚨 DEADLOCK COMPLETO! Todos seguram garfo ESQUERDO e esperam pelo DIREITO eternamente!`, 'error');
    }, 100);
  };

  const executeStep = () => {
    if (isDeadlocked) {
      addLog(`⛔ Sistema em DEADLOCK! Clique em "Reiniciar" para continuar.`, 'error');
      return;
    }

    const phil = philosophers[currentPhil];
    const leftFork = currentPhil;
    const rightFork = (currentPhil + 1) % 5;

    setHighlightPhil(currentPhil);
    setStats(s => ({ ...s, steps: s.steps + 1 }));

    // Estado THINKING -> tentar pegar garfos
    if (phil.state === 'THINKING') {
      addLog(`🤔 ${phil.name} terminou de pensar e está com fome`, 'info');
      
      const canPickLeft = forks[leftFork];
      const canPickRight = forks[rightFork];

      // COM PROTEÇÃO: Kant pega na ordem inversa
      if (deadlockPrevention && currentPhil === 4) {
        if (canPickRight && canPickLeft) {
          setForks(prev => {
            const newForks = [...prev];
            newForks[rightFork] = false;
            newForks[leftFork] = false;
            return newForks;
          });
          
          setPhilosophers(prev => {
            const updated = [...prev];
            updated[currentPhil].state = 'EATING';
            updated[currentPhil].hasLeftFork = true;
            updated[currentPhil].hasRightFork = true;
            updated[currentPhil].eatCount++;
            return updated;
          });

          addLog(`✅ ${phil.name} pegou GARFO DIREITO (${rightFork + 1}) primeiro, depois ESQUERDO (${leftFork + 1}) [PROTEÇÃO]`, 'success');
          addLog(`🍝 ${phil.name} está comendo!`, 'success');
          setStats(s => ({ ...s, meals: s.meals + 1 }));
        } else {
          setPhilosophers(prev => {
            const updated = [...prev];
            updated[currentPhil].state = 'WAITING';
            return updated;
          });
          addLog(`⏳ ${phil.name} esperando ambos garfos ficarem livres (D:${canPickRight ? '✓' : '✗'} E:${canPickLeft ? '✓' : '✗'})`, 'warning');
        }
      }
      // SEM PROTEÇÃO: Todos pegam esquerda primeiro
      else {
        if (canPickLeft && canPickRight) {
          // Ambos disponíveis - pega os dois
          setForks(prev => {
            const newForks = [...prev];
            newForks[leftFork] = false;
            newForks[rightFork] = false;
            return newForks;
          });
          
          setPhilosophers(prev => {
            const updated = [...prev];
            updated[currentPhil].state = 'EATING';
            updated[currentPhil].hasLeftFork = true;
            updated[currentPhil].hasRightFork = true;
            updated[currentPhil].eatCount++;
            return updated;
          });

          addLog(`✅ ${phil.name} pegou GARFO ESQUERDO (${leftFork + 1}) e GARFO DIREITO (${rightFork + 1})`, 'success');
          addLog(`🍝 ${phil.name} está comendo!`, 'success');
          setStats(s => ({ ...s, meals: s.meals + 1 }));
        } else if (canPickLeft) {
          // Apenas esquerdo disponível - PEGA E SEGURA
          setForks(prev => {
            const newForks = [...prev];
            newForks[leftFork] = false;
            return newForks;
          });
          
          setPhilosophers(prev => {
            const updated = [...prev];
            updated[currentPhil].state = 'WAITING';
            updated[currentPhil].hasLeftFork = true;
            return updated;
          });

          addLog(`⚠️ ${phil.name} pegou GARFO ESQUERDO (${leftFork + 1}) e espera pelo DIREITO (${rightFork + 1})`, 'warning');
          
          // Verifica se todos têm garfo esquerdo (deadlock)
          const updatedPhils = [...philosophers];
          updatedPhils[currentPhil].state = 'WAITING';
          updatedPhils[currentPhil].hasLeftFork = true;
          
          const allWaitingWithLeft = updatedPhils.every(p => 
            p.state === 'WAITING' && p.hasLeftFork && !p.hasRightFork
          );
          
          if (allWaitingWithLeft) {
            setIsDeadlocked(true);
            addLog(`🚨🚨🚨 DEADLOCK COMPLETO! Todos seguram garfo ESQUERDO e esperam pelo DIREITO eternamente!`, 'error');
            setStats(s => ({ ...s, deadlocks: s.deadlocks + 1 }));
          }
        } else {
          // Garfo esquerdo ocupado - espera
          setPhilosophers(prev => {
            const updated = [...prev];
            updated[currentPhil].state = 'WAITING';
            return updated;
          });
          addLog(`⏳ ${phil.name} esperando GARFO ESQUERDO (${leftFork + 1}) ficar livre`, 'warning');
        }
      }
    }
    // Estado EATING -> soltar garfos e voltar a pensar
    else if (phil.state === 'EATING') {
      setForks(prev => {
        const newForks = [...prev];
        newForks[leftFork] = true;
        newForks[rightFork] = true;
        return newForks;
      });

      setPhilosophers(prev => {
        const updated = [...prev];
        updated[currentPhil].state = 'THINKING';
        updated[currentPhil].hasLeftFork = false;
        updated[currentPhil].hasRightFork = false;
        return updated;
      });

      addLog(`😊 ${phil.name} terminou de comer e soltou os garfos (${leftFork + 1} e ${rightFork + 1})`, 'success');
      setIsDeadlocked(false);
    }
    // Estado WAITING -> tentar pegar garfo faltante
    else if (phil.state === 'WAITING') {
      // Tem garfo esquerdo, tenta pegar direito
      if (phil.hasLeftFork && !phil.hasRightFork) {
        if (forks[rightFork]) {
          setForks(prev => {
            const newForks = [...prev];
            newForks[rightFork] = false;
            return newForks;
          });

          setPhilosophers(prev => {
            const updated = [...prev];
            updated[currentPhil].state = 'EATING';
            updated[currentPhil].hasRightFork = true;
            updated[currentPhil].eatCount++;
            return updated;
          });

          addLog(`✅ ${phil.name} conseguiu GARFO DIREITO (${rightFork + 1})!`, 'success');
          addLog(`🍝 ${phil.name} está comendo!`, 'success');
          setStats(s => ({ ...s, meals: s.meals + 1 }));
          setIsDeadlocked(false);
        } else {
          addLog(`⏳ ${phil.name} continua esperando GARFO DIREITO (${rightFork + 1})...`, 'warning');
        }
      }
      // Não tem nenhum garfo, tenta pegar esquerdo
      else if (!phil.hasLeftFork && !phil.hasRightFork) {
        if (forks[leftFork]) {
          if (deadlockPrevention && currentPhil === 4) {
            // Kant com proteção: só pega se ambos estiverem livres
            if (forks[rightFork]) {
              setForks(prev => {
                const newForks = [...prev];
                newForks[rightFork] = false;
                newForks[leftFork] = false;
                return newForks;
              });

              setPhilosophers(prev => {
                const updated = [...prev];
                updated[currentPhil].state = 'EATING';
                updated[currentPhil].hasLeftFork = true;
                updated[currentPhil].hasRightFork = true;
                updated[currentPhil].eatCount++;
                return updated;
              });

              addLog(`✅ ${phil.name} pegou ambos garfos [PROTEÇÃO]`, 'success');
              setStats(s => ({ ...s, meals: s.meals + 1 }));
            }
          } else {
            // Sem proteção: pega esquerdo e espera
            setForks(prev => {
              const newForks = [...prev];
              newForks[leftFork] = false;
              return newForks;
            });

            setPhilosophers(prev => {
              const updated = [...prev];
              updated[currentPhil].hasLeftFork = true;
              return updated;
            });

            addLog(`⚠️ ${phil.name} pegou GARFO ESQUERDO (${leftFork + 1})`, 'warning');
          }
        } else {
          addLog(`⏳ ${phil.name} esperando GARFO ESQUERDO (${leftFork + 1})...`, 'warning');
        }
      }
    }

    // Próximo filósofo
    setCurrentPhil((prev) => (prev + 1) % 5);
    setTimeout(() => setHighlightPhil(null), 800);
  };

  useEffect(() => {
    if (!autoMode || isDeadlocked) return;

    const interval = setInterval(() => {
      executeStep();
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [autoMode, speed, philosophers, forks, currentPhil, isDeadlocked, deadlockPrevention]);

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
    setPhilosophers(prev => prev.map(p => ({ 
      ...p, 
      state: 'THINKING', 
      eatCount: 0,
      hasLeftFork: false,
      hasRightFork: false
    })));
    setForks([true, true, true, true, true]);
    setStats({ meals: 0, deadlocks: 0, steps: 0 });
    setLogs([]);
    setCurrentPhil(0);
    setHighlightPhil(null);
    setIsDeadlocked(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Filósofos Jantando" icon={UtensilsCrossed} />

        {/* Alerta de Deadlock */}
        <AnimatePresence>
          {isDeadlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-6 bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-2xl border-4 border-red-700"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <AlertTriangle size={48} />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">🚨 DEADLOCK DETECTADO!</h2>
                  <p className="text-lg">
                    Todos os filósofos seguram seu garfo ESQUERDO e esperam pelo DIREITO.
                    <br />
                    <strong>Ninguém consegue comer! Sistema travado permanentemente.</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="relative w-full h-[550px] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
              {/* Mesa */}
              <div className="absolute w-72 h-72 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full shadow-2xl">
                {/* Pratos */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const angle = (i * 72 - 90) * (Math.PI / 180);
                  const radius = 90;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  return (
                    <div
                      key={`plate-${i}`}
                      className="absolute w-16 h-16 bg-white rounded-full shadow-lg border-4 border-gray-200"
                      style={{
                        left: `calc(50% + ${x}px - 32px)`,
                        top: `calc(50% + ${y}px - 32px)`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Filósofos */}
              {philosophers.map((phil, index) => {
                const angle = (index * 72 - 90) * (Math.PI / 180);
                const radius = 200;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={phil.id}
                    animate={{ 
                      scale: highlightPhil === index ? 1.2 : 1,
                      boxShadow: highlightPhil === index 
                        ? '0 0 30px rgba(255, 215, 0, 0.8)' 
                        : isDeadlocked && phil.hasLeftFork
                        ? '0 0 25px rgba(239, 68, 68, 1)'
                        : '0 10px 25px rgba(0,0,0,0.2)'
                    }}
                    transition={{ duration: 0.3 }}
                    className={`absolute w-28 h-28 rounded-full ${getStateColor(phil.state)} 
                      border-4 flex flex-col items-center justify-center shadow-2xl`}
                    style={{
                      left: `calc(50% + ${x}px - 56px)`,
                      top: `calc(50% + ${y}px - 56px)`,
                    }}
                  >
                    <div className="text-4xl mb-1">{getStateEmoji(phil.state)}</div>
                    <div className="text-xs font-bold text-center">{phil.name}</div>
                    <div className="text-[10px] text-gray-600">🍽️ {phil.eatCount}</div>
                    {phil.hasLeftFork && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ 
                          scale: 1, 
                          rotate: 0,
                          ...(isDeadlocked ? {
                            y: [0, -5, 0],
                            transition: { repeat: Infinity, duration: 0.5 }
                          } : {})
                        }}
                        className="absolute -left-2 top-1/2 text-xl"
                      >
                        🍴
                      </motion.div>
                    )}
                    {phil.hasRightFork && (
                      <motion.div 
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -right-2 top-1/2 text-xl"
                      >
                        🍴
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* Garfos */}
              {forks.map((available, index) => {
                const angle = (index * 72 - 90 + 36) * (Math.PI / 180);
                const radius = 135;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={index}
                    animate={{ 
                      opacity: available ? 1 : 0.2,
                      scale: available ? 1 : 0.7,
                    }}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `calc(50% + ${x}px - 20px)`,
                      top: `calc(50% + ${y}px - 20px)`,
                    }}
                  >
                    <div className={`text-4xl ${available ? '' : 'grayscale opacity-30'}`}>
                      🍴
                    </div>
                    <div className={`text-xs font-bold mt-1 px-2 py-1 rounded ${
                      available ? 'bg-white' : 'bg-red-200'
                    }`}>
                      {index + 1}
                    </div>
                  </motion.div>
                );
              })}

              {/* Indicador do próximo filósofo */}
              {!isDeadlocked && (
                <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-300">
                  <div className="text-xs text-gray-600 font-semibold">Próximo:</div>
                  <div className="text-lg font-bold" style={{ color: philosophers[currentPhil].color }}>
                    {philosophers[currentPhil].name}
                  </div>
                </div>
              )}
            </div>

            {/* Legenda */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border-2 border-blue-200"
              >
                <div className="w-8 h-8 bg-blue-200 border-2 border-blue-500 rounded-full flex items-center justify-center">
                  🤔
                </div>
                <span className="text-sm font-semibold">Pensando</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200"
              >
                <div className="w-8 h-8 bg-yellow-200 border-2 border-yellow-500 rounded-full flex items-center justify-center">
                  ⏳
                </div>
                <span className="text-sm font-semibold">Esperando</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border-2 border-green-200"
              >
                <div className="w-8 h-8 bg-green-200 border-2 border-green-500 rounded-full flex items-center justify-center">
                  🍝
                </div>
                <span className="text-sm font-semibold">Comendo</span>
              </motion.div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                📊 Estatísticas
              </h3>
              <div className="space-y-3">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300"
                >
                  <div className="text-sm text-gray-600 font-semibold">🎯 Passos</div>
                  <div className="text-4xl font-bold text-purple-600 mt-1">{stats.steps}</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300"
                >
                  <div className="text-sm text-gray-600 font-semibold">🍝 Refeições</div>
                  <div className="text-4xl font-bold text-green-600 mt-1">{stats.meals}</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-2 border-red-300"
                >
                  <div className="text-sm text-gray-600 font-semibold">⚠️ Deadlocks</div>
                  <div className="text-4xl font-bold text-red-600 mt-1">{stats.deadlocks}</div>
                </motion.div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                🎮 Controles
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={executeStep}
                  variant="primary"
                  icon={SkipForward}
                  disabled={autoMode || isDeadlocked}
                >
                  Próximo Passo
                </Button>
                <Button
                  onClick={() => setAutoMode(!autoMode)}
                  variant={autoMode ? 'warning' : 'success'}
                  icon={autoMode ? Pause : Play}
                  disabled={isDeadlocked}
                >
                  {autoMode ? 'Pausar Auto' : 'Modo Automático'}
                </Button>
                <Button
                  onClick={forceDeadlock}
                  variant="danger"
                  icon={Zap}
                  disabled={isDeadlocked}
                >
                  ⚡ Simular Deadlock
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
              <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                <Settings size={18} />
                Configurações
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 transition-all">
                    <input
                      type="checkbox"
                      checked={deadlockPrevention}
                      onChange={(e) => {
                        setDeadlockPrevention(e.target.checked);
                        handleReset();
                      }}
                      className="w-6 h-6 accent-purple-500"
                    />
                    <div>
                      <div className="text-sm font-bold">Prevenção de Deadlock</div>
                      <div className="text-xs text-gray-600">
                        {deadlockPrevention 
                          ? '✅ Kant pega garfos em ordem inversa'
                          : '⚠️ Sem proteção (deadlock pode ocorrer)'}
                      </div>
                    </div>
                  </label>
                </div>

                {autoMode && (
                  <div>
                    <Slider
                      label="Velocidade Automática"
                      value={speed}
                      onChange={setSpeed}
                      min={0.5}
                      max={5}
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-3 text-lg flex items-center gap-2">
                📜 Log de Eventos
              </h3>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`text-xs p-2 rounded ${
                        log.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' :
                        log.type === 'error' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' :
                        log.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500' :
                        'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-gray-500">{log.timestamp}</span>
                      {' - '}
                      {log.message}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-3 text-lg">💡 Como Funciona</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <strong className="text-blue-800">Sem Proteção:</strong>
                  <p className="text-xs text-gray-700 mt-1">
                    Cada filósofo pega o garfo ESQUERDO primeiro e espera pelo DIREITO. 
                    Se todos pegarem ao mesmo tempo → DEADLOCK!
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <strong className="text-green-800">Com Proteção:</strong>
                  <p className="text-xs text-gray-700 mt-1">
                    Kant pega os garfos em ordem inversa (DIREITO → ESQUERDO), 
                    quebrando o ciclo de espera circular.
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <strong className="text-red-800">Botão "Simular Deadlock":</strong>
                  <p className="text-xs text-gray-700 mt-1">
                    Força todos a pegarem garfo esquerdo simultaneamente, 
                    garantindo deadlock instantâneo para demonstração!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhilosophersPage;