import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Image,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import Feed from './Feed';

const STORAGE_KEY = 'spicey_feed_visual_designer';

const DEFAULT_SECTIONS = {
  logo: {
    label: 'Logo',
    kind: 'image',
    x: 96,
    y: 30,
    w: 198,
    h: 74,
    radius: 18,
    glow: true,
    stroke: true,
    glass: false,
    hidden: false,
    src: 'https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/55bf52a6a_841b8be5-b1e6-4719-9a32-36fafbb51084.png',
  },
  search: {
    label: 'Search Bar',
    kind: 'shape',
    x: 22,
    y: 132,
    w: 346,
    h: 42,
    radius: 24,
    glow: false,
    stroke: true,
    glass: true,
    hidden: false,
  },
  stories: {
    label: 'Story Section',
    kind: 'shape',
    x: 12,
    y: 185,
    w: 366,
    h: 104,
    radius: 24,
    glow: false,
    stroke: true,
    glass: true,
    hidden: false,
  },
  trending: {
    label: 'Trending Section',
    kind: 'shape',
    x: 14,
    y: 302,
    w: 362,
    h: 92,
    radius: 22,
    glow: true,
    stroke: false,
    glass: false,
    hidden: false,
  },
  feedPhoto: {
    label: 'Feed Photo',
    kind: 'image',
    x: 18,
    y: 430,
    w: 354,
    h: 360,
    radius: 34,
    glow: false,
    stroke: true,
    glass: true,
    hidden: false,
    src: '',
  },
  postText: {
    label: 'Post Text',
    kind: 'text',
    x: 28,
    y: 804,
    w: 330,
    h: 76,
    radius: 16,
    glow: false,
    stroke: false,
    glass: false,
    hidden: false,
    text: 'Edit this caption, change font, move it, or delete it.',
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#ffffff',
    weight: 800,
  },
  bottomNav: {
    label: 'Bottom Nav',
    kind: 'shape',
    x: 22,
    y: 612,
    w: 346,
    h: 78,
    radius: 28,
    glow: false,
    stroke: true,
    glass: true,
    hidden: false,
  },
};

const SECTION_ORDER = ['logo', 'search', 'stories', 'trending', 'feedPhoto', 'postText', 'bottomNav'];
const FONT_OPTIONS = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadSections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SECTIONS;
    const saved = JSON.parse(raw);
    return Object.fromEntries(
      SECTION_ORDER.map((id) => [id, { ...DEFAULT_SECTIONS[id], ...(saved[id] || {}) }])
    );
  } catch (_) {
    return DEFAULT_SECTIONS;
  }
}

function ControlLabel({ children }) {
  return <label className="block text-[11px] font-bold uppercase tracking-wide text-white/45 mb-2">{children}</label>;
}

function RangeControl({ label, value, min, max, step = 1, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <ControlLabel>{label}</ControlLabel>
        <span className="text-xs font-bold text-white/60">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#ff5500]"
      />
    </div>
  );
}

function ToolButton({ active, icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-extrabold active:scale-95 transition-transform"
      style={{
        background: active
          ? danger ? 'rgba(239,68,68,0.20)' : 'rgba(255,85,0,0.18)'
          : 'rgba(255,255,255,0.06)',
        border: active
          ? danger ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,85,0,0.5)'
          : '1px solid rgba(255,255,255,0.10)',
        color: active ? '#fff' : 'rgba(255,255,255,0.58)',
      }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function sectionStyle(section, selected) {
  const radius = section.radius ?? 16;
  const baseShadow = section.glow ? '0 0 26px rgba(255,85,0,0.44), 0 16px 44px rgba(0,0,0,0.36)' : '0 12px 34px rgba(0,0,0,0.24)';
  return {
    left: section.x,
    top: section.y,
    width: section.w,
    height: section.h,
    borderRadius: radius,
    border: selected
      ? '2px solid #ff5500'
      : section.stroke ? '1.5px solid rgba(255,255,255,0.34)' : '1px dashed rgba(255,255,255,0.22)',
    boxShadow: selected ? `${baseShadow}, 0 0 0 4px rgba(255,85,0,0.18)` : baseShadow,
    background: section.glass
      ? 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.055))'
      : 'rgba(255,85,0,0.035)',
    backdropFilter: section.glass ? 'blur(18px) saturate(1.35)' : undefined,
    WebkitBackdropFilter: section.glass ? 'blur(18px) saturate(1.35)' : undefined,
    opacity: section.hidden ? 0.28 : 1,
  };
}

