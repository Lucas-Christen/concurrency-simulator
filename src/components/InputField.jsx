import React from 'react';

const InputField = ({ label, value, onChange, placeholder, type = 'text', maxLength, className = '', disabled = false }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed`}
    />
  </div>
);

export default InputField;