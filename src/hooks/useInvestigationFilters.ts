import { useState, useMemo } from 'react';
import { LinkedPerson } from './useInvestigation';

export const useInvestigationFilters = (linkedPeople: LinkedPerson[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '48h'>('all');
  const [minSuspicion, setMinSuspicion] = useState<number | ''>(0);
  const [maxSuspicion, setMaxSuspicion] = useState<number | ''>(100);
  const [minReliability, setMinReliability] = useState<number | ''>(0);
  const [maxReliability, setMaxReliability] = useState<number | ''>(100);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'matched' | 'with_coords'>('all');

  const [sortBy, setSortBy] = useState<'name' | 'suspicion' | 'reliability' | 'recent'>('recent');

  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    linkedPeople.forEach(p => {
      if (p.location) locs.add(p.location);
    });
    return Array.from(locs).sort();
  }, [linkedPeople]);

  const filteredPeople = useMemo(() => {
    let result = linkedPeople.filter(person => {
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

    // Sorting Logic
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'suspicion':
          return b.suspicionScore - a.suspicionScore;
        case 'reliability':
          return b.reliability - a.reliability;
        case 'recent':
        default:
          const dateA = new Date(Math.max(...a.submissions.map(s => new Date(s.created_at).getTime()))).getTime();
          const dateB = new Date(Math.max(...b.submissions.map(s => new Date(s.created_at).getTime()))).getTime();
          return dateB - dateA;
      }
    });
  }, [linkedPeople, searchQuery, filterType, selectedLocations, timeFilter, minSuspicion, maxSuspicion, minReliability, maxReliability, keywordFilter, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    selectedLocations,
    setSelectedLocations,
    timeFilter,
    setTimeFilter,
    minSuspicion,
    setMinSuspicion,
    maxSuspicion,
    setMaxSuspicion,
    minReliability,
    setMinReliability,
    maxReliability,
    setMaxReliability,
    keywordFilter,
    setKeywordFilter,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    availableLocations,
    filteredPeople,
  };
};
