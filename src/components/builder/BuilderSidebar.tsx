'use client';

import React from 'react';
import { useBuilderStore } from '@/lib/store/builderStore';
import { PRESETS } from '@/lib/presets';
import TeamMemberCard from './TeamMemberCard';
import ServiceCard from './ServiceCard';

const TABS = [
  { id: 'setup', label: 'Setup', dot: '#534AB7' },
  { id: 'team', label: 'Team & seats', dot: '#0F6E56' },
  { id: 'services', label: 'Services', dot: '#854F0B' },
  { id: 'availability', label: 'Availability', dot: '#185FA5' },
  { id: 'appearance', label: 'Appearance', dot: '#993C1D' },
  { id: 'landing', label: 'Landing page', dot: '#888780' },
  { id: 'integrations', label: 'Integrations', dot: '#888780' }
] as const;

export default function BuilderSidebar() {
  const { activeLeftTab, setActiveLeftTab, setAdvancedPanelOpen } = useBuilderStore();

  return (
    <div className="flex h-full w-full bg-[#fbfbfb]">
      {/* Mini Tab Sidebar */}
      <div className="w-[50px] border-r bg-white flex flex-col items-center py-4 gap-4 shrink-0 shadow-sm z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLeftTab(tab.id as any)}
            title={tab.label}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              activeLeftTab === tab.id ? 'bg-slate-100 ring-1 ring-slate-300 shadow-sm' : 'hover:bg-slate-50'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tab.dot }} />
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1 p-5 space-y-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{TABS.find(t => t.id === activeLeftTab)?.label}</h2>
          
          {activeLeftTab === 'setup' && <SetupTabContent />}
          {activeLeftTab === 'team' && <TeamTabContent />}
          {activeLeftTab === 'services' && <ServicesTabContent />}
          
          {activeLeftTab !== 'setup' && activeLeftTab !== 'team' && activeLeftTab !== 'services' && (
            <div className="text-sm text-slate-500">
              Settings for this tab are coming soon.
            </div>
          )}
        </div>

        {/* Advanced Panel Button */}
        <div className="p-4 mt-auto">
          <button 
            onClick={() => setAdvancedPanelOpen(true)}
            className="w-full py-2.5 px-3 border border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-400 transition-all text-left flex justify-between items-center"
          >
            <span>Advanced panel</span>
            <span className="text-slate-400">↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SetupTabContent() {
  const { 
    bookingType, setBookingType, 
    calendarMode, setCalendarMode,
    appearance, updateAppearance, loadPreset
  } = useBuilderStore();

  return (
    <div className="space-y-6">
      {/* Booking Mode */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Booking Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {['single_slot', 'multi_day', 'seat_based', 'recurring'].map((mode) => (
            <button
              key={mode}
              onClick={() => setBookingType(mode as any)}
              className={`p-2 text-xs font-semibold rounded-lg border text-left transition-all ${
                bookingType === mode 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Calendar Type</label>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setCalendarMode('individual')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              calendarMode === 'individual' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Solo
          </button>
          <button
            onClick={() => setCalendarMode('organisation')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              calendarMode === 'organisation' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Team org
          </button>
        </div>
      </div>

      {/* Theme Preset */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Theme Preset</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PRESETS).map(([id, preset]) => (
            <button
              key={id}
              onClick={() => loadPreset(id)}
              className={`p-2 rounded-lg border text-left transition-all ${
                appearance.preset === id 
                  ? 'border-slate-900 bg-slate-50 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex gap-1 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colorPalette?.backgroundPrimary || '#e2e8f0' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colorPalette?.accentPrimary || '#e2e8f0' }} />
              </div>
              <div className="text-xs font-semibold text-slate-800 capitalize">{id}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Accent Color</label>
        <div className="flex flex-wrap gap-2">
          {['#c8f542', '#534AB7', '#c9a87c', '#D85A30', '#1D9E75', '#E24B4A'].map((color) => (
            <button
              key={color}
              onClick={() => updateAppearance({ colorPalette: { ...appearance.colorPalette, accentPrimary: color } })}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                appearance.colorPalette.accentPrimary === color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] cursor-pointer hover:bg-slate-200">
            +
          </div>
        </div>
      </div>

      {/* Font */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Font</label>
        <select 
          className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white font-medium text-slate-700 outline-none focus:border-slate-400"
          value={appearance.typography.headingFont}
          onChange={(e) => updateAppearance({ typography: { ...appearance.typography, headingFont: e.target.value } })}
        >
          <option>Bebas Neue</option>
          <option>Cormorant Garamond</option>
          <option>Space Grotesk</option>
          <option>DM Mono</option>
          <option>Inter</option>
          <option>Syne</option>
        </select>
      </div>

      {/* Selection Shape */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Selection Shape</label>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => updateAppearance({ layout: { ...appearance.layout, borderRadiusStyle: 'sharp' } })}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              appearance.layout.borderRadiusStyle === 'sharp' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sharp
          </button>
          <button
            onClick={() => updateAppearance({ layout: { ...appearance.layout, borderRadiusStyle: 'soft' } })}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              appearance.layout.borderRadiusStyle === 'soft' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Rounded
          </button>
          <button
            onClick={() => updateAppearance({ layout: { ...appearance.layout, borderRadiusStyle: 'pill' } })}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              appearance.layout.borderRadiusStyle === 'pill' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pill
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamTabContent() {
  const { teamMembers, addTeamMember, updateTeamMember, removeTeamMember } = useBuilderStore();

  const handleAddMember = () => {
    addTeamMember({
      id: crypto.randomUUID(),
      calendarId: 'temp',
      displayName: 'New Member',
      roleOrStyle: 'Staff',
      avatarInitial: 'N',
      avatarColor: ['#534AB7', '#0F6E56', '#854F0B', '#185FA5', '#993C1D'][Math.floor(Math.random() * 5)],
      specialityTags: [],
      linkedCalendarId: null,
      useSharedHours: true,
      availabilityOverride: null,
      depositAmount: null,
      isBookable: true,
      isVisible: true,
      sortOrder: teamMembers.length
    });
  };

  return (
    <div className="space-y-8">
      {/* Team Members List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Team Members</label>
          <button 
            onClick={handleAddMember}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Add member
          </button>
        </div>
        
        <div className="space-y-3">
          {teamMembers.length === 0 ? (
            <div className="p-6 text-center border border-dashed rounded-xl border-slate-300">
              <p className="text-sm text-slate-500 mb-2">No team members yet.</p>
              <button 
                onClick={handleAddMember}
                className="text-xs font-semibold text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Add your first member
              </button>
            </div>
          ) : (
            teamMembers.map(member => (
              <TeamMemberCard 
                key={member.id} 
                member={member} 
                onUpdate={(partial) => updateTeamMember(member.id, partial)}
                onDelete={() => removeTeamMember(member.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Seat Logic */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Availability Logic</label>
        <p className="text-[11px] text-slate-500 mb-2 leading-tight">How do team members share availability for bookings?</p>
        
        <div className="space-y-2">
          {[
            { id: 'independent', label: 'Independent slots', desc: "Each member has their own calendar." },
            { id: 'shared_pool', label: 'Shared pool', desc: "Any available member fills a seat." },
            { id: 'fixed_seats', label: 'Fixed seats', desc: "Named physical seats/rooms." }
          ].map(opt => (
            <label key={opt.id} className="flex gap-3 p-3 border rounded-xl cursor-pointer hover:border-slate-400 transition-colors group bg-white">
              <input type="radio" name="seat_logic" className="mt-1" defaultChecked={opt.id === 'independent'} />
              <div>
                <div className="text-sm font-semibold text-slate-900">{opt.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Conflict Behavior */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Conflict Behavior</label>
        <select className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white font-medium text-slate-700 outline-none focus:border-slate-400">
          <option>Show available only</option>
          <option>Show all, mark taken</option>
          <option>Auto-suggest next free</option>
        </select>
      </div>
    </div>
  );
}

function ServicesTabContent() {
  const { services, addService, updateService, removeService } = useBuilderStore();

  const handleAddService = () => {
    addService({
      id: crypto.randomUUID(),
      calendarId: 'temp',
      name: 'New Service',
      description: '',
      durationMinutes: 60,
      durationIsVariable: false,
      durationMin: null,
      durationMax: null,
      price: 0,
      priceType: 'fixed',
      depositRequired: false,
      depositAmount: null,
      eligibleMemberIds: [],
      intensityLevel: null,
      intensityLabel: null,
      categoryTag: null,
      bufferAfterMinutes: 15,
      maxParticipants: null,
      customFields: [],
      isVisible: true,
      sortOrder: services.length
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Services</label>
          <button 
            onClick={handleAddService}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Add service
          </button>
        </div>
        
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="p-6 text-center border border-dashed rounded-xl border-slate-300">
              <p className="text-sm text-slate-500 mb-2">No services defined yet.</p>
              <button 
                onClick={handleAddService}
                className="text-xs font-semibold text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Add your first service
              </button>
            </div>
          ) : (
            services.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onUpdate={(partial) => updateService(service.id, partial)}
                onDelete={() => removeService(service.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
