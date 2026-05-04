'use client';

import React, { useState } from 'react';
import { Service } from '@/lib/types/builder';

export default function ServiceCard({
  service,
  onUpdate,
  onDelete
}: {
  service: Service;
  onUpdate: (partial: Partial<Service>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 bg-white rounded-xl overflow-hidden transition-all shadow-sm">
      {/* Header - Always visible */}
      <div 
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="cursor-grab text-slate-300 hover:text-slate-500 p-1 -ml-2">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
            <path d="M4 6a2 2 0 11-4 0 2 2 0 014 0zM12 6a2 2 0 11-4 0 2 2 0 014 0zM4 14a2 2 0 11-4 0 2 2 0 014 0zM12 14a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-900 truncate">{service.name}</div>
          <div className="text-xs text-slate-500 truncate mt-0.5">
            {service.durationMinutes} min • {service.priceType === 'free' ? 'Free' : `$${service.price}`}
          </div>
        </div>

        <div className={`p-1 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/50">
          <div className="space-y-1 mt-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Name</label>
            <input 
              type="text" 
              value={service.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full text-sm p-2 border rounded bg-white outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
            <textarea 
              value={service.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full text-sm p-2 border rounded bg-white outline-none focus:border-indigo-500 resize-none h-20"
              placeholder="What to expect..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration (min)</label>
              <input 
                type="number" 
                value={service.durationMinutes}
                onChange={(e) => onUpdate({ durationMinutes: parseInt(e.target.value) || 0 })}
                className="w-full text-sm p-2 border rounded bg-white outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Buffer after (min)</label>
              <input 
                type="number" 
                value={service.bufferAfterMinutes}
                onChange={(e) => onUpdate({ bufferAfterMinutes: parseInt(e.target.value) || 0 })}
                className="w-full text-sm p-2 border rounded bg-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Price Type</label>
              <select 
                value={service.priceType}
                onChange={(e) => onUpdate({ priceType: e.target.value as any })}
                className="w-full text-sm p-2 border rounded bg-white outline-none focus:border-indigo-500"
              >
                <option value="fixed">Fixed</option>
                <option value="per_hour">Per Hour</option>
                <option value="quote_only">Quote Only</option>
                <option value="free">Free</option>
              </select>
            </div>
            
            {service.priceType !== 'free' && service.priceType !== 'quote_only' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Price ($)</label>
                <input 
                  type="number" 
                  value={service.price}
                  onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm p-2 border rounded bg-white outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              onClick={onDelete}
              className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
            >
              Remove service
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
