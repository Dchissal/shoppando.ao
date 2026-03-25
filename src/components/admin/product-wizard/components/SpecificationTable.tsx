import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ProductSpecification } from '../../../../types';

interface SpecificationTableProps {
  specifications: ProductSpecification[];
  onChange: (specifications: ProductSpecification[]) => void;
}

const COMMON_SPECS: { key: string; group: string }[] = [
  { key: 'Marca', group: 'Geral' },
  { key: 'Modelo', group: 'Geral' },
  { key: 'Garantia', group: 'Geral' },
  { key: 'Peso', group: 'Dimensões' },
  { key: 'Dimensões', group: 'Dimensões' },
  { key: 'Material', group: 'Materiais' },
  { key: 'Cor', group: 'Aparência' },
  // Eletrónicos
  { key: 'Processador', group: 'Hardware' },
  { key: 'RAM', group: 'Hardware' },
  { key: 'Armazenamento', group: 'Hardware' },
  { key: 'Bateria', group: 'Bateria' },
  { key: 'Ecrã', group: 'Display' },
  { key: 'Câmara', group: 'Câmara' },
  { key: 'Conectividade', group: 'Conectividade' },
  { key: 'Bluetooth', group: 'Conectividade' },
  { key: 'WiFi', group: 'Conectividade' },
];

export function SpecificationTable({
  specifications,
  onChange,
}: SpecificationTableProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const addSpecification = (key: string = '', value: string = '', group: string = '') => {
    const newSpec: ProductSpecification = { key, value, group };
    onChange([...specifications, newSpec]);
    setShowSuggestions(false);
  };

  const updateSpecification = (
    index: number,
    field: keyof ProductSpecification,
    value: string
  ) => {
    const updated = specifications.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec
    );
    onChange(updated);
  };

  const removeSpecification = (index: number) => {
    onChange(specifications.filter((_, i) => i !== index));
  };

  const availableSuggestions = COMMON_SPECS.filter(
    (s) => !specifications.some((spec) => spec.key === s.key)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest">
          Especificações Técnicas
        </label>
        <span className="text-xs text-neutral-400">
          {specifications.length} especificação{specifications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabela de especificações */}
      {specifications.length > 0 && (
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="px-3 py-2 text-left text-[10px] font-black text-neutral-400 uppercase">
                  Propriedade
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-black text-neutral-400 uppercase">
                  Valor
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-black text-neutral-400 uppercase w-24">
                  Grupo
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {specifications.map((spec, index) => (
                <tr key={index} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      placeholder="Ex: Processador"
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:border-orange-500 outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      placeholder="Ex: Apple A17 Pro"
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:border-orange-500 outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={spec.group || ''}
                      onChange={(e) => updateSpecification(index, 'group', e.target.value)}
                      placeholder="Grupo"
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:border-orange-500 outline-none"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adicionar especificação */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addSpecification()}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar Campo
          </button>

          {availableSuggestions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="px-4 py-2 text-neutral-500 hover:text-orange-600 text-sm font-medium transition-colors"
            >
              {showSuggestions ? 'Esconder sugestões' : 'Ver sugestões'}
            </button>
          )}
        </div>

        {/* Sugestões */}
        {showSuggestions && availableSuggestions.length > 0 && (
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <p className="text-xs text-neutral-500 mb-2">
              Clica para adicionar:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableSuggestions.map((suggestion) => (
                <button
                  key={suggestion.key}
                  type="button"
                  onClick={() => addSpecification(suggestion.key, '', suggestion.group)}
                  className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
                >
                  {suggestion.key}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
