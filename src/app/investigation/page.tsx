'use client';

import { useInvestigation, LinkedPerson } from '@/hooks/useInvestigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Skeleton } from '@/components/Skeleton';
import { 
  Users, 
  Search, 
  Filter, 
  Zap, 
  Database, 
  ChevronRight, 
  Mail, 
  Phone, 
  Calendar, 
  ExternalLink,
  MapPin,
  Clock,
  Fingerprint
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/Modal';
import dynamic from 'next/dynamic';

const InvestigationMap = dynamic(() => import('@/components/InvestigationMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-muted">Loading Map...</div>
});

export default function InvestigationPage() {
  const { linkedPeople, totalLeads, matchedCount, loading, error, refetch } = useInvestigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '48h'>('all');
  const [minSuspicion, setMinSuspicion] = useState<number | ''>(0);
  const [maxSuspicion, setMaxSuspicion] = useState<number | ''>(100);
  const [minReliability, setMinReliability] = useState<number | ''>(0);
  const [maxReliability, setMaxReliability] = useState<number | ''>(100);
  const [keywordFilter, setKeywordFilter] = useState('');
  
  const [selectedPerson, setSelectedPerson] = useState<LinkedPerson | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'matched' | 'with_coords'>('all');
  const detailsRef = useRef<HTMLDivElement>(null);

  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    linkedPeople.forEach(p => {
      if (p.location) locs.add(p.location);
    });
    return Array.from(locs).sort();
  }, [linkedPeople]);

  useEffect(() => {
    if (selectedPerson && window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedPerson]);

  const filteredPeople = useMemo(() => {
    return linkedPeople.filter(person => {
      // Global Deep-Search Filters
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        person.name.toLowerCase().includes(searchLower) ||
        (person.email && person.email.toLowerCase().includes(searchLower)) ||
        (person.phone && person.phone.includes(searchQuery)) ||
        (person.location && person.location.toLowerCase().includes(searchLower)) ||
        person.id.toLowerCase().includes(searchLower) ||
        person.submissions.some(sub => 
          Object.values(sub.answers).some((ans: any) => 
            String(ans.answer).toLowerCase().includes(searchLower)
          )
        );
      
      // Location Filters
      const matchesLocation = selectedLocations.length === 0 || 
        (person.location && selectedLocations.includes(person.location));

      // Time Filter
      let matchesTime = true;
      if (timeFilter !== 'all') {
        const now = new Date();
        const hours = timeFilter === '24h' ? 24 : 48;
        const limit = new Date(now.getTime() - hours * 60 * 60 * 1000);
        matchesTime = person.submissions.some(sub => new Date(sub.created_at) > limit);
      }

      // Analytical Filters
      const matchesSuspicion = person.suspicionScore >= (minSuspicion === '' ? 0 : minSuspicion) && 
                              person.suspicionScore <= (maxSuspicion === '' ? 100 : maxSuspicion);
      const matchesReliability = person.reliability >= (minReliability === '' ? 0 : minReliability) && 
                                person.reliability <= (maxReliability === '' ? 100 : maxReliability);
      
      // Keyword Filter
      const matchesKeywords = !keywordFilter || person.submissions.some(sub => 
        Object.values(sub.answers).some((ans: any) => 
          String(ans.answer).toLowerCase().includes(keywordFilter.toLowerCase())
        )
      );

      // Type Filter
      const matchesType = 
        filterType === 'all' || 
        (filterType === 'matched' && person.submissions.length > 1) ||
        (filterType === 'with_coords' && person.coordinates && person.coordinates.length > 0);

      return matchesSearch && matchesType && matchesLocation && 
             matchesTime && matchesSuspicion && matchesReliability && matchesKeywords;
    });
  }, [linkedPeople, searchQuery, filterType, selectedLocations, timeFilter, minSuspicion, maxSuspicion, minReliability, maxReliability, keywordFilter]);

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
                 placeholder="Search by name, email..." 
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
                  {selectedLocations.length > 0 && (
                    <button 
                      onClick={() => setSelectedLocations([])}
                      className="text-[9px] text-primary font-bold uppercase text-right px-1 hover:underline"
                    >
                      Clear Locations ({selectedLocations.length})
                    </button>
                  )}
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
                  <span className="text-[10px] font-bold text-muted uppercase mr-auto">Time Window:</span>
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
          <div className="flex flex-wrap gap-2 px-1">
            <Button 
              variant={filterType === 'all' ? 'dark' : 'outline'} 
              size="sm" 
              className="text-[10px] h-7 px-3 uppercase font-bold tracking-wider"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button 
              variant={filterType === 'matched' ? 'dark' : 'outline'} 
              size="sm" 
              className="text-[10px] h-7 px-3 uppercase font-bold tracking-wider"
              onClick={() => setFilterType('matched')}
            >
              Matched Only
            </Button>
            <Button 
              variant={filterType === 'with_coords' ? 'dark' : 'outline'} 
              size="sm" 
              className="text-[10px] h-7 px-3 uppercase font-bold tracking-wider"
              onClick={() => setFilterType('with_coords')}
            >
              Has Coords
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-muted uppercase tracking-widest px-2">Personas ({filteredPeople.length})</h2>
            <div className="max-h-[400px] lg:max-h-[calc(100vh-450px)] overflow-y-auto pr-2 custom-scrollbar space-y-3">
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
                        HIGH SUSPICION: {person.suspicionScore}%
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
                       {person.phone && (
                         <span className="text-[10px] text-muted flex items-center gap-1">
                           <Phone className="h-3 w-3" /> {person.phone}
                         </span>
                       )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                       <span className="text-[9px] font-mono text-muted bg-background px-1.5 py-0.5 rounded uppercase">ID: {person.id.slice(0, 8)}...</span>
                       <ChevronRight className={`h-4 w-4 transition-transform ${selectedPerson?.id === person.id ? 'text-primary translate-x-1' : 'text-muted'}`} />
                    </div>
                  </button>
                ))}
              </div>
            )}
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
                className="space-y-8"
              >
                {/* Persona Profile */}
                <Card className="p-8 border-none shadow-2xl relative overflow-hidden bg-card">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center text-muted shrink-0 border-4 border-white shadow-xl">
                      <Users className="h-12 w-12" />
                    </div>
                    <div className="flex-grow">
                       <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">VERIFIED IDENTITY</span>
                          <span className="text-[10px] font-bold text-muted bg-gray-100 px-2 py-0.5 rounded-full">REL_INDEX: {selectedPerson.reliability.toFixed(1)}%</span>
                       </div>
                       <h2 className="text-4xl font-black text-foreground leading-tight">{selectedPerson.name}</h2>
                       
                       {/* Suspicion Analysis Overlay */}
                       {selectedPerson.suspicionScore > 0 && selectedPerson.name.toLowerCase() !== 'podo' && (
                         <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                               <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest mb-1">
                                  <Zap className="h-4 w-4 fill-red-600" />
                                  Threat Assessment: {selectedPerson.suspicionScore > 75 ? 'Critical' : 'Elevated'}
                               </div>
                               <p className="text-sm font-medium text-foreground opacity-80">{selectedPerson.suspicionReason}</p>
                               <div className="mt-2 flex flex-wrap gap-2">
                                  {selectedPerson.submissions.length > 2 && (
                                     <span className="text-[9px] bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold">Frequent Reporter</span>
                                  )}
                                  {selectedPerson.coordinates && selectedPerson.coordinates.length > 1 && (
                                     <span className="text-[9px] bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold">Trail Overlap</span>
                                  )}
                                  {selectedPerson.reliability < 50 && (
                                     <span className="text-[9px] bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold">Unverified Data</span>
                                  )}
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="text-right">
                                  <p className="text-[10px] font-bold text-muted uppercase">Suspicion Score</p>
                                  <p className="text-2xl font-black text-red-600">{selectedPerson.suspicionScore}%</p>
                               </div>
                            </div>
                         </div>
                       )}

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mt-6">
                          <div className="flex items-center gap-3 text-sm text-foreground">
                             <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted"><Mail className="h-4 w-4" /></div>
                             <div>
                                <p className="text-[10px] font-bold text-muted uppercase">Primary Contact</p>
                                <p className="font-semibold">{selectedPerson.email || 'Not available'}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-foreground">
                             <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted"><Phone className="h-4 w-4" /></div>
                             <div>
                                <p className="text-[10px] font-bold text-muted uppercase">Phone Number</p>
                                <p className="font-semibold">{selectedPerson.phone || 'Not available'}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-foreground">
                             <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted"><MapPin className="h-4 w-4" /></div>
                             <div>
                                <p className="text-[10px] font-bold text-muted uppercase">Primary Location</p>
                                <p className="font-semibold">{selectedPerson.location || 'Unknown'}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-foreground">
                             <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted"><Database className="h-4 w-4" /></div>
                             <div>
                                <p className="text-[10px] font-bold text-muted uppercase">Active Threads</p>
                                <p className="font-semibold">{selectedPerson.submissions.length} Sources Linked</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </Card>

                {/* Map Section */}
                {selectedPerson.coordinates && selectedPerson.coordinates.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Sighting Locations
                    </h3>
                    <div className="h-[400px] w-full">
                      <InvestigationMap 
                        coordinates={selectedPerson.coordinates.map(c => ({ ...c, label: `Sighting of ${selectedPerson.name}` }))} 
                      />
                    </div>
                  </div>
                )}

                {/* Timeline of Records */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Activity Timeline
                  </h3>
                  <div className="relative space-y-6 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
                    {selectedPerson.submissions.map((sub, idx) => (
                      <div key={sub.id} className="relative pl-12">
                        <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10 shadow-sm">
                           <div className="w-4 h-4 rounded-full bg-primary" />
                        </div>
                        <Card className="hover:border-primary/30 transition-all">
                           <div className="flex items-start justify-between mb-4">
                              <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-dark bg-gray-100 px-2 py-0.5 rounded border">{sub.formTitle}</span>
                                    <span className="text-[10px] text-muted font-mono">#{sub.id.slice(-8)}</span>
                                 </div>
                                 <h4 className="font-bold text-foreground">Lead Contribution</h4>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs font-bold text-foreground flex items-center justify-end gap-1">
                                    <Calendar className="h-3 w-3" /> {new Date(sub.created_at).toLocaleDateString()}
                                 </p>
                                 <p className="text-[10px] text-muted font-medium">{new Date(sub.created_at).toLocaleTimeString()}</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background/50 p-4 rounded-xl border border-gray-100">
                              {Object.values(sub.answers).slice(0, 4).map((ans: any, i) => (
                                 <div key={i}>
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{ans.text}</p>
                                    <p className="text-sm text-foreground mt-0.5 font-medium line-clamp-2">{ans.answer || '—'}</p>
                                 </div>
                              ))}
                           </div>
                           <div className="mt-4 flex justify-between items-center">
                              <span className="text-[10px] text-muted flex items-center gap-1 italic">
                                 <MapPin className="h-3 w-3" /> Reported from IP: {sub.ip}
                              </span>
                              <Button variant="ghost" size="sm" className="h-8 text-[11px]">
                                 Deep Analysis <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                           </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
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
