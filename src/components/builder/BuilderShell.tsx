'use client';

import React, { useEffect, useState } from 'react';
import BuilderSidebar from './BuilderSidebar';
import BuilderCanvas from './BuilderCanvas';
import BuilderStylePanel from './BuilderStylePanel';
import { useBuilderStore } from '@/lib/store/builderStore';

export default function BuilderShell({ initialCalendar }: { initialCalendar: any }) {
  const { isSaving, setCalendarId, setCalendarMode, setBookingType } = useBuilderStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize the store
    setCalendarId(initialCalendar.id);
    setCalendarMode(initialCalendar.mode || 'individual');
    setBookingType(initialCalendar.booking_type || 'single_slot');
    
    // Parse JSON configurations if they exist
    // ... we will expand this later ...
    
    setIsReady(true);
  }, [initialCalendar]);

  if (!isReady) return <div className="h-screen flex items-center justify-center bg-[#fbfbfb]">Loading builder...</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#fbfbfb]">
      {/* Top Nav */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">Calendars</div>
          <span className="text-slate-300">/</span>
          <div className="font-bold tracking-tight text-slate-900">{useBuilderStore.getState().name || 'Untitled Calendar'}</div>
          <div className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">Draft</div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-400 font-medium mr-4">
            {isSaving ? 'Saving...' : 'Saved'}
          </div>
          
          <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mr-2">
            Preview link ↗
          </button>
          
          <button className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-800 transition-colors">
            Publish
          </button>
        </div>
      </header>

      {/* Three Panel Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Configuration */}
        <div className="w-[220px] bg-white border-r shrink-0 flex flex-col h-full overflow-y-auto">
          <BuilderSidebar />
        </div>

        {/* Center Canvas - Live Preview */}
        <div className="flex-1 bg-[#f1f5f9] h-full overflow-hidden relative flex flex-col items-center">
          <BuilderCanvas />
        </div>

        {/* Right Sidebar - Appearance */}
        <div className="w-[200px] bg-white border-l shrink-0 flex flex-col h-full overflow-y-auto">
          <BuilderStylePanel />
        </div>
      </main>
    </div>
  );
}
