import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Traffic } from 'lucide-react';
import Button from '../components/Button';
import Slider from '../components/Slider';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const TrafficLight = ({ state, label, position }) => {
  const colors = {
    RED: { red: '#EF4444', yellow: '#374151', green: '#374151' },
    YELLOW: { red: '#374151', yellow: '#FBBF24', green: '#374151' },
    GREEN: { red: '#374151', yellow: '#374151', green: '#10B981' },
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`absolute ${position} bg-gray-800 rounded-lg p-3 shadow-xl`}
    >
      <div className="space-y-2">
        {['red', 'yellow', 'green'].map((color) => (
          <motion.div
            key={color}
            animate={{ 
              opacity: state === color.toUpperCase() ? 1 : 0.3,
              boxShadow: state === color.toUpperCase() ? '0 0 20px currentColor' : 'none'
            }}
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: colors[state][color] }}
          />
        ))}
      </div>
      <div className="text-white text-xs text-center mt-2 font-semibold">{label}</div>
    </motion.div>
  );
};

const TrafficLightsPage = () => {
  const [state, setState] = useState({ ns: 'RED', ew: 'RED' });
  const [paused, setPaused] = useState(false);
  const [cycles, setCycles] = useState({ ns: 0, ew: 0 });
  const [greenTime, setGreenTime] = useState(3);
  const [yellowTime, setYellowTime] = useState(1);
  const turnRef = useRef('ns');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const runLight = (direction, otherDirection) => {
      if (turnRef.current !== direction) return;

      // Verde
      setState(prev => ({ ...prev, [direction]: 'GREEN' }));
      
      setTimeout(() => {
        if (paused) return;
        // Amarelo
        setState(prev => ({ ...prev, [direction]: 'YELLOW' }));
        
        setTimeout(() => {
          if (paused) return;
          // Vermelho
          setState(prev => ({ ...prev, [direction]: 'RED' }));
          setCycles(prev => ({ ...prev, [direction]: prev[direction] + 1 }));
          
          // Passar a vez
          turnRef.current = otherDirection;
        }, yellowTime * 1000);
      }, greenTime * 1000);
    };

    intervalRef.current = setInterval(() => {
      if (turnRef.current === 'ns') {
        runLight('ns', 'ew');
      } else {
        runLight('ew', 'ns');
      }
    }, (greenTime + yellowTime + 0.5) * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [paused, greenTime, yellowTime]);

  const handleReset = () => {
    setCycles({ ns: 0, ew: 0 });
    setState({ ns: 'RED', ew: 'RED' });
    turnRef.current = 'ns';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Semáforos de Trânsito" icon={Traffic} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden">
              {/* Ruas */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-full bg-gray-700"></div>
                <div className="absolute w-full h-32 bg-gray-700"></div>
                <div className="absolute w-1 h-full bg-yellow-400"></div>
                <div className="absolute w-full h-1 bg-yellow-400"></div>
              </div>

              {/* Semáforos */}
              <TrafficLight state={state.ns} label="N-S" position="top-20 left-40" />
              <TrafficLight state={state.ns} label="N-S" position="bottom-20 right-40" />
              <TrafficLight state={state.ew} label="L-O" position="top-40 left-20" />
              <TrafficLight state={state.ew} label="L-O" position="bottom-40 right-20" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200"
              >
                <div className="text-sm text-gray-600 font-semibold">Norte-Sul</div>
                <div className="text-3xl font-bold text-blue-600">{state.ns}</div>
                <div className="text-sm text-gray-500">Ciclos: {cycles.ns}</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200"
              >
                <div className="text-sm text-gray-600 font-semibold">Leste-Oeste</div>
                <div className="text-3xl font-bold text-green-600">{state.ew}</div>
                <div className="text-sm text-gray-500">Ciclos: {cycles.ew}</div>
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
                  label="Tempo Verde"
                  value={greenTime}
                  onChange={setGreenTime}
                  min={1}
                  max={10}
                />
                <Slider
                  label="Tempo Amarelo"
                  value={yellowTime}
                  onChange={setYellowTime}
                  min={0.5}
                  max={3}
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">💡 Conceito</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Esta simulação demonstra <strong>exclusão mútua</strong> usando 
                primitivas de sincronização (Mutex/Condition). Apenas um semáforo 
                pode estar verde por vez, garantindo que não haja colisões no cruzamento.
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Técnica:</strong> Threading.Condition com wait() e notify()
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