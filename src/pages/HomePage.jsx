import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Traffic, Book, Factory, UtensilsCrossed, Zap, ArrowRight } from 'lucide-react';
import Card from '../components/Card';

const HomePage = () => {
  const navigate = useNavigate();
  
  const simulations = [
    {
      title: 'Semáforos de Trânsito',
      description: 'Demonstra exclusão mútua com mutex/condition',
      icon: Traffic,
      color: 'bg-red-500',
      path: '/semaforos'
    },
    {
      title: 'Biblioteca',
      description: 'Pool de recursos com semáforo contador',
      icon: Book,
      color: 'bg-blue-500',
      path: '/biblioteca'
    },
    {
      title: 'Produtor-Consumidor',
      description: 'Problema clássico de sincronização',
      icon: Factory,
      color: 'bg-green-500',
      path: '/produtor-consumidor'
    },
    {
      title: 'Filósofos Jantando',
      description: 'Demonstração de deadlock e solução',
      icon: UtensilsCrossed,
      color: 'bg-purple-500',
      path: '/filosofos'
    },
    {
      title: 'Concorrência vs Paralelismo',
      description: 'Visualização da diferença conceitual',
      icon: Zap,
      color: 'bg-yellow-500',
      path: '/concorrencia-paralelismo'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            🔄 Simulador de Concorrência
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Aprenda conceitos de concorrência e sincronização através de 
            simulações visuais e interativas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {simulations.map((sim, index) => (
            <motion.div
              key={sim.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="cursor-pointer"
              onClick={() => navigate(sim.path)}
            >
              <Card className="h-full hover:shadow-2xl transition-all">
                <div className={`${sim.color} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>
                  <sim.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">{sim.title}</h3>
                <p className="text-gray-600 mb-4">{sim.description}</p>
                <div className="mt-4 flex items-center text-blue-500 font-semibold">
                  Explorar <ArrowRight size={18} className="ml-2" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Sobre o Simulador</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Este simulador foi criado para facilitar o aprendizado de conceitos de 
            <strong> concorrência e sincronização</strong> através de visualizações interativas.
            Cada simulação demonstra um problema clássico da ciência da computação, permitindo
            que você ajuste parâmetros e observe o comportamento em tempo real.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">🎮 Interativo</h3>
              <p className="text-sm text-gray-600">Controle a velocidade, pause e reinicie as simulações</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">👁️ Visual</h3>
              <p className="text-sm text-gray-600">Veja os conceitos ganharem vida com animações</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-800 mb-2">📚 Educacional</h3>
              <p className="text-sm text-gray-600">Cada exemplo explica o conceito por trás</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;