import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Lock } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const MutexPage = () => {
  const [threads, setThreads] = useState([
    { id: 1, estado: 'Trabalhando', cor: '#3B82F6' },
    { id: 2, estado: 'Trabalhando', cor: '#EF4444' },
    { id: 3, estado: 'Trabalhando', cor: '#10B981' },
  ]);
  const [mutexLivre, setMutexLivre] = useState(true);
  const [threadDonaRC, setThreadDonaRC] = useState(null);
  const [filaEspera, setFilaEspera] = useState([]);
  const [estadoRC, setEstadoRC] = useState('LIVRE');

  const gerenciarClique = (threadId, acao) => {
    if (acao === 'Tentar Lock') {
      setThreads(prev => prev.map(t => 
        t.id === threadId ? { ...t, estado: 'Tentando Adquirir Lock' } : t
      ));

      setTimeout(() => {
        if (mutexLivre && filaEspera.length === 0) {
          setMutexLivre(false);
          setThreadDonaRC(threadId);
          setEstadoRC('OCUPADA');
          setThreads(prev => prev.map(t => 
            t.id === threadId ? { ...t, estado: 'Na Região Crítica' } : t
          ));
        } else if (mutexLivre && filaEspera.length > 0 && threadId !== filaEspera[0]) {
          if (!filaEspera.includes(threadId)) {
            setFilaEspera(prev => [...prev, threadId]);
          }
          setThreads(prev => prev.map(t => 
            t.id === threadId ? { ...t, estado: 'Esperando Lock' } : t
          ));
        } else {
          if (!filaEspera.includes(threadId)) {
            setFilaEspera(prev => [...prev, threadId]);
          }
          setThreads(prev => prev.map(t => 
            t.id === threadId ? { ...t, estado: 'Esperando Lock' } : t
          ));
        }
      }, 100);

    } else if (acao === 'Liberar Lock') {
      if (threadId === threadDonaRC) {
        setThreadDonaRC(null);
        setEstadoRC('LIVRE');
        setThreads(prev => prev.map(t => 
          t.id === threadId ? { ...t, estado: 'Saiu da RC' } : t
        ));

        if (filaEspera.length > 0) {
          const proximaId = filaEspera[0];
          setFilaEspera(prev => prev.slice(1));
          
          setMutexLivre(false);
          setThreadDonaRC(proximaId);
          setEstadoRC('OCUPADA');
          setThreads(prev => prev.map(t => 
            t.id === proximaId ? { ...t, estado: 'Na Região Crítica' } : t
          ));
        } else {
          setMutexLivre(true);
        }
      }
    }
  };

  const obterAcaoThread = (estado) => {
    if (estado === 'Trabalhando' || estado === 'Saiu da RC') {
      return 'Tentar Lock';
    } else if (estado === 'Na Região Crítica') {
      return 'Liberar Lock';
    } else if (estado === 'Esperando Lock') {
      return 'Bloqueada';
    }
    return '...';
  };

  const handleReset = () => {
    setThreads(prev => prev.map(t => ({ ...t, estado: 'Trabalhando' })));
    setMutexLivre(true);
    setThreadDonaRC(null);
    setFilaEspera([]);
    setEstadoRC('LIVRE');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Simulação de Mutex (Exclusão Mútua)" icon={Lock} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-bold mb-6 text-xl text-gray-800 flex items-center gap-2">
              <Lock size={24} className="text-blue-500" />
              THREADS (Unidades de Execução)
            </h3>

            <div className="space-y-4 mb-8">
              {threads.map((thread) => {
                const acao = obterAcaoThread(thread.estado);
                const isBlocked = acao === 'Bloqueada' || acao === '...';
                
                return (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    {filaEspera.includes(thread.id) && (
                      <div className="absolute -left-6 top-0 bottom-0 w-4 bg-yellow-400 rounded-l-lg"></div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex-1 rounded-lg border-2 border-gray-300 flex items-center justify-between p-4 shadow-md"
                        style={{ backgroundColor: thread.cor }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-lg">T{thread.id}:</span>
                          <span className="text-white font-semibold">{thread.estado}</span>
                        </div>

                        <button
                          onClick={() => gerenciarClique(thread.id, acao)}
                          disabled={isBlocked}
                          className={`px-6 py-2 rounded-lg font-bold border-2 border-white transition-all ${
                            acao === 'Tentar Lock'
                              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                              : acao === 'Liberar Lock'
                              ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {acao}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <motion.div
                animate={{
                  boxShadow: mutexLivre
                    ? '0 0 30px rgba(34, 197, 94, 0.5)'
                    : '0 0 30px rgba(239, 68, 68, 0.5)'
                }}
                className={`p-6 rounded-lg border-4 shadow-xl ${
                  mutexLivre
                    ? 'bg-green-500 border-green-600'
                    : 'bg-red-500 border-red-600'
                }`}
              >
                <h4 className="text-white font-bold text-2xl mb-2 text-center">
                  MUTEX (LOCK)
                </h4>
                <p className="text-white font-semibold text-center">
                  {mutexLivre ? 'LIVRE' : `BLOQUEADO (T${threadDonaRC})`}
                </p>
              </motion.div>

              <motion.div
                animate={{
                  boxShadow: estadoRC === 'LIVRE'
                    ? '0 0 30px rgba(34, 197, 94, 0.5)'
                    : '0 0 30px rgba(239, 68, 68, 0.5)'
                }}
                className={`p-6 rounded-lg border-4 shadow-xl ${
                  estadoRC === 'LIVRE'
                    ? 'bg-green-500 border-green-600'
                    : 'bg-red-500 border-red-600'
                }`}
              >
                <h4 className="text-white font-bold text-2xl mb-2 text-center">
                  REGIÃO CRÍTICA
                </h4>
                <p className="text-white font-semibold text-center">
                  {estadoRC === 'LIVRE' ? 'LIVRE' : `OCUPADA por T${threadDonaRC}`}
                </p>
              </motion.div>
            </div>

            <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300 shadow-md">
              <h4 className="text-gray-800 font-bold text-xl mb-3">FILA DE ESPERA:</h4>
              <div className="flex gap-3 flex-wrap min-h-[60px] items-center">
                {filaEspera.length === 0 ? (
                  <span className="text-gray-600 font-semibold text-lg">Vazia</span>
                ) : (
                  filaEspera.map((tid) => (
                    <motion.div
                      key={tid}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg"
                      style={{ backgroundColor: threads.find(t => t.id === tid)?.cor }}
                    >
                      T{tid}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold mb-4 text-lg">🎮 Controles</h3>
              <div className="space-y-3">
                <Button onClick={handleReset} variant="secondary" icon={RotateCcw}>
                  Reiniciar
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">💡 Conceito: Mutex</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p className="leading-relaxed">
                  <strong className="text-blue-600">Mutex (Mutual Exclusion)</strong> garante 
                  que apenas uma thread pode acessar a região crítica por vez.
                </p>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <strong className="text-blue-700">Como funciona:</strong>
                  <ul className="list-disc ml-4 mt-2 space-y-1 text-gray-700">
                    <li>Thread tenta adquirir o lock (Tentar Lock)</li>
                    <li>Se livre → entra na região crítica</li>
                    <li>Se ocupado → vai para fila de espera</li>
                    <li>Ao liberar → próxima da fila adquire</li>
                  </ul>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <strong className="text-yellow-700">Indicador Visual:</strong>
                  <p className="mt-1 text-gray-700">Barra amarela à esquerda = thread na fila</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <strong className="text-green-700">Técnicas:</strong>
                  <p className="mt-1 text-gray-700">pthread_mutex, std::mutex, threading.Lock</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-4 text-lg">📊 Estados</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Trabalhando / Saiu da RC</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>Esperando Lock (na fila)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Na Região Crítica</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Mutex Bloqueado</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MutexPage;