function EditableSection({ id, section, selected, editMode, onSelect, onMove }) {
  const dragRef = useRef(null);

  const beginDrag = (event) => {
    if (!editMode) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(id);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      itemX: section.x,
      itemY: section.y,
    };

    const move = (moveEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      onMove(id, {
        x: clamp(Math.round(dragRef.current.itemX + dx), -80, window.innerWidth - 40),
        y: clamp(Math.round(dragRef.current.itemY + dy), 0, Math.max(window.innerHeight + window.scrollY, 1100)),
      });
    };

    const end = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
  };

  if (!editMode && section.hidden) return null;

  return (
    <button
      type="button"
      onPointerDown={beginDrag}
      onClick={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        onSelect(id);
      }}
      className="absolute text-left touch-none overflow-hidden"
      style={{
        ...sectionStyle(section, selected),
        cursor: editMode ? 'grab' : 'default',
        pointerEvents: editMode ? 'auto' : 'none',
        zIndex: selected ? 120 : 90,
      }}
    >
      {section.kind === 'image' && section.src && !section.hidden && (
        <img
          src={section.src}
          alt={section.label}
          draggable={false}
          className="w-full h-full object-contain"
          style={{
            borderRadius: Math.max(0, (section.radius ?? 16) - 2),
            filter: section.glass ? 'saturate(1.1) contrast(1.03)' : undefined,
          }}
        />
      )}

      {section.kind === 'text' && !section.hidden && (
        <div
          className="w-full h-full flex items-center px-3 overflow-hidden"
          style={{
            color: section.color,
            fontSize: section.fontSize,
            fontFamily: section.fontFamily,
            fontWeight: section.weight,
            lineHeight: 1.14,
          }}
        >
          {section.text}
        </div>
      )}

      {section.glass && !section.hidden && (
        <>
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: Math.max(0, (section.radius ?? 16) - 2),
              background: 'linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.03) 46%, rgba(255,255,255,0.10))',
              mixBlendMode: 'screen',
            }}
          />
          <span
            className="absolute left-5 right-5 top-3 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)' }}
          />
        </>
      )}

      {editMode && (
        <span className="absolute left-2 top-2 px-2 py-1 rounded-lg text-[10px] font-black text-white"
          style={{ background: selected ? '#ff5500' : 'rgba(0,0,0,0.58)' }}>
          {section.label}
        </span>
      )}
    </button>
  );
}

