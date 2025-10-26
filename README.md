# 🔄 Simulador de Concorrência - React

Aplicação web interativa para aprender conceitos de concorrência e sincronização através de visualizações animadas.

## 🚀 Como Executar

### 1. Criar o Projeto

```bash
npx create-react-app concurrency-simulator
cd concurrency-simulator
```

### 2. Instalar Dependências

```bash
npm install react-router-dom framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configurar Tailwind CSS

Edite `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

### 4. Copiar Arquivos

Copie cada seção deste arquivo para os respectivos arquivos:

```
src/
├── App.js
├── index.js
├── index.css
├── components/
│   ├── Button.jsx
│   ├── Slider.jsx
│   ├── Card.jsx
│   └── PageHeader.jsx
└── pages/
    ├── HomePage.jsx
    ├── TrafficLightsPage.jsx
    ├── LibraryPage.jsx
    ├── ProducerConsumerPage.jsx
    ├── PhilosophersPage.jsx
    └── ConcurrencyVsParallelismPage.jsx
```

### 5. Executar

```bash
npm start
```

Acesse: http://localhost:3000

## 🎯 Simulações Disponíveis

### 1. 🚦 Semáforos de Trânsito
- Demonstra exclusão mútua (Mutex)
- Threading.Condition com wait() e notify()

### 2. 📚 Biblioteca (Semáforo Contador)
- Pool de recursos (10 salas)
- Threading.Semaphore com acquire() e release()

### 3. 🏭 Produtor-Consumidor
- Buffer compartilhado de tamanho limitado
- Sincronização entre produtor e consumidor

### 4. 🍝 Filósofos Jantando
- Problema clássico de deadlock
- Solução com quebra de circularidade

### 5. ⚡ Concorrência vs Paralelismo
- Visualização da diferença conceitual
- Time-sharing vs execução paralela

## 🛠️ Tecnologias

- **React 18**: Framework UI
- **React Router**: Navegação entre páginas
- **Framer Motion**: Animações suaves
- **Tailwind CSS**: Estilização
- **Lucide React**: Ícones

## 📝 Estrutura do Código

Cada simulação é uma página independente que pode ser:
- Pausada/Retomada
- Reiniciada
- Configurada (velocidades, tamanhos, etc.)

Componentes reutilizáveis:
- `Button`: Botões com ícones e variantes
- `Slider`: Controles deslizantes
- `Card`: Container com sombra
- `PageHeader`: Cabeçalho com navegação

## 🎓 Uso Educacional

Este simulador é ideal para:
- Aulas de Sistemas Operacionais
- Programação Concorrente
- Arquitetura de Computadores
- Workshops e palestras

Cada simulação inclui explicação do conceito e técnicas utilizadas.

## 📄 Licença

Livre para uso educacional.

---

**Criado com ❤️ para ensinar concorrência de forma visual e interativa!**