import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, TrafficCone } from 'lucide-react';
import Button from '../components/Button';
import Slider from '../components/Slider';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

// ... (Constantes e componente TrafficLight - sem alterações) ...
const ROAD_WIDTH_PERCENT = 16;
const SEMAPHORE_BOX_SIZE = 60;

const TrafficLight = ({ state, label }) => {
  // ... (código do componente TrafficLight - sem alterações)
  const colors = {
    RED: { red: '#EF4444', yellow: '#374151', green: '#374151' },
    YELLOW: { red: '#374151', yellow: '#FBBF24', green: '#374151' },
    GREEN: { red: '#374151', yellow: '#374151', green: '#10B981' },
  };
  const lightSize = 'w-4 h-4';
  const padding = 'p-1';

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className={`bg-gray-800 rounded ${padding} shadow-md z-10 flex flex-col items-center`}
    >
      <div className="space-y-1">
        {['red', 'yellow', 'green'].map((color) => (
          <motion.div
            key={color}
            animate={{
              opacity: state === color.toUpperCase() ? 1 : 0.3,
              boxShadow: state === color.toUpperCase() ? `0 0 8px ${colors[state][color]}` : 'none'
            }}
            transition={{ duration: 0.1 }}
            className={`${lightSize} rounded-full`}
            style={{ backgroundColor: colors[state][color] }}
          />
        ))}
      </div>
      <div className="text-white text-[8px] text-center mt-0.5 font-semibold">{label}</div>
    </motion.div>
  );
};