export default function AdminVisualEditor() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [sections, setSections] = useState(loadSections);
  const [selectedId, setSelectedId] = useState('logo');
  const [editMode, setEditMode] = useState(true);

  const selected = sections[selectedId];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  }, [sections]);

  const updateSelected = (patch) => {
    setSections((prev) => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], ...patch },
    }));
  };

  const moveSection = (id, patch) => {
    setSections((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const saveDesign = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    toast.success('Feed design saved on this device');
  };

  const resetDesign = () => {
    setSections(DEFAULT_SECTIONS);
    setSelectedId('logo');
    toast.success('Feed designer reset');
  };

  const handleImagePick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateSelected({
        src: reader.result,
        kind: selected.kind === 'shape' ? 'image' : selected.kind,
        hidden: false,
      });
      toast.success(`${selected.label} image uploaded`);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const SelectedIcon = useMemo(() => {
    if (selected.kind === 'image') return Image;
    if (selected.kind === 'text') return Type;
    return Palette;
  }, [selected.kind]);

  return (
    <div className="min-h-screen" style={{ background: '#030006' }}>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <Feed />

        <div
          className="fixed inset-x-0 top-0 z-[240] flex items-center gap-2 px-3 py-3"
          style={{
            paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
            background: 'linear-gradient(180deg, rgba(3,0,6,0.94), rgba(3,0,6,0.50), transparent)',
            pointerEvents: 'auto',
          }}
        >
          <button onClick={() => navigate('/admin')} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="h-10 px-4 rounded-full flex items-center gap-2 text-sm font-extrabold text-white"
            style={{ background: 'rgba(255,255,255,0.10)' }}
          >
            Home
          </button>
          <button
            onClick={() => setEditMode((value) => !value)}
            className="h-10 px-4 rounded-full flex items-center gap-2 text-sm font-extrabold text-white"
            style={{ background: editMode ? 'linear-gradient(135deg, #ff5500, #e91e8c)' : 'rgba(255,255,255,0.10)' }}
          >
            {editMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {editMode ? 'Edit Mode' : 'Normal View'}
          </button>
          <div className="flex-1" />
          <button onClick={resetDesign} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={saveDesign} className="h-10 px-4 rounded-full flex items-center gap-2 text-sm font-extrabold text-white" style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>

        {editMode && (
          <div className="absolute inset-0 z-[110] pointer-events-none" style={{ minHeight: 1200 }}>
            {SECTION_ORDER.map((id) => (
              <EditableSection
                key={id}
                id={id}
                section={sections[id]}
                selected={selectedId === id}
                editMode={editMode}
                onSelect={setSelectedId}
                onMove={moveSection}
              />
            ))}
          </div>
        )}

        {editMode && (
          <aside
            className="fixed z-[260] left-3 right-3 bottom-3 rounded-[28px] p-3"
            style={{
              background: 'rgba(12,7,18,0.88)',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.10)',
              backdropFilter: 'blur(22px) saturate(1.25)',
              WebkitBackdropFilter: 'blur(22px) saturate(1.25)',
              maxHeight: '48vh',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.18)' }}>
                <SelectedIcon className="w-5 h-5 text-orange-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-black truncate">{selected.label}</p>
                <p className="text-white/40 text-xs">Drag it on the feed, then edit below</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              >
                <Upload className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
              {SECTION_ORDER.map((id) => {
                const item = sections[id];
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className="flex-shrink-0 px-3 py-2 rounded-2xl text-xs font-extrabold"
                    style={{
                      background: selectedId === id ? 'rgba(255,85,0,0.22)' : 'rgba(255,255,255,0.07)',
                      border: selectedId === id ? '1px solid rgba(255,85,0,0.55)' : '1px solid rgba(255,255,255,0.10)',
                      color: item.hidden ? 'rgba(255,255,255,0.28)' : '#fff',
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <ToolButton active={selected.glass} icon={Sparkles} label="Glass" onClick={() => updateSelected({ glass: !selected.glass, radius: selected.glass ? selected.radius : Math.max(selected.radius ?? 0, 28) })} />
              <ToolButton active={selected.glow} icon={Sparkles} label="Glow" onClick={() => updateSelected({ glow: !selected.glow })} />
              <ToolButton active={selected.stroke} icon={Palette} label="Stroke" onClick={() => updateSelected({ stroke: !selected.stroke })} />
              <ToolButton active={selected.hidden} icon={EyeOff} label="Hide" onClick={() => updateSelected({ hidden: !selected.hidden })} />
              <ToolButton active={false} icon={Upload} label="Upload" onClick={() => fileInputRef.current?.click()} />
              <ToolButton active={selected.hidden} icon={Trash2} label="Delete" danger onClick={() => updateSelected({ hidden: true })} />
            </div>

            {selected.kind === 'text' && (
              <div className="space-y-3 mb-4">
                <div>
                  <ControlLabel>Text</ControlLabel>
                  <textarea
                    value={selected.text}
                    onChange={(e) => updateSelected({ text: e.target.value })}
                    className="w-full min-h-20 rounded-2xl px-3 py-3 text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <ControlLabel>Font</ControlLabel>
                    <select
                      value={selected.fontFamily}
                      onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                      className="w-full h-11 rounded-xl px-3 text-sm text-white outline-none"
                      style={{ background: '#160822', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}
                    </select>
                  </div>
                  <div>
                    <ControlLabel>Color</ControlLabel>
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(e) => updateSelected({ color: e.target.value })}
                      className="w-full h-11 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                </div>
                <RangeControl label="Font size" value={selected.fontSize} min={10} max={44} onChange={(fontSize) => updateSelected({ fontSize })} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <RangeControl label="Left" value={selected.x} min={-80} max={420} onChange={(x) => updateSelected({ x })} />
              <RangeControl label="Top" value={selected.y} min={0} max={1100} onChange={(y) => updateSelected({ y })} />
              <RangeControl label="Width" value={selected.w} min={28} max={520} onChange={(w) => updateSelected({ w })} />
              <RangeControl label="Height" value={selected.h} min={24} max={620} onChange={(h) => updateSelected({ h })} />
              <RangeControl label="Corners" value={selected.radius ?? 0} min={0} max={70} onChange={(radius) => updateSelected({ radius })} />
              {selected.kind === 'text' && (
                <RangeControl label="Weight" value={selected.weight} min={300} max={900} step={100} onChange={(weight) => updateSelected({ weight })} />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
