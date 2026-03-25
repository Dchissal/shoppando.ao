import React from 'react';
import { Check, Plus } from 'lucide-react';
import {
  AttributeType,
  ATTRIBUTE_OPTIONS,
  ATTRIBUTE_LABELS,
  COLOR_HEX_MAP,
} from '../../../../types';

interface AttributePickerProps {
  type: AttributeType;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  allowCustom?: boolean;
}

export function AttributePicker({
  type,
  selectedValues,
  onChange,
  allowCustom = true,
}: AttributePickerProps) {
  const [customValue, setCustomValue] = React.useState('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  const options = ATTRIBUTE_OPTIONS[type];
  const label = ATTRIBUTE_LABELS[type];

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const addCustomValue = () => {
    const trimmed = customValue.trim();
    if (trimmed && !selectedValues.includes(trimmed)) {
      onChange([...selectedValues, trimmed]);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const renderColorOption = (color: string) => {
    const isSelected = selectedValues.includes(color);
    const hex = COLOR_HEX_MAP[color] || '#9CA3AF';
    const isLight = hex === '#FFFFFF' || hex === '#EAB308' || hex === '#D4AF37';

    return (
      <button
        key={color}
        type="button"
        onClick={() => toggleValue(color)}
        className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
          isSelected
            ? 'bg-orange-50 ring-2 ring-orange-500'
            : 'hover:bg-neutral-100'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform ${
            isSelected ? 'scale-110' : ''
          } ${isLight ? 'border-neutral-200' : 'border-transparent'}`}
          style={{ backgroundColor: hex }}
        >
          {isSelected && (
            <Check
              className={`w-5 h-5 ${isLight ? 'text-neutral-800' : 'text-white'}`}
            />
          )}
        </div>
        <span className="text-[10px] font-bold text-neutral-600 truncate max-w-[60px]">
          {color}
        </span>
      </button>
    );
  };

  const renderSizeOption = (size: string) => {
    const isSelected = selectedValues.includes(size);

    return (
      <button
        key={size}
        type="button"
        onClick={() => toggleValue(size)}
        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
          isSelected
            ? 'border-orange-500 bg-orange-50 text-orange-600'
            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
        }`}
      >
        {size}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest">
          {label}
        </label>
        {selectedValues.length > 0 && (
          <span className="text-xs font-bold text-orange-600">
            {selectedValues.length} selecionado{selectedValues.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className={`flex flex-wrap gap-2 ${type === 'color' ? '' : 'gap-2'}`}>
        {options.map((option) =>
          type === 'color'
            ? renderColorOption(option)
            : renderSizeOption(option)
        )}

        {allowCustom && (
          <>
            {showCustomInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder={`Novo ${label.toLowerCase()}`}
                  className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none w-32"
                  onKeyDown={(e) => e.key === 'Enter' && addCustomValue()}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={addCustomValue}
                  className="px-3 py-2 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Outro
              </button>
            )}
          </>
        )}
      </div>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100">
          {selectedValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg"
            >
              {type === 'color' && (
                <span
                  className="w-3 h-3 rounded-full border border-orange-200"
                  style={{ backgroundColor: COLOR_HEX_MAP[value] || '#9CA3AF' }}
                />
              )}
              {value}
              <button
                type="button"
                onClick={() => toggleValue(value)}
                className="ml-0.5 hover:text-red-600"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
