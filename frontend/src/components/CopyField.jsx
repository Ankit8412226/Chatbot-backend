import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CopyField = ({ 
  value, 
  label, 
  placeholder = "No value",
  className = "",
  showValue = true,
  maskValue = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const displayValue = () => {
    if (!value) return placeholder;
    if (maskValue) {
      return `${value.substring(0, 12)}...${value.slice(-4)}`;
    }
    return value;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <div className="flex-1 min-w-0">
          {showValue ? (
            <input
              type="text"
              value={displayValue()}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700 focus:outline-none"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700">
              {displayValue()}
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={!value}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CopyField;