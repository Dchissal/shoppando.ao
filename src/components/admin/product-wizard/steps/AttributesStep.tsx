import React from 'react';
import { Palette, Ruler, HardDrive, Info } from 'lucide-react';
import {
  ProductAttribute,
  AttributeType,
  CATEGORY_ATTRIBUTES,
  ATTRIBUTE_LABELS,
} from '../../../../types';
import { AttributePicker } from '../components/AttributePicker';

interface AttributesStepProps {
  category: string;
  attributes: ProductAttribute[];
  onUpdate: (attributes: ProductAttribute[]) => void;
}

const ATTRIBUTE_ICONS: Record<AttributeType, React.ElementType> = {
  color: Palette,
  size: Ruler,
  capacity: HardDrive,
};

export function AttributesStep({
  category,
  attributes,
  onUpdate,
}: AttributesStepProps) {
  const availableTypes = CATEGORY_ATTRIBUTES[category] || [];

  const getAttributeValues = (type: AttributeType): string[] => {
    const attr = attributes.find((a) => a.type === type);
    return attr?.values || [];
  };

  const updateAttributeValues = (type: AttributeType, values: string[]) => {
    const existing = attributes.find((a) => a.type === type);

    if (values.length === 0) {
      // Remove atributo se não tiver valores
      onUpdate(attributes.filter((a) => a.type !== type));
    } else if (existing) {
      // Actualiza valores existentes
      onUpdate(
        attributes.map((a) => (a.type === type ? { ...a, values } : a))
      );
    } else {
      // Adiciona novo atributo
      onUpdate([...attributes, { type, values }]);
    }
  };

  // Calcular número de variantes
  const totalCombinations = attributes.reduce((acc, attr) => {
    return acc * (attr.values.length || 1);
  }, attributes.length > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">Atributos do Produto</h3>
            <p className="text-sm text-neutral-600 mt-1">
              Seleciona os atributos que definem as variações deste produto.
              Para a categoria <strong>{category}</strong>, podes usar:{' '}
              {availableTypes.map((t) => ATTRIBUTE_LABELS[t]).join(', ')}.
            </p>
          </div>
        </div>
      </div>

      {/* Contagem de variantes */}
      {totalCombinations > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Info className="w-5 h-5 text-blue-500" />
          <p className="text-sm text-blue-800">
            <strong>{totalCombinations}</strong> variante{totalCombinations > 1 ? 's' : ''} será{totalCombinations > 1 ? 'ão' : ''} criada{totalCombinations > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Pickers por tipo de atributo */}
      <div className="space-y-8">
        {availableTypes.map((type) => {
          const Icon = ATTRIBUTE_ICONS[type];
          const values = getAttributeValues(type);

          return (
            <div
              key={type}
              className="p-5 bg-white border border-neutral-200 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">
                    {ATTRIBUTE_LABELS[type]}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Seleciona os valores disponíveis para este atributo
                  </p>
                </div>
              </div>

              <AttributePicker
                type={type}
                selectedValues={values}
                onChange={(newValues) => updateAttributeValues(type, newValues)}
              />
            </div>
          );
        })}
      </div>

      {/* Preview de combinações */}
      {totalCombinations > 0 && totalCombinations <= 20 && (
        <div className="space-y-3">
          <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest">
            Preview das Variantes
          </label>
          <div className="flex flex-wrap gap-2">
            {generateCombinationPreviews(attributes).map((combo, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg"
              >
                {combo}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Gerar previews das combinações
function generateCombinationPreviews(attributes: ProductAttribute[]): string[] {
  if (attributes.length === 0) return [];

  const valueSets = attributes.map((a) => a.values);

  // Produto cartesiano simplificado
  const combinations: string[][] = valueSets.reduce<string[][]>(
    (acc, values) => {
      if (acc.length === 0) return values.map((v) => [v]);
      return acc.flatMap((existing) => values.map((v) => [...existing, v]));
    },
    []
  );

  return combinations.map((combo) => combo.join(' / '));
}