const TrafficLightsPage = () => {
  const [lightState, setLightState] = useState({ ns: 'GREEN', ew: 'RED' });
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({ nsCycles: 0, ewCycles: 0, totalTimeNs: 0, totalTimeEw: 0 });
  const [config, setConfig] = useState({
    greenTime: 5,
    yellowTime: 1.5,
  });

  const turnRef = useRef('ns');
  const cycleTimeoutRef = useRef(null);
  const phaseStartTimeRef = useRef(Date.now()); // Renomeado para clareza

  // --- Lógica do Semáforo (CORRIGIDA para tempo ativo) ---
  const runTrafficCycle = useCallback(() => {
    clearTimeout(cycleTimeoutRef.current);
    cycleTimeoutRef.current = null;
    if (paused) return;

    const currentTurn = turnRef.current;
    const nextTurn = currentTurn === 'ns' ? 'ew' : 'ns';
    const greenDuration = config.greenTime * 1000;
    const yellowDuration = config.yellowTime * 1000;

    // Inicia Verde
    setLightState({ [currentTurn]: 'GREEN', [nextTurn]: 'RED' });
    setStats(s => ({ ...s, [currentTurn + 'Cycles']: s[currentTurn + 'Cycles'] + 1 }));
    phaseStartTimeRef.current = Date.now(); // Marca início da fase VERDE

    // Passa para Amarelo
    cycleTimeoutRef.current = setTimeout(() => {
       if (turnRef.current !== currentTurn || paused) return;

       // Tempo verde decorrido (será somado ao final do amarelo)
       const elapsedGreen = Date.now() - phaseStartTimeRef.current;

       setLightState(prev => ({ ...prev, [currentTurn]: 'YELLOW' }));
       phaseStartTimeRef.current = Date.now(); // Marca início da fase AMARELA

      // Passa para Vermelho e próximo ciclo
      cycleTimeoutRef.current = setTimeout(() => {
        if (turnRef.current !== currentTurn || paused) return;

        const elapsedYellow = Date.now() - phaseStartTimeRef.current;
        const totalActiveTime = elapsedGreen + elapsedYellow; // Soma verde + amarelo

        // Atualiza estatísticas COM O TEMPO TOTAL ATIVO (VERDE + AMARELO)
        setStats(s => ({
            ...s,
            ['totalTime' + currentTurn.toUpperCase()]: s['totalTime' + currentTurn.toUpperCase()] + totalActiveTime / 1000
        }));

        setLightState(prev => ({ ...prev, [currentTurn]: 'RED' }));
        turnRef.current = nextTurn;
        phaseStartTimeRef.current = Date.now(); // Marca o início da fase VERMELHA (ou próximo ciclo)

        cycleTimeoutRef.current = setTimeout(runTrafficCycle, 300); // Inicia próximo ciclo
      }, yellowDuration);
    }, greenDuration);

  }, [paused, config.greenTime, config.yellowTime]);

  // --- Efeito para iniciar/parar o ciclo (CORRIGIDO para tempo ativo) ---
  useEffect(() => {
    if (!paused) {
        if (!cycleTimeoutRef.current) {
             phaseStartTimeRef.current = Date.now(); // Reseta tempo ao (re)iniciar
             runTrafficCycle();
        }
    } else {
        // Pausa: Limpa o timer atual
        clearTimeout(cycleTimeoutRef.current);
        cycleTimeoutRef.current = null;

        const elapsed = Date.now() - phaseStartTimeRef.current;
        const currentTurn = turnRef.current;
        const currentState = lightState[currentTurn]; // Obtém o estado atual diretamente

        // Adiciona o tempo decorrido da fase atual (Verde ou Amarelo) ao pausar
        if (currentState === 'GREEN' || currentState === 'YELLOW') {
           setStats(s => ({ ...s, ['totalTime' + currentTurn.toUpperCase()]: s['totalTime' + currentTurn.toUpperCase()] + elapsed / 1000 }));
        }
        // Atualiza a referência de tempo para o próximo cálculo quando retomar
        phaseStartTimeRef.current = Date.now();
    }
    return () => clearTimeout(cycleTimeoutRef.current);
  // Não precisa mais de lightState aqui, pois lemos diretamente ao pausar
  }, [paused, runTrafficCycle]);

  // --- Reset (sem alterações) ---
  const handleReset = () => {
    setPaused(true);
    setTimeout(() => {
        clearTimeout(cycleTimeoutRef.current);
        cycleTimeoutRef.current = null;
        setStats({ nsCycles: 0, ewCycles: 0, totalTimeNs: 0, totalTimeEw: 0 });
        setLightState({ ns: 'GREEN', ew: 'RED' });
        turnRef.current = 'ns';
        phaseStartTimeRef.current = Date.now(); // Reseta tempo no reset
        setPaused(false);
    }, 50);
  };

  // --- Cores dinâmicas ---
  const intersectionColor = lightState.ns === 'GREEN' || lightState.ew === 'GREEN' ? 'bg-green-700/50' : 'bg-gray-600';

  return (
     // --- JSX (sem alterações visuais, apenas na exibição das stats) ---
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Semáforos (Exclusão Mútua)" icon={TrafficCone} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-4">
            <div className="relative w-full bg-gray-300 rounded overflow-hidden shadow-inner" style={{ paddingTop: '100%' }}>
              <div className="absolute inset-0">
                 <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 bg-gray-400/30 backdrop-blur-sm p-1 rounded-md shadow" style={{ width: `${SEMAPHORE_BOX_SIZE}px`}}>
                   <TrafficLight state={lightState.ns} label="N/S" />
                   <TrafficLight state={lightState.ew} label="L/O" />
                 </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ backgroundColor: lightState.ns === 'GREEN' ? 'rgba(34, 139, 34, 0.4)' : '#374151' }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-1/2 transform -translate-x-1/2 h-full"
                    style={{ width: `${ROAD_WIDTH_PERCENT}%` }}
                  >
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full border-l-2 border-dashed border-yellow-400 opacity-50" />
                  </motion.div>
                  <motion.div
                    animate={{ backgroundColor: lightState.ew === 'GREEN' ? 'rgba(34, 139, 34, 0.4)' : '#374151' }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-1/2 transform -translate-y-1/2 w-full"
                    style={{ height: `${ROAD_WIDTH_PERCENT}%` }}
                  >
                    <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-px border-t-2 border-dashed border-yellow-400 opacity-50" />
                  </motion.div>
                  <motion.div
                     animate={{ backgroundColor: intersectionColor }}
                     transition={{ duration: 0.3 }}
                     className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
                     style={{ width: `${ROAD_WIDTH_PERCENT}%`, height: `${ROAD_WIDTH_PERCENT}%` }}
                  >
                     {(lightState.ns === 'GREEN' || lightState.ew === 'GREEN') && (
                         <motion.div
                           className="absolute inset-0 border-2 border-green-400 rounded"
                           animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                         />
                     )}
                  </motion.div>
                </div>
                 <div className="absolute bottom-2 left-2 right-2 grid grid-cols-2 gap-2 z-20">
                   <motion.div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-300 shadow">
                     <div className="text-[10px] sm:text-xs text-gray-700 font-semibold">Norte-Sul</div>
                     <div className={`text-lg sm:text-xl font-bold ${
                       lightState.ns === 'GREEN' ? 'text-green-600' :
                       lightState.ns === 'YELLOW' ? 'text-yellow-500' :
                       'text-red-600'
                     }`}>
                       {lightState.ns}
                     </div>
                     <div className="text-[9px] sm:text-xs text-gray-600 mt-0.5">Ciclos: {stats.nsCycles}</div>
                     <div className="text-[9px] sm:text-xs text-gray-600">Ativo: {stats.totalTimeNs.toFixed(1)}s</div>
                   </motion.div>
                   <motion.div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-300 shadow">
                     <div className="text-[10px] sm:text-xs text-gray-700 font-semibold">Leste-Oeste</div>
                     <div className={`text-lg sm:text-xl font-bold ${
                       lightState.ew === 'GREEN' ? 'text-green-600' :
                       lightState.ew === 'YELLOW' ? 'text-yellow-500' :
                       'text-red-600'
                     }`}>
                       {lightState.ew}
                     </div>
                     <div className="text-[9px] sm:text-xs text-gray-600 mt-0.5">Ciclos: {stats.ewCycles}</div>
                     <div className="text-[9px] sm:text-xs text-gray-600">Ativo: {stats.totalTimeEw.toFixed(1)}s</div>
                   </motion.div>
                 </div>
              </div>
            </div>
          </Card>
          <div className="space-y-6">
             {/* ... (Restante dos Cards: Controles, Configurações, Estatísticas, Conceito) ... */}
              <Card>
                <h3 className="font-bold mb-4 text-lg">🎮 Controles</h3>
                <div className="space-y-3">
                  <Button onClick={() => setPaused(!paused)} variant={paused ? 'success' : 'warning'} icon={paused ? Play : Pause}>
                    {paused ? 'Retomar' : 'Pausar'}
                  </Button>
                  <Button onClick={handleReset} variant="secondary" icon={RotateCcw}>
                    Reiniciar
                  </Button>
                </div>
              </Card>
             <Card>
               <h3 className="font-bold mb-4 text-lg">⚙️ Configurações</h3>
               <div className="space-y-4">
                 <Slider label="Tempo Verde" value={config.greenTime} onChange={(v) => setConfig(c => ({ ...c, greenTime: v }))} min={2} max={10} step={0.5} unit="s" />
                 <Slider label="Tempo Amarelo" value={config.yellowTime} onChange={(v) => setConfig(c => ({ ...c, yellowTime: v }))} min={0.5} max={3} step={0.1} unit="s" />
               </div>
             </Card>
             <Card>
                <h3 className="font-bold mb-4 text-lg">📊 Estatísticas</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-gray-600 font-semibold">Ciclos N-S</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{stats.nsCycles}</div>
                    <div className="text-xs text-gray-500">Tempo Ativo: {stats.totalTimeNs.toFixed(1)}s</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs text-gray-600 font-semibold">Ciclos L-O</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">{stats.ewCycles}</div>
                     <div className="text-xs text-gray-500">Tempo Ativo: {stats.totalTimeEw.toFixed(1)}s</div>
                  </div>
                </div>
              </Card>
             <Card>
               <h3 className="font-bold mb-4 text-lg">💡 Conceito</h3>
               <p className="text-sm text-gray-700 leading-relaxed mb-3">
                 A <strong>exclusão mútua</strong> é garantida: apenas uma direção (N-S ou L-O) pode ter o sinal verde e, portanto, acesso ao cruzamento (recurso compartilhado) por vez. Isso previne condições de corrida (colisões).
               </p>
               <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                 <p className="text-xs text-yellow-800">
                   <strong>Técnica Simulada:</strong> Os semáforos agem como um mecanismo de controle (similar a um mutex ou semáforo binário) que alterna o acesso ao recurso (cruzamento) baseado em tempo, garantindo que nunca haja acesso simultâneo conflitante.
                 </p>
               </div>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficLightsPage;