import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ListPlus, ListMinus, Trash2, Box } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import InputField from '../components/InputField'; // Vamos criar este componente

// --- Constantes Visuais (Ajuste conforme necessário) ---
const LARGURA_BLOCO = 50;
const ALTURA_BLOCO = 30;


// --- Componente da Página ---
const StaticDynamicListPage = () => {
  // Estado Lista Estática
  const [staticSizeInput, setStaticSizeInput] = useState('');
  const [staticList, setStaticList] = useState([]);
  const [isStaticAllocated, setIsStaticAllocated] = useState(false);

  // Estado Lista Dinâmica
  const [dynamicValueInput, setDynamicValueInput] = useState('');
  const [dynamicList, setDynamicList] = useState([]);

  // --- Funções Lista Estática ---
  const handleCreateStatic = () => {
    const size = parseInt(staticSizeInput, 10);
    if (isNaN(size) || size <= 0 || size > 50) { // Limite de 50 para visualização
      alert('Tamanho inválido. Insira um número entre 1 e 50.');
      return;
    }
    setStaticList(Array(size).fill(null));
    setIsStaticAllocated(true);
    setStaticSizeInput('');
  };

  const handleFillOneStatic = () => {
    const indexToFill = staticList.findIndex(val => val === null);
    if (indexToFill !== -1) {
      const newList = [...staticList];
      newList[indexToFill] = Math.floor(Math.random() * 100); // Valores 0-99
      setStaticList(newList);
    }
  };

  const handleFillAllStatic = () => {
    setStaticList(staticList.map(val => val === null ? Math.floor(Math.random() * 100) : val));
  };

  const handleRemoveOneStatic = () => {
    const indexToRemove = staticList.findLastIndex(val => val !== null);
    if (indexToRemove !== -1) {
      const newList = [...staticList];
      newList[indexToRemove] = null;
      setStaticList(newList);
    }
  };

  const handleClearStatic = () => {
    setStaticList([]);
    setIsStaticAllocated(false);
  };

  // --- Funções Lista Dinâmica ---
  const handleInsertDynamic = () => {
    const value = parseInt(dynamicValueInput, 10);
     if (isNaN(value) || value < 0 || value > 999) {
       alert('Valor inválido. Insira um número entre 0 e 999.');
       return;
     }
    setDynamicList(prev => [...prev, value]);
    setDynamicValueInput('');
  };

  const handleRemoveLastDynamic = () => {
    setDynamicList(prev => prev.slice(0, -1));
  };

  const handleClearDynamic = () => {
    setDynamicList([]);
  };

  // --- Função Auxiliar para Desenhar Blocos ---
  const renderListBlocks = (list, colorClass, isStatic = false) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {list.map((value, index) => (
          <motion.div
            key={isStatic ? `static-${index}` : `dynamic-${index}-${value}-${Math.random()}`} // Chave dinâmica para animação
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`relative flex items-center justify-center rounded border border-gray-400 shadow-sm ${value === null ? 'bg-gray-300' : colorClass}`}
            style={{ width: LARGURA_BLOCO, height: ALTURA_BLOCO }}
          >
            <span className={`text-xs font-semibold ${value === null ? 'text-gray-500' : 'text-white'}`}>
              {value === null ? 'Livre' : value}
            </span>
            <span className="absolute -bottom-4 text-gray-500 text-[10px]">[{index}]</span>
          </motion.div>
        ))}
         {/* Espaços vazios para lista estática se desalocada */}
         {isStatic && !isStaticAllocated && (
             <div className="text-gray-500 italic">Lista não alocada</div>
         )}
      </div>
    );
  };

  // Verificações de estado para desabilitar botões
  const canFillStatic = isStaticAllocated && staticList.some(v => v === null);
  const canRemoveStatic = staticList.some(v => v !== null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Lista Estática vs Dinâmica" icon={List} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Coluna Lista Estática */}
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Lista Estática</h2>
            <p className="text-sm text-gray-600 mb-4 text-center">Tamanho fixo definido na criação. Posições pré-alocadas.</p>

            <div className="flex gap-2 mb-4 items-end">
              <InputField
                label="Tamanho (1-50):"
                value={staticSizeInput}
                onChange={(e) => setStaticSizeInput(e.target.value.replace(/\D/,''))} // Aceita apenas números
                placeholder="N"
                type="number"
                maxLength={2}
                className="flex-grow"
                disabled={isStaticAllocated}
              />
              <Button
                onClick={handleCreateStatic}
                variant="primary"
                icon={Box}
                disabled={isStaticAllocated || !staticSizeInput}
                className="h-10"
              >
                Criar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <Button onClick={handleFillOneStatic} variant="success" icon={ListPlus} disabled={!canFillStatic}>Inserir 1</Button>
              <Button onClick={handleFillAllStatic} variant="success" icon={ListPlus} disabled={!canFillStatic}>Inserir Todos</Button>
              <Button onClick={handleRemoveOneStatic} variant="warning" icon={ListMinus} disabled={!canRemoveStatic}>Remover 1</Button>
              <Button onClick={handleClearStatic} variant="danger" icon={Trash2} disabled={!isStaticAllocated}>Limpar</Button>
            </div>

            <div className="bg-gray-200 p-4 rounded min-h-[150px] flex items-center justify-center">
              <AnimatePresence>
                {renderListBlocks(staticList, 'bg-green-600', true)}
              </AnimatePresence>
            </div>
             <p className="text-sm text-gray-600 mt-2 text-center">Tamanho Alocado: {staticList.length}</p>
          </Card>

          {/* Coluna Lista Dinâmica */}
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Lista Dinâmica</h2>
            <p className="text-sm text-gray-600 mb-4 text-center">Cresce e diminui conforme a necessidade. Aloca memória sob demanda.</p>

             <div className="flex gap-2 mb-4 items-end">
               <InputField
                 label="Valor (0-999):"
                 value={dynamicValueInput}
                 onChange={(e) => setDynamicValueInput(e.target.value.replace(/\D/,''))}
                 placeholder="Val"
                 type="number"
                 maxLength={3}
                 className="flex-grow"
               />
              <Button
                onClick={handleInsertDynamic}
                variant="primary"
                icon={ListPlus}
                disabled={!dynamicValueInput}
                className="h-10"
              >
                Inserir
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
               <Button onClick={handleRemoveLastDynamic} variant="warning" icon={ListMinus} disabled={dynamicList.length === 0}>Remover Último</Button>
               <Button onClick={handleClearDynamic} variant="danger" icon={Trash2} disabled={dynamicList.length === 0}>Limpar Tudo</Button>
            </div>

            <div className="bg-gray-200 p-4 rounded min-h-[150px] flex items-center justify-center">
               <AnimatePresence>
                  {renderListBlocks(dynamicList, 'bg-blue-600', false)}
               </AnimatePresence>
            </div>
             <p className="text-sm text-gray-600 mt-2 text-center">Tamanho Atual: {dynamicList.length}</p>
          </Card>

        </div>

         {/* Card de Explicação */}
         <Card className="mt-8">
             <h3 className="font-bold mb-4 text-lg">💡 Conceitos</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                 <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                     <h4 className="font-bold text-green-800 mb-2">Lista Estática (Array)</h4>
                     <ul className="list-disc ml-4 space-y-1 text-gray-700">
                         <li>Tamanho definido na declaração/criação e geralmente não pode ser alterado.</li>
                         <li>Memória alocada de forma contígua (um bloco só).</li>
                         <li>Acesso rápido a elementos por índice (O(1)).</li>
                         <li>Inserir/Remover no meio pode ser custoso (O(n)) pois exige deslocamento.</li>
                         <li>Pode haver desperdício de memória se não totalmente utilizada.</li>
                         <li><strong>Exemplo:</strong> `int meuArray[10];` em C.</li>
                     </ul>
                 </div>
                 <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                     <h4 className="font-bold text-blue-800 mb-2">Lista Dinâmica (Lista Ligada/Vetor Dinâmico)</h4>
                      <ul className="list-disc ml-4 space-y-1 text-gray-700">
                          <li>Tamanho pode aumentar ou diminuir durante a execução.</li>
                          <li>Memória alocada sob demanda, não necessariamente contígua (lista ligada) ou realocada em blocos maiores (vetor dinâmico).</li>
                          <li>Acesso por índice pode ser mais lento (O(n) em lista ligada, O(1) amortizado em vetor dinâmico).</li>
                          <li>Inserir/Remover no final é geralmente rápido (O(1) ou O(1) amortizado).</li>
                          <li>Usa memória de forma mais flexível.</li>
                          <li><strong>Exemplo:</strong> `ArrayList` em Java, `List` em Python, `std::vector` em C++.</li>
                      </ul>
                 </div>
             </div>
             <p className="mt-4 text-sm text-gray-600">
                 A escolha entre lista estática e dinâmica depende dos requisitos da aplicação, como a previsibilidade do tamanho, frequência de inserções/remoções e necessidade de acesso rápido por índice.
             </p>
         </Card>

      </div>
    </div>
  );
};

export default StaticDynamicListPage;