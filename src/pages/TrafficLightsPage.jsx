import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, TrafficCone, CarFront } from 'lucide-react';
import Button from '../components/Button';
import Slider from '../components/Slider';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

// *** Definir o tamanho da área de simulação ***
const SIMULATION_SIZE = 700; // Tamanho da área de simulação
const ROAD_WIDTH = 128; // Largura da rua (w-32)
const CAR_WIDTH = 32; // w-8
const CAR_HEIGHT = 20; // h-5


// --- Componente Semáforo ---
const TrafficLight = ({ state, label, position }) => {
  const colors = {
    RED: { red: '#EF4444', yellow: '#374151', green: '#374151' },
    YELLOW: { red: '#374151', yellow: '#FBBF24', green: '#374151' },
    GREEN: { red: '#374151', yellow: '#374151', green: '#10B981' },
  };

  const lightSize = 'w-5 h-5'; // Diminuído
  const padding = 'p-1.5';   // Diminuído

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className={`bg-gray-800 rounded-lg ${padding} shadow-lg z-10 flex flex-col items-center ${position}`} // Adicionado position aqui
    >
      <div className="space-y-1">
        {['red', 'yellow', 'green'].map((color) => (
          <motion.div
            key={color}
            animate={{
              opacity: state === color.toUpperCase() ? 1 : 0.3,
              boxShadow: state === color.toUpperCase() ? `0 0 10px ${colors[state][color]}` : 'none'
            }}
            transition={{ duration: 0.1 }}
            className={`${lightSize} rounded-full`}
            style={{ backgroundColor: colors[state][color] }}
          />
        ))}
      </div>
      <div className="text-white text-[9px] text-center mt-1 font-semibold">{label}</div>
    </motion.div>
  );
};

