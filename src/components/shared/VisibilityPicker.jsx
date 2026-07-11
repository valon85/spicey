import React from 'react';
import { Globe, Users, Lock } from 'lucide-react';

const OPTIONS = [
  {
    value: 'public',
    label: 'Public',
    sublabel: 'Everyone can see',
    icon: Globe,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.4)',
  },
  {
    value: 'friends',
    label: 'Friends',
    sublabel: 'Only followers',
    icon: Users,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    border: 'rgba(59,130,246,0.4)',
  },
  {
    value: 'private',
    label: 'Private',
    sublabel: 'Only me',
    icon: Lock,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.4)',
  },
];

export default function VisibilityPicker({ value = 'public', onChange }) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(opt => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all active:scale-95"
            style={{
              background: active ? opt.bg : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${active ? opt.border : 'rgba(255,255,255,0.1)'}`,
              boxShadow: active ? `0 0 14px ${opt.bg}` : 'none',
            }}
          >
            <Icon className="w-4 h-4" style={{ color: active ? opt.color : 'rgba(255,255,255,0.4)' }} />
            <span className="text-[11px] font-bold" style={{ color: active ? opt.color : 'rgba(255,255,255,0.5)' }}>
              {opt.label}
            </span>
            <span className="text-[9px]" style={{ color: active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}>
              {opt.sublabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function visibilityIcon(value) {
  const opt = OPTIONS.find(o => o.value === value);
  if (!opt) return null;
  const Icon = opt.icon;
  return <Icon className="w-3 h-3" style={{ color: opt.color }} />;
}