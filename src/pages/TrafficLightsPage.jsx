import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, TrafficCone, CarFront } from 'lucide-react';
import Button from '../components/Button';
import Slider from '../components/Slider';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

// *** Tamanho e dimensões da simulação ***
const SIMULATION_SIZE = 700;
const ROAD_WIDTH = 128;
const CAR_WIDTH = 32;
const CAR_HEIGHT = 20;

// --- Componente Semáforo ---
const TrafficLight = ({ state, label }) => {
  const colors = {
    RED: { red: '#EF4444', yellow: '#374151', green: '#374151' },
    YELLOW: { red: '#374151', yellow: '#FBBF24', green: '#374151' },
    GREEN: { red: '#374151', yellow: '#374151', green: '#10B981' },
  };

  const lightSize = 'w-5 h-5';
  const padding = 'p-1.5';

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className={`bg-gray-800 rounded-lg ${padding} shadow-lg z-10 flex flex-col items-center`}
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

// --- Componente Carro ---
const Car = ({ car }) => {
  const carColors = ['bg-blue-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
  const colorClass = carColors[car.id % carColors.length];

  const containerCenter = SIMULATION_SIZE / 2;
  const halfRoadWidth = ROAD_WIDTH / 2;
  const quarterRoadWidth = ROAD_WIDTH / 4;

  // Lanes para carros N-S
  const nsLane1X = containerCenter - quarterRoadWidth - CAR_WIDTH / 2;
  const nsLane2X = containerCenter + quarterRoadWidth - CAR_WIDTH / 2;

  // Lanes para carros L-O
  const ewLane1Y = containerCenter - quarterRoadWidth - CAR_HEIGHT / 2;
  const ewLane2Y = containerCenter + quarterRoadWidth - CAR_HEIGHT / 2;

  // Pontos de parada antes do cruzamento
  const stopPointTopY = containerCenter - halfRoadWidth - CAR_HEIGHT - 10;
  const stopPointBottomY = containerCenter + halfRoadWidth + 10;
  const stopPointLeftX = containerCenter - halfRoadWidth - CAR_WIDTH - 10;
  const stopPointRightX = containerCenter + halfRoadWidth + 10;

  // Pontos de entrada (fora da tela)
  const startYTop = -50;
  const startYBottom = SIMULATION_SIZE + 50;
  const startXLeft = -50;
  const startXRight = SIMULATION_SIZE + 50;

  // Pontos de saída (após cruzar)
  const finalYTop = SIMULATION_SIZE + 100;
  const finalYBottom = -100;
  const finalXLeft = -100;
  const finalXRight = SIMULATION_SIZE + 100;

  const variants = {
    initial: {
      x: car.direction === 'ew' 
        ? (car.start === 'left' ? startXLeft : startXRight) 
        : (car.start === 'top' ? nsLane1X : nsLane2X),
      y: car.direction === 'ns' 
        ? (car.start === 'top' ? startYTop : startYBottom) 
        : (car.start === 'left' ? ewLane1Y : ewLane2Y),
      rotate: car.direction === 'ns' ? 90 : 0,
      opacity: 1,
    },
    move: {
      x: car.direction === 'ew' 
        ? (car.start === 'left' ? finalXLeft : finalXRight) 
        : (car.start === 'top' ? nsLane1X : nsLane2X),
      y: car.direction === 'ns' 
        ? (car.start === 'top' ? finalYTop : finalYBottom) 
        : (car.start === 'left' ? ewLane1Y : ewLane2Y),
      transition: { duration: car.speed, ease: 'linear' },
    },
    stopNS: {
      y: car.start === 'top' ? stopPointTopY : stopPointBottomY,
      x: car.start === 'top' ? nsLane1X : nsLane2X,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    stopEW: {
      x: car.start === 'left' ? stopPointLeftX : stopPointRightX,
      y: car.start === 'left' ? ewLane1Y : ewLane2Y,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    }
  };

  let targetState = 'move';
  if (car.state === 'STOPPED') {
    targetState = car.direction === 'ns' ? 'stopNS' : 'stopEW';
  } else if (car.state === 'EXITING') {
    targetState = 'exit';
  }

  return (
    <motion.div
      key={car.id}
      variants={variants}
      initial="initial"
      animate={targetState}
      exit="exit"
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
  const cycleTimeoutRef = useRef(null);
  const carSpawnIntervalRef = useRef(null);
  const carUpdateIntervalRef = useRef(null);
  const carIdRef = useRef(0);

  stateRef.current = lightState;

  // --- Lógica do Semáforo ---
  const runTrafficCycle = useCallback(() => {
    if (paused) return;

    clearTimeout(cycleTimeoutRef.current);

    const currentTurn = turnRef.current;
    const nextTurn = currentTurn === 'ns' ? 'ew' : 'ns';
    const greenDuration = config.greenTime * 1000;
    const yellowDuration = config.yellowTime * 1000;

    // Verde
    setLightState(prev => ({
      ...prev,
      [currentTurn]: 'GREEN',
      [nextTurn]: 'RED'
    }));

    // Amarelo
    cycleTimeoutRef.current = setTimeout(() => {
      if (paused) return;
      setLightState(prev => ({ ...prev, [currentTurn]: 'YELLOW' }));

      // Vermelho e próxima rodada
      cycleTimeoutRef.current = setTimeout(() => {
        if (paused) return;
        setLightState(prev => ({ ...prev, [currentTurn]: 'RED' }));
        turnRef.current = nextTurn;
        runTrafficCycle();
      }, yellowDuration);
    }, greenDuration);
  }, [paused, config.greenTime, config.yellowTime]);

  // --- Lógica de Spawn dos Carros ---
  const spawnCar = useCallback(() => {
    if (paused) return;

    if (Math.random() < config.spawnRate * 0.15) {
      carIdRef.current += 1;
      const direction = Math.random() < 0.5 ? 'ns' : 'ew';
      const start = Math.random() < 0.5 
        ? (direction === 'ns' ? 'top' : 'left') 
        : (direction === 'ns' ? 'bottom' : 'right');
      const speed = 8 + Math.random() * 5;

      setCars(prev => [...prev, {
        id: carIdRef.current,
        direction,
        start,
        state: 'MOVING',
        speed,
        spawnTime: Date.now(),
      }]);

      setStats(s => ({ ...s, totalSpawned: s.totalSpawned + 1 }));
    }
  }, [paused, config.spawnRate]);

  // --- Lógica de Atualização dos Carros ---
  const updateCars = useCallback(() => {
    if (paused) return;

    setCars(prevCars =>
      prevCars
        .map(car => {
          // Se já está saindo, deixa sair
          if (car.state === 'EXITING') {
            return car;
          }

          const currentLight = stateRef.current[car.direction];
          let newState = car.state;

          // Lógica de estado: se luz está verde, move; senão, para
          if (currentLight === 'GREEN' && car.state !== 'PASSED') {
            newState = 'MOVING';
          } else if ((currentLight === 'RED' || currentLight === 'YELLOW') && car.state !== 'PASSED') {
            newState = 'STOPPED';
          }

          // Verificar se cruzou
          const timeSinceSpawn = Date.now() - car.spawnTime;
          const estimatedCrossTime = (car.speed * 0.7) * 1000; // 70% do tempo total

          if (timeSinceSpawn > estimatedCrossTime && car.state !== 'PASSED') {
            setStats(s => ({
              ...s,
              [car.direction === 'ns' ? 'nsPassed' : 'ewPassed']: 
                s[car.direction === 'ns' ? 'nsPassed' : 'ewPassed'] + 1,
            }));
            return { ...car, state: 'PASSED', exitTime: Date.now() };
          }

          return { ...car, state: newState };
        })
        .map(car => {
          // Se passou, agora sai animadamente
          if (car.state === 'PASSED' && (Date.now() - car.exitTime) > 100) {
            return { ...car, state: 'EXITING' };
          }
          return car;
        })
        .filter(car => {
          // Remove carro após sair completamente
          if (car.state === 'EXITING' && (Date.now() - car.exitTime) > 600) {
            return false;
          }
          return true;
        })
    );
  }, [paused]);

  // --- Efeitos de Inicialização ---
  useEffect(() => {
    if (!paused && !cycleTimeoutRef.current) {
      runTrafficCycle();
    }

    return () => {
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
      }
    };
  }, [paused, runTrafficCycle]);

  // --- Efeito de Spawn e Atualização de Carros ---
  useEffect(() => {
    if (paused) {
      clearInterval(carSpawnIntervalRef.current);
      clearInterval(carUpdateIntervalRef.current);
      return;
    }

    if (!carSpawnIntervalRef.current) {
      carSpawnIntervalRef.current = setInterval(spawnCar, 200);
    }

    if (!carUpdateIntervalRef.current) {
      carUpdateIntervalRef.current = setInterval(updateCars, 100);
    }

    return () => {
      clearInterval(carSpawnIntervalRef.current);
      clearInterval(carUpdateIntervalRef.current);
    };
  }, [paused, spawnCar, updateCars]);

  // --- Reset ---
  const handleReset = () => {
    setPaused(true);

    clearTimeout(cycleTimeoutRef.current);
    clearInterval(carSpawnIntervalRef.current);
    clearInterval(carUpdateIntervalRef.current);

    cycleTimeoutRef.current = null;
    carSpawnIntervalRef.current = null;
    carUpdateIntervalRef.current = null;

    setTimeout(() => {
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
        <PageHeader title="Semáforos de Trânsito" icon={TrafficCone} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulação Principal */}
          <Card className="lg:col-span-2 p-0 overflow-hidden" style={{ height: `${SIMULATION_SIZE}px` }}>
            <div 
              className="relative w-full h-full bg-gray-300 flex items-center justify-center"
              style={{ width: `${SIMULATION_SIZE}px`, height: `${SIMULATION_SIZE}px` }}
            >
              {/* Container da Simulação */}
              <div className="absolute inset-0">
                {/* Semáforos */}
                <div className="absolute top-4 left-4 flex gap-2 z-20 bg-gray-400/40 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                  <TrafficLight state={lightState.ns} label="N" />
                  <TrafficLight state={lightState.ns} label="S" />
                  <TrafficLight state={lightState.ew} label="O" />
                  <TrafficLight state={lightState.ew} label="L" />
                </div>

                {/* Ruas */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Faixa Vertical (N-S) */}
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 h-full bg-gray-700 shadow-inner"
                    style={{ width: `${ROAD_WIDTH}px` }}
                  >
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full border-l-4 border-dashed border-yellow-400" />
                  </div>

                  {/* Faixa Horizontal (L-O) */}
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 w-full bg-gray-700 shadow-inner"
                    style={{ height: `${ROAD_WIDTH}px` }}
                  >
                    <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 border-t-4 border-dashed border-yellow-400" />
                  </div>

                  {/* Centro do Cruzamento */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-600 z-0"
                    style={{ width: `${ROAD_WIDTH}px`, height: `${ROAD_WIDTH}px` }}
                  />
                </div>

                {/* Carros */}
                <div className="absolute inset-0 overflow-hidden">
                  <AnimatePresence>
                    {cars.map((car) => (
                      <Car key={car.id} car={car} />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Status dos Semáforos */}
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-4 z-20">
                  <motion.div className="text-center p-3 bg-white/85 backdrop-blur-sm rounded-lg border border-gray-300 shadow-md">
                    <div className="text-xs text-gray-700 font-semibold">N-S</div>
                    <div className={`text-2xl font-bold ${
                      lightState.ns === 'GREEN' ? 'text-green-600' : 
                      lightState.ns === 'YELLOW' ? 'text-yellow-500' : 
                      'text-red-600'
                    }`}>
                      {lightState.ns}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Passou: {stats.nsPassed}</div>
                  </motion.div>

                  <motion.div className="text-center p-3 bg-white/85 backdrop-blur-sm rounded-lg border border-gray-300 shadow-md">
                    <div className="text-xs text-gray-700 font-semibold">L-O</div>
                    <div className={`text-2xl font-bold ${
                      lightState.ew === 'GREEN' ? 'text-green-600' : 
                      lightState.ew === 'YELLOW' ? 'text-yellow-500' : 
                      'text-red-600'
                    }`}>
                      {lightState.ew}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Passou: {stats.ewPassed}</div>
                  </motion.div>
                </div>

                {/* Total de Carros */}
                <div className="absolute top-4 right-4 bg-white/85 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md z-20">
                  <div className="text-xs text-gray-700 font-semibold">Total Gerado</div>
                  <div className="text-xl font-bold text-gray-800">{stats.totalSpawned}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Painel de Controle */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold mb-4 text-lg">🎮 Controles</h3>
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
              <h3 className="font-bold mb-4 text-lg">⚙️ Configurações</h3>
              <div className="space-y-4">
                <Slider
                  label="Tempo Verde"
                  value={config.greenTime}
                  onChange={(v) => setConfig(c => ({ ...c, greenTime: v }))}
                  min={2}
                  max={10}
                  step={0.5}
                />
                <Slider
                  label="Tempo Amarelo"
                  value={config.yellowTime}
                  onChange={(v) => setConfig(c => ({ ...c, yellowTime: v }))}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
                <Slider
                  label="Taxa de Chegada"
                  value={config.spawnRate}
                  onChange={(v) => setConfig(c => ({ ...c, spawnRate: v }))}
                  min={0.1}
                  max={3}
                  step={0.1}
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">📊 Estatísticas</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-gray-600 font-semibold">Carros N-S</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{stats.nsPassed}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs text-gray-600 font-semibold">Carros L-O</div>
                  <div className="text-2xl font-bold text-green-600 mt-1">{stats.ewPassed}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs text-gray-600 font-semibold">Total Gerado</div>
                  <div className="text-2xl font-bold text-purple-600 mt-1">{stats.totalSpawned}</div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">💡 Conceito</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                A <strong>exclusão mútua (mutex)</strong> é garantida: apenas um conjunto de semáforos (N-S ou L-O) pode estar verde por vez.
              </p>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Técnica:</strong> Alternância de estado controlada por tempo, prevenindo condições de corrida no acesso ao cruzamento (recurso compartilhado).
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