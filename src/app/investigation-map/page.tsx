'use client';

import { useInvestigation, LinkedPerson } from '@/hooks/useInvestigation';
import { useInvestigationFilters } from '@/hooks/useInvestigationFilters';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { PersonaDetails } from '@/components/PersonaDetails';
import { 
  Search, 
  Filter, 
  Database, 
  Map as MapIcon, 
  Maximize2, 
  Minimize2,
  Zap,
  Fingerprint
} from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const InvestigationMap = dynamic(() => import('@/components/InvestigationMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-card animate-pulse rounded-2xl flex items-center justify-center text-muted">Initializing Tactical Map...</div>
});

export default function InvestigationMapPage() {
  const { linkedPeople, loading, error, refetch } = useInvestigation();
  const {
    searchQuery, setSearchQuery,
    selectedLocations, setSelectedLocations,
    timeFilter, setTimeFilter,
    minSuspicion, setMinSuspicion,
    maxSuspicion, setMaxSuspicion,
    minReliability, setMinReliability,
    maxReliability, setMaxReliability,
    keywordFilter, setKeywordFilter,
    filterType, setFilterType,
    availableLocations,
    filteredPeople,
  } = useInvestigationFilters(linkedPeople);

  const [selectedPerson, setSelectedPerson] = useState<LinkedPerson | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Spatial Data Offline</h2>
        <p className="mt-2 text-muted">{error}</p>
        <Button className="mt-6" onClick={refetch}>Reconnect to Sat-Link</Button>
      </div>
    );
  }

  const mapCoordinates = filteredPeople.flatMap(person => 
    person.coordinates.map(coord => ({
      ...coord,
      label: person.name,
      isSuspicious: person.suspicionScore > 40 && person.name.toLowerCase() !== 'podo',
      data: person
    }))
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Sidebar Filters */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border bg-card flex flex-col h-full overflow-hidden shadow-xl z-20"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-dark text-white">
              <div className="flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-primary" />
                <h2 className="font-bold uppercase tracking-widest text-sm">Tactical Filters</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="text-white hover:bg-white/10">
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Global Intelligence Search</p>
                <Input 
                  placeholder="Search identities, emails..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Threat Threshold</p>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <span className="text-[9px] text-muted font-bold">MIN SUSPICION</span>
                       <input 
                         type="number" value={minSuspicion} 
                         onChange={(e) => setMinSuspicion(e.target.value === '' ? '' : Number(e.target.value))}
                         className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-mono"
                       />
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] text-muted font-bold">MAX SUSPICION</span>
                       <input 
                         type="number" value={maxSuspicion} 
                         onChange={(e) => setMaxSuspicion(e.target.value === '' ? '' : Number(e.target.value))}
                         className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-mono"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Location Clusters</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableLocations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocations(prev => 
                        prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
                      )}
                      className={`text-[9px] px-2 py-1 rounded-md border transition-all ${
                        selectedLocations.includes(loc)
                          ? 'bg-primary border-primary text-white'
                          : 'bg-background border-border text-muted hover:border-primary/50'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Persona Status</p>
                <div className="flex flex-col gap-2">
                  {(['all', 'matched', 'with_coords'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`text-xs px-4 py-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                        filterType === t 
                          ? 'bg-primary/5 border-primary text-primary font-bold' 
                          : 'bg-background border-border text-muted hover:bg-muted'
                      }`}
                    >
                      <span className="capitalize">{t.replace('_', ' ')}</span>
                      {filterType === t && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-background border-t border-border">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-muted uppercase">Nodes Detected</span>
                  <span className="text-sm font-black">{filteredPeople.length}</span>
               </div>
               <Button variant="dark" className="w-full" onClick={refetch} disabled={loading}>
                  <Database className="mr-2 h-4 w-4" />
                  Refresh Sat-Link
               </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Map Content */}
      <main className="flex-grow relative">
        {!isSidebarOpen && (
          <Button 
            variant="dark" 
            size="sm" 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-30 shadow-2xl border border-white/20"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Show Filters
          </Button>
        )}

        <div className="absolute inset-0 z-10">
          <InvestigationMap 
            coordinates={mapCoordinates}
            zoom={12}
            onMarkerClick={(person) => setSelectedPerson(person)}
          />
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-10 right-10 z-30 p-4 bg-card/90 backdrop-blur-md border border-border rounded-2xl shadow-2xl space-y-3 min-w-[200px]">
           <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] border-b border-border pb-2 mb-2">Tactical Legend</p>
           <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-sm" />
              <span className="text-xs font-bold text-foreground">Suspect Identified</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
              <span className="text-xs font-bold text-foreground">Intelligence Node</span>
           </div>
           <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-[9px] text-muted">
                 <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                 LIVE TRACKING ACTIVE
              </div>
           </div>
        </div>
      </main>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        title="Intelligence Persona Profile"
      >
        {selectedPerson && (
          <PersonaDetails person={selectedPerson} showTimeline={true} />
        )}
      </Modal>
    </div>
  );
}
