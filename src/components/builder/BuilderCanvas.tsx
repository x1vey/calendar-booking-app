'use client';

import dynamic from 'next/dynamic';
import { useBuilderStore } from '@/lib/store/builderStore';

function useCalendarComponent(componentName: string) {
  switch (componentName) {
    case 'FitnessBookingCalendar':
      return dynamic(() => import('@/components/calendars/FitnessBookingCalendar'), { ssr: false });
    case 'TattooBookingCalendar':
      return dynamic(() => import('@/components/calendars/TattooBookingCalendar'), { ssr: false });
    case 'GarmentBookingCalendar':
      return dynamic(() => import('@/components/calendars/GarmentBookingCalendar'), { ssr: false });
    default:
      return dynamic(() => import('@/components/calendars/DefaultBookingCalendar'), { ssr: false });
  }
}

export default function BuilderCanvas() {
  const { appearance, previewDevice, setPreviewDevice } = useBuilderStore();

  const CalendarComponent = useCalendarComponent(
    appearance.preset === 'fitness' ? 'FitnessBookingCalendar' :
    appearance.preset === 'tattoo' ? 'TattooBookingCalendar' :
    appearance.preset === 'garment' ? 'GarmentBookingCalendar' :
    'DefaultBookingCalendar'
  );

  return (
    <div className="w-full h-full flex flex-col items-center relative py-6">
      
      <div className="bg-white rounded-full shadow-sm border p-1 mb-6 flex gap-1 z-10 shrink-0">
        {(['desktop', 'tablet', 'mobile'] as const).map(device => (
          <button 
            key={device}
            onClick={() => setPreviewDevice(device)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              previewDevice === device ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {device}
          </button>
        ))}
      </div>

      {/* Frame Container */}
      <div 
        className="shadow-xl border rounded-2xl overflow-y-auto transition-all duration-300 relative flex flex-col pointer-events-none"
        style={{
          width: previewDevice === 'mobile' ? 375 : previewDevice === 'tablet' ? 768 : '100%',
          maxWidth: 1200,
          flex: 1,
          background: appearance?.colorPalette?.backgroundPrimary || 'var(--ct-bg, #ffffff)'
        }}
      >
        <div className="pointer-events-auto p-4 md:p-8 h-full">
          <CalendarComponent
            appearance={appearance}
            slots={[]}
            onDateSelect={() => {}}
            onBook={async () => {}}
          />
        </div>
      </div>
    </div>
  );
}

