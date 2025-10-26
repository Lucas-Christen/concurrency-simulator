import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Book, Users, CheckCircle, Clock } from 'lucide-react';
import Button from '../components/Button';
import Slider from '../components/Slider';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const Room = ({ student, number }) => (
  <motion.div
    initial={{ scale: 0.8 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.05 }}
    className={`relative w-24 h-24 rounded-lg ${
      student ? 'bg-blue-200' : 'bg-green-200'
    } border-2 border-gray-800 flex items-center justify-center shadow-md`}
  >
    <div className="absolute -top-2 -left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded font-bold">
      {number}
    </div>
    {student && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
        style={{ backgroundColor: student.color }}
      >
        E{student.id}
      </motion.div>
    )}
    {!student && (
      <div className="text-green-700 font-semibold text-sm">Livre</div>
    )}
  </motion.div>
);

const LibraryPage = () => {
  const [rooms, setRooms] = useState(Array(10).fill(null));
  const [queue, setQueue] = useState([]);
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [spawnInterval, setSpawnInterval] = useState(1.5);
  const [studyTime, setStudyTime] = useState({ min: 2, max: 6 });
  const studentIdRef = useRef(0);
  const queueRef = useRef([]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    if (paused) return;

    const spawnStudent = () => {
      const id = ++studentIdRef.current;
      const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
      const color = colors[id % colors.length];
      const duration = studyTime.min + Math.random() * (studyTime.max - studyTime.min);
      
      const student = { id, color, duration, timestamp: Date.now() };
      
      setQueue(prev => [...prev, student]);
      setStats(prev => ({ ...prev, total: prev.total + 1 }));

      processQueue(student);
    };

    const processQueue = (student) => {
      const checkRoom = setInterval(() => {
        setRooms(prev => {
          const freeIndex = prev.findIndex(room => room === null);
          if (freeIndex === -1) return prev;

          clearInterval(checkRoom);
          
          const newRooms = [...prev];
          newRooms[freeIndex] = student;
          
          setQueue(q => q.filter(s => s.id !== student.id));

          setTimeout(() => {
            setRooms(r => {
              const updated = [...r];
              updated[freeIndex] = null;
              return updated;
            });
            setStats(s => ({ ...s, completed: s.completed + 1 }));
          }, student.duration * 1000);

          return newRooms;
        });
      }, 100);
    };

    const interval = setInterval(spawnStudent, spawnInterval * 1000);
    return () => clearInterval(interval);
  }, [paused, spawnInterval, studyTime]);

  const freeRooms = rooms.filter(r => r === null).length;

  const handleReset = () => {
    setRooms(Array(10).fill(null));
    setQueue([]);
    setStats({ total: 0, completed: 0 });
    studentIdRef.current = 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Biblioteca - Semáforo Contador" icon={Book} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3">
            <h3 className="font-bold mb-4 text-xl">Salas de Estudo (10 disponíveis)</h3>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {rooms.map((student, idx) => (
                <Room key={idx} student={student} number={idx + 1} />
              ))}
            </div>

            {/* Fila */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300">
              <div className="flex items-center gap-2 mb-3">
                <Users size={20} className="text-yellow-700" />
                <h4 className="font-bold text-yellow-900">
                  Fila de Espera ({queue.length})
                </h4>
              </div>
              <div className="flex gap-2 flex-wrap">
                {queue.slice(0, 20).map(student => (
                  <motion.div
                    key={student.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                    style={{ backgroundColor: student.color }}
                  >
                    E{student.id}
                  </motion.div>
                ))}
                {queue.length > 20 && (
                  <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-bold">
                    +{queue.length - 20}
                  </div>
                )}
              </div>
            </div>

            {/* Contador do Semáforo */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="mt-4 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-lg p-6 text-center border-4 border-yellow-600 shadow-xl"
            >
              <div className="text-sm font-semibold text-gray-800 mb-2">
                🔢 SEMÁFORO CONTADOR
              </div>
              <motion.div 
                key={freeRooms}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-7xl font-bold text-gray-900"
              >
                {freeRooms}
              </motion.div>
              <div className="text-sm text-gray-700 mt-2 font-semibold">
                salas disponíveis de 10
              </div>
            </motion.div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold mb-4 text-lg">📊 Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold">Total</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-semibold">Concluídos</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-orange-600" />
                    <span className="text-sm font-semibold">Aguardando</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{queue.length}</span>
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
              <h3 className="font-bold mb-4 text-lg">Configurações</h3>
              <div className="space-y-4">
                <Slider
                  label="Intervalo de Chegada"
                  value={spawnInterval}
                  onChange={setSpawnInterval}
                  min={0.3}
                  max={5}
                />
                <Slider
                  label="Tempo Estudo Min"
                  value={studyTime.min}
                  onChange={(v) => setStudyTime(prev => ({ ...prev, min: v }))}
                  min={0.5}
                  max={5}
                />
                <Slider
                  label="Tempo Estudo Max"
                  value={studyTime.max}
                  onChange={(v) => setStudyTime(prev => ({ ...prev, max: Math.max(v, prev.min + 0.5) }))}
                  min={2}
                  max={15}
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">💡 Conceito</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                O <strong>semáforo contador</strong> gerencia um pool de recursos 
                idênticos (10 salas). Quando todas estão ocupadas, estudantes aguardam 
                na fila até que uma seja liberada.
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Técnica:</strong> Threading.Semaphore(10) com acquire() e release()
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;