// --- Componente Carro (com destinos de 'move' ajustados) ---
const Car = ({ car }) => {
  const carColors = ['bg-blue-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
  const colorClass = carColors[car.id % carColors.length];

  // Cálculos baseados nas constantes globais
  const containerCenter = SIMULATION_SIZE / 2;
  const halfRoadWidth = ROAD_WIDTH / 2;
  const quarterRoadWidth = ROAD_WIDTH / 4;

  const nsLane1X = containerCenter - quarterRoadWidth - CAR_WIDTH / 2 + 2;
  const nsLane2X = containerCenter + quarterRoadWidth - CAR_WIDTH / 2 - 2;
  const ewLane1Y = containerCenter - quarterRoadWidth - CAR_HEIGHT / 2 + 2;
  const ewLane2Y = containerCenter + quarterRoadWidth - CAR_HEIGHT / 2 - 2;

  const stopPointTopY = containerCenter - halfRoadWidth - CAR_HEIGHT - 5;
  const stopPointBottomY = containerCenter + halfRoadWidth + 5;
  const stopPointLeftX = containerCenter - halfRoadWidth - CAR_WIDTH - 5;
  const stopPointRightX = containerCenter + halfRoadWidth + 5;

  // Pontos de entrada (fora da tela)
  const startYTop = -50;
  const startYBottom = SIMULATION_SIZE + 50;
  const startXLeft = -50;
  const startXRight = SIMULATION_SIZE + 50;

  // *** NOVOS PONTOS DE SAÍDA (Logo após o cruzamento) ***
  const exitPointTopY = containerCenter - halfRoadWidth - CAR_HEIGHT; // Borda superior do cruzamento
  const exitPointBottomY = containerCenter + halfRoadWidth;         // Borda inferior do cruzamento
  const exitPointLeftX = containerCenter - halfRoadWidth - CAR_WIDTH;   // Borda esquerda do cruzamento
  const exitPointRightX = containerCenter + halfRoadWidth;          // Borda direita do cruzamento

  // Ajuste fino para garantir que o carro *saia* completamente do cruzamento
  const exitMargin = CAR_HEIGHT * 2; // Margem para garantir a saída visual

  const finalYTop = exitPointBottomY + exitMargin; // Destino para quem vem de cima
  const finalYBottom = exitPointTopY - exitMargin; // Destino para quem vem de baixo
  const finalXLeft = exitPointRightX + exitMargin; // Destino para quem vem da esquerda
  const finalXRight = exitPointLeftX - exitMargin; // Destino para quem vem da direita
  // *** FIM NOVOS PONTOS DE SAÍDA ***


  const variants = {
    initial: {
      x: car.direction === 'ew' ? (car.start === 'left' ? startXLeft : startXRight) : (car.start === 'top' ? nsLane1X : nsLane2X),
      y: car.direction === 'ns' ? (car.start === 'top' ? startYTop : startYBottom) : (car.start === 'left' ? ewLane1Y : ewLane2Y),
      rotate: car.direction === 'ns' ? 90 : 0,
    },
    // *** 'move' AGORA USA OS NOVOS PONTOS FINAIS ***
    move: (car) => ({
      x: car.direction === 'ew' ? (car.start === 'left' ? finalXLeft : finalXRight) : (car.start === 'top' ? nsLane1X : nsLane2X),
      y: car.direction === 'ns' ? (car.start === 'top' ? finalYTop : finalYBottom) : (car.start === 'left' ? ewLane1Y : ewLane2Y),
      // Ajuste a duração da animação para refletir a distância menor
      transition: { duration: car.speed * 0.65, ease: 'linear' }, // Ex: 65% do tempo original
    }),
    stopNS: (car) => ({
      y: car.start === 'top' ? stopPointTopY : stopPointBottomY,
      x: car.start === 'top' ? nsLane1X : nsLane2X,
      transition: { duration: car.speed * 0.3, ease: [0.2, 0.6, 0.5, 1] },
    }),
    stopEW: (car) => ({
      x: car.start === 'left' ? stopPointLeftX : stopPointRightX,
      y: car.start === 'left' ? ewLane1Y : ewLane2Y,
      transition: { duration: car.speed * 0.3, ease: [0.2, 0.6, 0.5, 1] },
    }),
    exit: { // A saída agora é um fade out rápido
      opacity: 0,
      transition: { duration: 0.1 } // Transição de fade out
    }
  };


  let targetState = 'move';
  if (car.state === 'STOPPED') {
    targetState = car.direction === 'ns' ? 'stopNS' : 'stopEW';
  }

  return (
    <motion.div
      key={car.id}
      custom={car}
      variants={variants}
      initial="initial"
      animate={targetState}
      exit="exit" // Usará a variante 'exit' para desaparecer
      className={`absolute w-8 h-5 ${colorClass} rounded-t-md rounded-b-sm border border-black/50 shadow-md flex items-center justify-center`}
    >
        <CarFront size={12} className="text-white/50" />
    </motion.div>
  );
};


// --- Página Principal ---
const TrafficLightsPage = () => {
  const [lightState, setLightState] = useState({ ns: 'GREEN', ew: 'RED' });
  const [paused, setPaused] = useState(false);
  const [cars, setCars] = useState([]);
  const [stats, setStats] = useState({ nsPassed: 0, ewPassed: 0, totalSpawned: 0 });
  const [config, setConfig] = useState({
    greenTime: 5,
    yellowTime: 1.5,
    spawnRate: 1,
  });
  const turnRef = useRef('ns');
  const stateRef = useRef(lightState);
  const carIdRef = useRef(0);
  const cycleTimeoutRef = useRef(null);
  const carSpawnIntervalRef = useRef(null);
  const carUpdateIntervalRef = useRef(null);

  stateRef.current = lightState;

  // --- Lógica do Semáforo ---
  const runTrafficCycle = useCallback(() => {
    clearTimeout(cycleTimeoutRef.current);
    cycleTimeoutRef.current = null;
    if (paused) return;

    const currentTurn = turnRef.current;
    const nextTurn = currentTurn === 'ns' ? 'ew' : 'ns';
    const greenDuration = config.greenTime * 1000;
    const yellowDuration = config.yellowTime * 1000;

    setLightState({ [currentTurn]: 'GREEN', [nextTurn]: 'RED' });

    cycleTimeoutRef.current = setTimeout(() => {
      if (turnRef.current !== currentTurn || paused) return;
      setLightState(prev => ({ ...prev, [currentTurn]: 'YELLOW' }));

      cycleTimeoutRef.current = setTimeout(() => {
        if (turnRef.current !== currentTurn || paused) return;
        setLightState(prev => ({ ...prev, [currentTurn]: 'RED' }));
        turnRef.current = nextTurn;
        cycleTimeoutRef.current = setTimeout(runTrafficCycle, 300);
      }, yellowDuration);
    }, greenDuration);
  }, [paused, config.greenTime, config.yellowTime]);

  // --- Lógica dos Carros (com remoção após cruzamento) ---
  const updateCars = useCallback(() => {
     if (paused) return;
    setCars(prevCars =>
      prevCars
        .map(car => {
          if (car.state === 'REMOVE' || car.state === 'PASSED_COUNTED') return car;

          const currentLight = stateRef.current[car.direction];
          let newState = car.state;

          if (currentLight === 'GREEN') {
            newState = 'MOVING';
          } else if (currentLight === 'RED' || currentLight === 'YELLOW') {
             newState = 'STOPPED';
          }

          const timeSinceSpawn = Date.now() - car.spawnTime;
          // *** AJUSTE DO TEMPO ESTIMADO PARA REMOÇÃO ***
          // Tempo para cruzar ~65% do percurso original + margem
          const estimatedTravelTime = (car.speed * 0.65 + 0.5) * 1000;

          if (timeSinceSpawn > estimatedTravelTime) {
             if (car.state !== 'PASSED_COUNTED') {
              setStats(s => ({
                ...s,
                [car.direction + 'Passed']: s[car.direction + 'Passed'] + 1,
              }));
              // Marca para remoção após contar
              return { ...car, state: 'PASSED_COUNTED' };
            }
          }

          if (newState !== car.state) {
              return { ...car, state: newState };
          }
          return car;
        })
        .filter(car => car.state !== 'PASSED_COUNTED') // Remove os contados
    );
  }, [paused]);


  // --- Efeitos ---
  useEffect(() => {
    if (!paused) {
      if (!cycleTimeoutRef.current) {
        runTrafficCycle();
      }
    } else {
      clearTimeout(cycleTimeoutRef.current);
      cycleTimeoutRef.current = null;
    }
    return () => {
      clearTimeout(cycleTimeoutRef.current);
    };
  }, [paused, runTrafficCycle]);

   useEffect(() => {
    if (paused) {
      clearInterval(carSpawnIntervalRef.current);
      clearInterval(carUpdateIntervalRef.current);
      carSpawnIntervalRef.current = null;
      carUpdateIntervalRef.current = null;
      return;
    }

    if (!carSpawnIntervalRef.current) {
      carSpawnIntervalRef.current = setInterval(() => {
          if (Math.random() < config.spawnRate * 0.1) {
              carIdRef.current += 1;
              const direction = Math.random() < 0.5 ? 'ns' : 'ew';
              const start = Math.random() < 0.5 ? (direction === 'ns' ? 'top' : 'left') : (direction === 'ns' ? 'bottom' : 'right');
              const speed = 7 + Math.random() * 6; // Velocidade baseada na duração total anterior

               setCars(prev => [...prev, {
                  id: carIdRef.current, direction, start, state: 'MOVING', speed, spawnTime: Date.now(),
               }]);
               setStats(s => ({...s, totalSpawned: s.totalSpawned + 1}));
          }
      }, 100);
    }

     if (!carUpdateIntervalRef.current) {
        carUpdateIntervalRef.current = setInterval(updateCars, 150);
     }

    return () => {
      clearInterval(carSpawnIntervalRef.current);
      clearInterval(carUpdateIntervalRef.current);
    };
   }, [paused, config.spawnRate, updateCars]);

  // --- handleReset ---
  const handleReset = () => {
    setPaused(true);
    setTimeout(() => {
        clearTimeout(cycleTimeoutRef.current);
        clearInterval(carSpawnIntervalRef.current);
        clearInterval(carUpdateIntervalRef.current);
        cycleTimeoutRef.current = null;
        carSpawnIntervalRef.current = null;
        carUpdateIntervalRef.current = null;

        setCars([]);
        setStats({ nsPassed: 0, ewPassed: 0, totalSpawned: 0 });
        setLightState({ ns: 'GREEN', ew: 'RED' });
        turnRef.current = 'ns';
        carIdRef.current = 0;

        setPaused(false);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Semáforos de Trânsito com Carros" icon={TrafficCone} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Container Principal da Simulação */}
          <Card className="lg:col-span-2 relative overflow-hidden flex items-center justify-center bg-gray-300 aspect-square max-w-[--simulation-size] mx-auto p-0"
                style={{ '--simulation-size': `${SIMULATION_SIZE}px`, height: `${SIMULATION_SIZE}px`, width: `${SIMULATION_SIZE}px` }}>
            {/* Container interno para referência */}
            <div className="absolute" style={{ height: `${SIMULATION_SIZE}px`, width: `${SIMULATION_SIZE}px` }}>

              {/* --- Container para Semáforos no Canto --- */}
              <div className="absolute top-4 left-4 flex gap-2 z-20 bg-gray-400/30 backdrop-blur-sm p-2 rounded-md shadow">
                {/* Passa 'position' vazia, pois o container flex cuida */}
                <TrafficLight state={lightState.ns} label="N" position="" />
                <TrafficLight state={lightState.ns} label="S" position="" />
                <TrafficLight state={lightState.ew} label="O" position="" />
                <TrafficLight state={lightState.ew} label="L" position="" />
              </div>
              {/* --- Fim Container Semáforos --- */}

              {/* Ruas */}
              <div className="absolute inset-0 flex items-center justify-center">
                 {/* Faixa Vertical */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full bg-gray-700 shadow-inner" style={{ width: `${ROAD_WIDTH}px` }}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full border-l-4 border-dashed border-yellow-400"></div>
                   <div className="absolute h-1 w-full bg-white top-[calc(50%-var(--half-road-width)-5px)]" style={{'--half-road-width': `${ROAD_WIDTH / 2}px`}}></div>
                   <div className="absolute h-1 w-full bg-white bottom-[calc(50%-var(--half-road-width)-5px)]" style={{'--half-road-width': `${ROAD_WIDTH / 2}px`}}></div>
                </div>
                 {/* Faixa Horizontal */}
                <div className="absolute top-1/2 transform -translate-y-1/2 w-full bg-gray-700 shadow-inner" style={{ height: `${ROAD_WIDTH}px` }}>
                   <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 border-t-4 border-dashed border-yellow-400"></div>
                   <div className="absolute w-1 h-full bg-white left-[calc(50%-var(--half-road-width)-5px)]" style={{'--half-road-width': `${ROAD_WIDTH / 2}px`}}></div>
                   <div className="absolute w-1 h-full bg-white right-[calc(50%-var(--half-road-width)-5px)]" style={{'--half-road-width': `${ROAD_WIDTH / 2}px`}}></div>
                </div>
                 {/* Centro do cruzamento */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-600 z-0" style={{ width: `${ROAD_WIDTH}px`, height: `${ROAD_WIDTH}px` }}></div>
              </div>

              {/* Contêiner para Carros */}
              <div className="absolute inset-0 overflow-hidden" style={{ height: `${SIMULATION_SIZE}px`, width: `${SIMULATION_SIZE}px` }}>
                <AnimatePresence>
                  {cars.map((car) => (
                    <Car key={car.id} car={car} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
            {/* Divs de Status */}
             <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-4 z-20">
              <motion.div
                className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-300 shadow"
              >
                <div className="text-xs text-gray-700 font-semibold">Norte-Sul</div>
                <div className={`text-xl font-bold ${lightState.ns === 'GREEN' ? 'text-green-600' : lightState.ns === 'YELLOW' ? 'text-yellow-500' : 'text-red-600'}`}>{lightState.ns}</div>
                 <div className="text-[10px] text-gray-500 mt-0.5">Carros: {stats.nsPassed}</div>
              </motion.div>
              <motion.div
                className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-300 shadow"
              >
                <div className="text-xs text-gray-700 font-semibold">Leste-Oeste</div>
                <div className={`text-xl font-bold ${lightState.ew === 'GREEN' ? 'text-green-600' : lightState.ew === 'YELLOW' ? 'text-yellow-500' : 'text-red-600'}`}>{lightState.ew}</div>
                 <div className="text-[10px] text-gray-500 mt-0.5">Carros: {stats.ewPassed}</div>
              </motion.div>
            </div>
            <div className="absolute bottom-[-20px] left-0 right-0 text-center text-xs text-gray-500 z-20">Total: {stats.totalSpawned}</div>

          </Card>

          {/* Coluna Direita */}
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
                  label="Tempo Verde"
                  value={config.greenTime}
                  onChange={(v) => setConfig(c => ({...c, greenTime: v}))}
                  min={2}
                  max={10}
                  step={0.5}
                />
                <Slider
                  label="Tempo Amarelo"
                  value={config.yellowTime}
                  onChange={(v) => setConfig(c => ({...c, yellowTime: v}))}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
                 <Slider
                  label="Taxa de Chegada (carros/s)"
                  value={config.spawnRate}
                  onChange={(v) => setConfig(c => ({...c, spawnRate: v}))}
                  min={0.1}
                  max={3}
                  step={0.1}
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">💡 Conceito</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                A <strong>exclusão mútua</strong> é garantida: apenas um conjunto de semáforos (N-S ou L-O) pode estar verde por vez. O cruzamento é o recurso compartilhado, e os semáforos atuam como um "mutex" (ou usam Conditions) para controlar o acesso, prevenindo colisões (condições de corrida no recurso compartilhado). Os carros representam "threads" tentando acessar o recurso.
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Técnica (simulada):</strong> Alternância de estado controlada por tempo, garantindo que apenas uma direção tenha acesso (verde) por vez.
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