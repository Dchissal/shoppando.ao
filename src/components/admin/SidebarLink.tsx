import React from 'react';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export function SidebarLink({ icon, label, active, onClick }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
        active 
          ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' 
          : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
      {label}
    </button>
  );
}
