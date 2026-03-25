import React from 'react';
import { Check, Package, Palette, Grid3x3, Image, FileText } from 'lucide-react';

type ProductType = 'simple' | 'variable';

interface Step {
  id: number;
  label: string;
  icon: React.ElementType;
}

const SIMPLE_STEPS: Step[] = [
  { id: 1, label: 'Info', icon: Package },
  { id: 2, label: 'Media', icon: Image },
  { id: 3, label: 'Specs', icon: FileText },
];

const VARIABLE_STEPS: Step[] = [
  { id: 1, label: 'Info', icon: Package },
  { id: 2, label: 'Atributos', icon: Palette },
  { id: 3, label: 'Variantes', icon: Grid3x3 },
  { id: 4, label: 'Media', icon: Image },
  { id: 5, label: 'Specs', icon: FileText },
];

interface WizardStepIndicatorProps {
  currentStep: number;
  productType: ProductType;
  onStepClick?: (step: number) => void;
}

export function WizardStepIndicator({
  currentStep,
  productType,
  onStepClick,
}: WizardStepIndicatorProps) {
  const steps = productType === 'variable' ? VARIABLE_STEPS : SIMPLE_STEPS;

  return (
    <div className="flex items-center justify-center gap-2 relative">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isClickable = onStepClick && isCompleted;

        return (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div
              onClick={() => isClickable && onStepClick(step.id)}
              className={`relative flex flex-col items-center gap-1 ${
                isClickable ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  isCurrent
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-neutral-200 text-neutral-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs font-bold whitespace-nowrap ${
                  isCurrent
                    ? 'text-orange-600'
                    : isCompleted
                    ? 'text-green-600'
                    : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mb-6 transition-colors ${
                  isCompleted ? 'bg-green-500' : 'bg-neutral-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
