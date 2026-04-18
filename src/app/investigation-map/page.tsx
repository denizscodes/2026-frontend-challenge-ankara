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
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveTrail } from '@/hooks/useActiveTrail';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Clock
} from 'lucide-react';

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
    sortBy, setSortBy,
    availableLocations,
    filteredPeople,
  } = useInvestigationFilters(linkedPeople);

  const [selectedPerson, setSelectedPerson] = useState<LinkedPerson | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTrailModeActive, setIsTrailModeActive] = useState(false);

  const podoPersona = useMemo(() => 
    linkedPeople.find(p => p.name.toLowerCase().trim().includes('podo')),
    [linkedPeople]
  );

  const {
    currentStep,
    totalSteps,
    isPlaying,
    nextStep,
    prevStep,
    reset,
    togglePlay,
    activeCoordinates: podoTrailCoords,
    lastCoordinate: lastPodoCoord,
  } = useActiveTrail(podoPersona?.coordinates || []);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Spatial Data Offline</h2>
        <p className="mt-2 text-muted">{error}</p>
        <Button className="mt-6" onClick={refetch}>Reconnect to Sat-Link</Button>
      </div>
    );
  }

  const mapCoordinates = useMemo(() => {
    if (isTrailModeActive && podoPersona && lastPodoCoord) {
      // ONLY show the current Podo marker, hide everyone else for focus
      return [{
        ...lastPodoCoord,
        label: 'PODO (CURRENT LOCATION)',
        isSuspicious: false,
        isPodo: true,
        data: podoPersona,
        timestamp: lastPodoCoord.timestamp
      }];
    }

    const baseCoords = filteredPeople
      .filter(p => !p.name.toLowerCase().trim().includes('podo'))
      .flatMap(person => 
        person.coordinates.map(coord => ({
          ...coord,
          label: person.name,
          isSuspicious: person.suspicionScore > 40,
          data: person,
          timestamp: coord.timestamp
        }))
      );

    const podoCoords = podoPersona?.coordinates.map(coord => ({
      ...coord,
      label: 'PODO',
      isSuspicious: false,
      isPodo: true,
      data: podoPersona,
      timestamp: coord.timestamp
    })) || [];
    
    return [...baseCoords, ...podoCoords];
  }, [filteredPeople, isTrailModeActive, podoPersona, lastPodoCoord]);

  const mapPaths = useMemo(() => {
    const basePaths = filteredPeople
      .filter(person => person.coordinates.length > 1 && !person.name.toLowerCase().trim().includes('podo'))
      .map(person => ({
        id: person.id,
        coordinates: person.coordinates.map(c => [c.lat, c.lng] as [number, number]),
        color: person.suspicionScore > 40 ? '#dc2626' : '#2563eb',
        label: person.name
      }));

    if (!podoPersona || podoPersona.coordinates.length <= 1) return basePaths;

    if (!isTrailModeActive) {
      return [
        ...basePaths,
        {
          id: podoPersona.id,
          coordinates: podoPersona.coordinates.map(c => [c.lat, c.lng] as [number, number]),
          color: '#ff6100',
          label: 'PODO FULL TRAIL'
        }
      ];
    }

    // In Trail Mode, progressive path ONLY for focus
    if (podoTrailCoords.length <= 1) return [];

    return [
      {
        id: 'podo-active-trail',
        coordinates: podoTrailCoords.map(c => [c.lat, c.lng] as [number, number]),
        color: '#ff6100',
        label: `PODO TRAIL (Step ${currentStep + 1}/${totalSteps})`
      }
    ];
  }, [filteredPeople, isTrailModeActive, podoPersona, podoTrailCoords, currentStep, totalSteps]);

  const activeCenter = useMemo((): [number, number] | undefined => {
    if (isTrailModeActive && lastPodoCoord) {
      return [lastPodoCoord.lat, lastPodoCoord.lng];
    }
    return undefined;
  }, [isTrailModeActive, lastPodoCoord]);

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
                  placeholder="Search identities or locations..." 
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
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Tactical Overlays</p>
                <div 
                  onClick={() => {
                    setIsTrailModeActive(!isTrailModeActive);
                    if (!isTrailModeActive) reset();
                  }}
                  className={`group cursor-pointer w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    isTrailModeActive 
                      ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(255,97,0,0.1)]' 
                      : 'bg-card border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isTrailModeActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-black uppercase tracking-tight ${isTrailModeActive ? 'text-primary' : 'text-foreground'}`}>
                        Podo's Active Trail
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">Live movement tracking</span>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isTrailModeActive ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 transform ${isTrailModeActive ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Trail Controls - Only visible when Active Trail is on */}
                <AnimatePresence>
                  {isTrailModeActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-dark text-white p-5 rounded-2xl space-y-4 border border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Chronological Playback</span>
                          </div>
                          <span className="text-[10px] font-mono text-primary bg-primary/20 px-2 py-0.5 rounded">
                            {currentStep + 1} / {totalSteps}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                            />
                          </div>
                          {lastPodoCoord && (
                            <p className="text-[9px] text-muted-foreground text-center font-medium">
                              {new Date(lastPodoCoord.timestamp).toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-4">
                          <button 
                            onClick={prevStep}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Previous Step"
                          >
                            <SkipBack className="h-4 w-4" />
                          </button>
                          
                          <button 
                            onClick={togglePlay}
                            className="w-12 h-12 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                          >
                            {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white ml-1" />}
                          </button>

                          <button 
                            onClick={nextStep}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Next Step"
                          >
                            <SkipForward className="h-4 w-4" />
                          </button>

                          <button 
                            onClick={reset}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground"
                            title="Reset Trail"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            paths={mapPaths}
            center={activeCenter}
            zoom={isTrailModeActive ? 17 : 12}
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
           <div className="flex items-center gap-3">
              <div className="w-6 h-1 border-t-2 border-dashed border-primary/60" />
              <span className="text-xs font-bold text-foreground">Movement Path</span>
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
