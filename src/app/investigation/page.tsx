'use client';

import { useInvestigation, LinkedPerson } from '@/hooks/useInvestigation';
import { useInvestigationFilters } from '@/hooks/useInvestigationFilters';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Skeleton } from '@/components/Skeleton';
import { 
  Users, 
  Search, 
  Zap, 
  Database, 
  ChevronRight, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Fingerprint
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonaDetails } from '@/components/PersonaDetails';

export default function InvestigationPage() {
  const { linkedPeople, totalLeads, matchedCount, loading, error, refetch } = useInvestigation();
  const {
    searchQuery, setSearchQuery,
    selectedLocations, setSelectedLocations,
    timeFilter, setTimeFilter,
    minSuspicion, setMinSuspicion,
    maxSuspicion, setMaxSuspicion,
    minReliability, setMinReliability,
    maxReliability, setMaxReliability,
    filterType, setFilterType,
    sortBy, setSortBy,
    availableLocations,
    filteredPeople,
  } = useInvestigationFilters(linkedPeople);
  
  const [selectedPerson, setSelectedPerson] = useState<LinkedPerson | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPerson && window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedPerson]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Investigation Offline</h2>
        <p className="mt-2 text-muted">{error}</p>
        <Button className="mt-6" onClick={refetch}>Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      {/* Header Section */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Fingerprint className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Record Linking Engine</span>
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
              Investigation <span className="text-primary">Panel</span>
            </h1>
            <p className="mt-3 text-lg text-muted max-w-2xl">
              Cross-reference intelligence from all sources to build complete personas and track movement patterns.
            </p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={refetch} disabled={loading}>
                <Database className="mr-2 h-4 w-4" />
                Sync Sources
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <Card className="bg-card border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-primary/10 group-hover:text-primary/20 transition-colors">
              <Database className="h-12 w-12" />
            </div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Total Raw Leads</p>
            <h3 className="text-3xl font-black text-foreground mt-1">{loading ? '...' : totalLeads}</h3>
            <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
              <Zap className="h-3 w-3" /> +12% from last 24h
            </p>
          </Card>
          
          <Card className="bg-card border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-primary/10 group-hover:text-primary/20 transition-colors">
              <Users className="h-12 w-12" />
            </div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Unique Identities</p>
            <h3 className="text-3xl font-black text-foreground mt-1">{loading ? '...' : linkedPeople.length}</h3>
            <p className="text-xs text-blue-600 font-medium mt-2">Deduplicated from multiple sources</p>
          </Card>

          <Card className="bg-dark text-white border-none shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
            <div className="absolute top-0 right-0 p-4 text-white/10 group-hover:text-white/20 transition-colors">
              <Fingerprint className="h-12 w-12" />
            </div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider relative z-10">Correlation Hits</p>
            <h3 className="text-3xl font-black text-white mt-1 relative z-10">{loading ? '...' : matchedCount}</h3>
            <p className="text-xs text-primary font-bold mt-2 relative z-10">Matched Personas Identified</p>
          </Card>
        </div>
      </header>

      {/* Main Investigation Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / List */}
        <div className="w-full lg:w-1/3 space-y-6">
            <div className="flex flex-col gap-3 flex-grow">
               <Input 
                 placeholder="Search identities or locations..." 
                 className="bg-card"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 icon={<Search className="h-4 w-4" />}
               />
               
               <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-muted uppercase px-1">Locations (Multi-select)</p>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-background/50 rounded-xl border border-border max-h-[100px] overflow-y-auto">
                     {availableLocations.length === 0 ? (
                       <span className="text-[10px] text-muted italic p-1">No locations found in intel</span>
                     ) : (
                       availableLocations.map(loc => (
                         <button
                           key={loc}
                           onClick={() => {
                             setSelectedLocations(prev => 
                               prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
                             );
                           }}
                           className={`text-[9px] px-2 py-1 rounded-lg border transition-all ${
                             selectedLocations.includes(loc)
                               ? 'bg-primary border-primary text-white shadow-sm'
                               : 'bg-card border-border text-muted hover:border-primary/50'
                           }`}
                         >
                           {loc}
                         </button>
                       ))
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3 bg-background/50 p-4 rounded-xl border border-border">
                  <div className="space-y-1.5">
                     <span className="text-[10px] font-bold text-muted uppercase block">Suspicion Score</span>
                     <div className="flex items-center gap-1.5">
                        <input 
                          type="number" min="0" max="100" value={minSuspicion} 
                          onChange={(e) => setMinSuspicion(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Min"
                          className="w-full bg-card border border-border rounded-lg px-2 py-1 text-xs font-mono"
                        />
                        <span className="text-muted text-xs">-</span>
                        <input 
                          type="number" min="0" max="100" value={maxSuspicion} 
                          onChange={(e) => setMaxSuspicion(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Max"
                          className="w-full bg-card border border-border rounded-lg px-2 py-1 text-xs font-mono"
                        />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <span className="text-[10px] font-bold text-muted uppercase block">Reliability Score</span>
                     <div className="flex items-center gap-1.5">
                        <input 
                          type="number" min="0" max="100" value={minReliability} 
                          onChange={(e) => setMinReliability(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Min"
                          className="w-full bg-card border border-border rounded-lg px-2 py-1 text-xs font-mono"
                        />
                        <span className="text-muted text-xs">-</span>
                        <input 
                          type="number" min="0" max="100" value={maxReliability} 
                          onChange={(e) => setMaxReliability(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Max"
                          className="w-full bg-card border border-border rounded-lg px-2 py-1 text-xs font-mono"
                        />
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 bg-background/50 p-3 rounded-xl border border-border">
                  <span className="text-[10px] font-bold text-muted uppercase mr-auto">Time:</span>
                  {(['all', '24h', '48h'] as const).map(t => (
                    <button 
                      key={t}
                      onClick={() => setTimeFilter(t)}
                      className={`text-[9px] px-3 py-1 rounded-lg uppercase font-bold transition-colors ${
                        timeFilter === t ? 'bg-primary text-white shadow-sm' : 'bg-card text-muted hover:bg-muted border border-border'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
               </div>
            </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-[10px] font-bold text-muted uppercase tracking-widest">Sort Intelligence</h2>
               <div className="flex gap-1">
                  {(['recent', 'name', 'suspicion', 'reliability'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`text-[8px] px-2 py-1 rounded-md border transition-all font-bold uppercase ${
                        sortBy === s 
                          ? 'bg-primary border-primary text-white' 
                          : 'bg-background border-border text-muted hover:bg-muted'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex flex-wrap gap-2 px-1">
              {(['all', 'matched', 'with_coords'] as const).map(t => (
                <Button 
                  key={t}
                  variant={filterType === t ? 'dark' : 'outline'} 
                  size="sm" 
                  className="text-[10px] h-7 px-3 uppercase font-bold tracking-wider"
                  onClick={() => setFilterType(t)}
                >
                  {t.replace('_', ' ')}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-muted uppercase tracking-widest px-2 pt-2">Personas ({filteredPeople.length})</h2>
              <div className="max-h-[500px] lg:max-h-[calc(100vh-620px)] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {loading ? (
                  [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
                ) : filteredPeople.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl">
                    <p className="text-muted">No identities found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredPeople.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => setSelectedPerson(person)}
                        className={`text-left p-4 rounded-xl border transition-all hover:shadow-md group relative overflow-hidden ${
                          selectedPerson?.id === person.id 
                            ? 'bg-card border-primary ring-1 ring-primary shadow-lg' 
                            : person.suspicionScore > 40 && person.name.toLowerCase() !== 'podo' ? 'bg-card border-red-500' : 'bg-card border-border'
                        }`}
                      >
                        {person.submissions.length > 1 && (
                          <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg">
                            {person.submissions.length} Matches
                          </div>
                        )}
                        {person.suspicionScore > 40 && person.name.toLowerCase() !== 'podo' && (
                          <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-br-lg animate-pulse">
                            {person.suspicionScore}%
                          </div>
                        )}
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {person.name}
                          {person.suspicionScore > 70 && <Zap className="h-3 w-3 text-red-600 fill-red-600" />}
                        </h3>
                        <div className="flex flex-col gap-1 mt-2">
                           {person.email && (
                             <span className="text-[10px] text-muted flex items-center gap-1">
                               <Mail className="h-3 w-3" /> {person.email}
                             </span>
                           )}
                           {person.location && (
                             <span className="text-[10px] text-muted flex items-center gap-1">
                               <MapPin className="h-3 w-3" /> {person.location}
                             </span>
                           )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                           <span className="text-[9px] font-mono text-muted bg-background px-1.5 py-0.5 rounded uppercase">ID: {person.id.slice(0, 8)}</span>
                           <ChevronRight className={`h-4 w-4 transition-transform ${selectedPerson?.id === person.id ? 'text-primary translate-x-1' : 'text-muted'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed View */}
        <div 
          ref={detailsRef}
          className="flex-grow lg:max-h-[calc(100vh-250px)] lg:overflow-y-auto custom-scrollbar lg:pr-4"
        >
          <AnimatePresence mode="wait">
            {selectedPerson ? (
              <motion.div
                key={selectedPerson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PersonaDetails person={selectedPerson} />
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl bg-background/30">
                <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center text-muted mb-6">
                   <Fingerprint className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Select an Identity</h3>
                <p className="text-muted mt-2 max-w-sm text-center font-medium">
                  Select a persona from the left panel to examine their cross-source history and contributions to the Podo investigation.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
