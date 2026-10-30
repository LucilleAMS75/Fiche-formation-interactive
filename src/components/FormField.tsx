import React from 'react';
import { Tooltip } from './Tooltip';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'textarea';
  required?: boolean;
  helpText: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  labelClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = 'text',
  required = true,
  helpText,
  value,
  onChange,
  error,
  placeholder,
  labelClassName,
}) => {
  const inputId = `field-${id}`;
  const helpId = `help-${id}`;
  const errorId = `error-${id}`;

  const commonProps = {
    id: inputId,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    required,
    'aria-required': required,
    'aria-describedby': `${helpId} ${error ? errorId : ''}`,
    'aria-invalid': !!error,
    placeholder,
    className: cn(
      "w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none",
      error ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-slate-300"
    ),
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <label htmlFor={inputId} className={cn("block text-slate-700", labelClassName || "text-sm font-semibold")}>
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
        {helpText && <Tooltip content={helpText} id={helpId} />}
      </div>
      
      {type === 'text' ? (
        <input type="text" {...commonProps} />
      ) : (
        <textarea {...commonProps} rows={4} />
      )}

      {error && (
        <p id={errorId} className="text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
