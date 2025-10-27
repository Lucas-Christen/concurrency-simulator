import React from 'react';

// Atualizado para incluir a prop 'unit'
const Slider = ({ label, value, onChange, min, max, step = 0.1, unit = 's' }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        {/* Mostra unidade apenas se ela existir */}
        <span className="text-gray-600 font-semibold">{value.toFixed(unit ? 1 : 0)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-300 rounded-lg cursor-pointer accent-blue-500"
      />
    </div>
  );
};

export default Slider;