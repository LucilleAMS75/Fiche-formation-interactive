import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorSummaryProps {
  errors: { id: string; message: string; label: string }[];
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div 
      role="alert" 
      className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
      aria-labelledby="error-summary-title"
    >
      <div className="flex items-center mb-2">
        <AlertCircle className="text-red-500 mr-2" size={20} />
        <h2 id="error-summary-title" className="text-xl font-bold text-red-800">
          Veuillez corriger les {errors.length} erreur{errors.length > 1 ? 's' : ''} suivante{errors.length > 1 ? 's' : ''} :
        </h2>
      </div>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index}>
            <a 
              href={`#field-${error.id}`}
              className="text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(`field-${error.id}`);
                element?.focus();
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              {error.label} : {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
