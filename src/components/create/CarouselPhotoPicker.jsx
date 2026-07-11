import React, { useRef, useState } from 'react';
import { Plus, X, GripVertical, Images, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_PHOTOS = 10;

/**
 * CarouselPhotoPicker
 * Props:
 *   photos: Array<{ file: File, preview: string }>
 *   onChange: (photos) => void
 */
export default function CarouselPhotoPicker({ photos, onChange }) {
  const fileInputRef = useRef(null);
  const dragIndex = useRef(null);

  const addPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange([...photos, ...toAdd]);
    e.target.value = '';
  };

  const remove = (i) => {
    const next = photos.filter((_, idx) => idx !== i);
    onChange(next);
  };

  const moveLeft = (i) => {
    if (i === 0) return;
    const next = [...photos];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  };

  const moveRight = (i) => {
    if (i === photos.length - 1) return;
    const next = [...photos];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4 text-orange-400" />
          <span className="text-white text-sm font-bold">Photos</span>
          <span className="text-white/40 text-xs">{photos.length}/{MAX_PHOTOS}</span>
        </div>
        {photos.length < MAX_PHOTOS && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 12px rgba(255,85,0,0.4)' }}>
            <Plus className="w-3.5 h-3.5" />
            Add More
          </button>
        )}
      </div>

      {/* Thumbnails grid */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {photos.map((photo, i) => (
          <motion.div
            key={photo.preview}
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="relative flex-shrink-0 rounded-xl overflow-hidden"
            style={{ width: 80, height: 80, border: i === 0 ? '2px solid #ff5500' : '2px solid rgba(255,255,255,0.15)' }}>
            <img src={photo.preview} alt="" className="w-full h-full object-cover" />

            {/* Cover badge */}
            {i === 0 && (
              <div className="absolute bottom-0 left-0 right-0 text-center py-0.5"
                style={{ background: 'rgba(255,85,0,0.85)', fontSize: 9, fontWeight: 700, color: 'white' }}>
                COVER
              </div>
            )}

            {/* Remove */}
            <button
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(220,30,30,0.9)' }}>
              <X className="w-3 h-3 text-white" />
            </button>

            {/* Reorder arrows */}
            <div className="absolute bottom-0 left-0 flex">
              {i > 0 && (
                <button onClick={() => moveLeft(i)}
                  className="w-5 h-5 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.65)' }}>
                  <ChevronLeft className="w-3 h-3 text-white" />
                </button>
              )}
              {i < photos.length - 1 && (
                <button onClick={() => moveRight(i)}
                  className="w-5 h-5 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.65)' }}>
                  <ChevronRight className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Add photo slot */}
        {photos.length < MAX_PHOTOS && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 rounded-xl flex flex-col items-center justify-center gap-1"
            style={{ width: 80, height: 80, border: '2px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)' }}>
            <Plus className="w-6 h-6 text-white/40" />
            <span className="text-white/30 text-[10px]">Add</span>
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <p className="text-white/30 text-[11px]">Tap arrows to reorder · First photo is the cover</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={addPhotos}
      />
    </div>
  );
}