import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const ServiceSelect = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.name === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-full px-4 py-3 h-[56px] text-base bg-slate-800/80 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-slate-200 cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {selectedOption ? (
            <>
              {selectedOption.image && (
                <img src={selectedOption.image} alt={selectedOption.name} className="w-8 h-8 rounded-full object-cover border border-slate-600" />
              )}
              <span className="font-semibold text-slate-200">{selectedOption.name}</span>
            </>
          ) : (
            <span className="text-slate-400">Lütfen bir işlem seçin</span>
          )}
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
          {options.map((option) => (
            <div 
              key={option.id}
              className={`flex items-center gap-4 p-3 cursor-pointer hover:bg-slate-700/50 transition-colors ${value === option.name ? 'bg-slate-700/30' : ''}`}
              onClick={() => {
                onChange(option.name);
                setIsOpen(false);
              }}
            >
              {option.image && (
                <img src={option.image} alt={option.name} className="w-10 h-10 rounded-full object-cover border border-slate-600 shrink-0" />
              )}
              <span className="text-slate-200 flex-1 font-semibold">{option.name}</span>
              {value === option.name && <Check size={18} className="text-yellow-500" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceSelect;
