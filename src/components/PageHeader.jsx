import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ title, icon: Icon }) => (
  <div className="mb-8">
    <Link 
      to="/" 
      className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-2 mb-4 font-semibold"
    >
      <ArrowLeft size={20} />
      Voltar ao Início
    </Link>
    <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
      {Icon && <Icon size={40} />}
      {title}
    </h1>
  </div>
);

export default PageHeader;