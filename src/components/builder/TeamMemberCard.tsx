'use client';

import React, { useState } from 'react';
import { TeamMember } from '@/lib/types/builder';

export default function TeamMemberCard({ 
  member, 
  onUpdate, 
  onDelete 
}: { 
  member: TeamMember; 
  onUpdate: (partial: Partial<TeamMember>) => void;
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
        
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
          style={{ backgroundColor: member.avatarColor }}
        >
          {member.avatarInitial}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-900 truncate">{member.displayName}</div>
          <div className="text-xs text-slate-500 truncate">{member.roleOrStyle}</div>
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
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Name</label>
              <input 
                type="text" 
                value={member.displayName}
                onChange={(e) => onUpdate({ displayName: e.target.value, avatarInitial: e.target.value.charAt(0).toUpperCase() })}
                className="w-full text-sm p-2 border rounded bg-white outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Role / Style</label>
              <input 
                type="text" 
                value={member.roleOrStyle}
                onChange={(e) => onUpdate({ roleOrStyle: e.target.value })}
                className="w-full text-sm p-2 border rounded bg-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Specialities (comma separated)</label>
            <input 
              type="text" 
              value={member.specialityTags.join(', ')}
              onChange={(e) => onUpdate({ specialityTags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full text-sm p-2 border rounded bg-white outline-none focus:border-indigo-500"
              placeholder="e.g. Traditional, Blackwork"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-700 font-medium">Use shared org hours</span>
              <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${member.useSharedHours ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${member.useSharedHours ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={member.useSharedHours}
                onChange={(e) => onUpdate({ useSharedHours: e.target.checked })}
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-700 font-medium">Currently bookable</span>
              <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${member.isBookable ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${member.isBookable ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={member.isBookable}
                onChange={(e) => onUpdate({ isBookable: e.target.checked })}
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              onClick={onDelete}
              className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
            >
              Remove member
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
