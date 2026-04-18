'use client';

import { useJotform } from '@/hooks/useJotform';
import { useInvestigation } from '@/hooks/useInvestigation';
import { useFormSearch } from '@/hooks/useFormSearch';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CardSkeleton } from '@/components/Skeleton';
import { Search, Filter, RefreshCcw, FileText, ChevronRight, Clock, MessageSquare, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

const FORM_IDS = process.env.NEXT_PUBLIC_JOTFORM_FORM_IDS?.split(',') || [];

export default function Home() {
  const { data, loading, error, refetch } = useJotform(FORM_IDS);
  const { linkedPeople } = useInvestigation();
  const { searchQuery, setSearchQuery, filteredData } = useFormSearch(data);

  const latestSighting = useMemo(() => {
    if (!linkedPeople || linkedPeople.length === 0) return null;
    // Get all submissions across all people and sort by date
    const allSubs = linkedPeople.flatMap(p => p.submissions.map(sub => ({
      ...sub,
      location: p.location || 'Unknown'
    })));
    allSubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return allSubs[0];
  }, [linkedPeople]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600">
          <RefreshCcw className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Oops! Something went wrong</h2>
        <p className="mt-2 max-w-md text-muted">{error}</p>
        <Button className="mt-6" onClick={refetch}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <header className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-center bg-card p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center w-full">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase">Active Case</span>
              <span className="text-muted text-xs">#PODO-2026-X</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Investigation Command <span className="text-primary">Center</span>
            </h2>
            <p className="mt-3 text-lg text-muted">
              Analyze intelligence sources, match records, and track Podo's trail across the city.
            </p>
          </div>
          <div className="w-full md:w-48 h-64 relative rounded-xl overflow-hidden shadow-2xl border-4 border-white rotate-3 hover:rotate-0 transition-transform duration-500 group hidden md:block">
             <img src="/podo_poster.png" alt="Missing Podo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <p className="text-white text-[10px] font-bold uppercase flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary fill-primary" />
                  Last Seen: {latestSighting?.location || 'Oakwood'}
                </p>
             </div>
          </div>
        </div>
      </header>


      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full" />
            Intelligence Sources
          </h3>
          <p className="text-sm text-muted mt-1 ml-4">
            Showing {filteredData.length} of {data.length} active channels
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[400px]">
          <Input
            placeholder="Search forms, content, locations..."
            icon={<Search className="h-5 w-5 text-primary" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-primary/20 focus:border-primary shadow-sm"
          />
          <div className="flex gap-2 shrink-0">
            <Button variant="dark" className="flex-1 sm:flex-none">
              <Filter className="mr-2 h-4 w-4 text-primary" />
              Filter
            </Button>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="flex-1 sm:flex-none"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>


      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/30 p-12 text-center"
        >
          <div className="mb-4 text-muted/30">
            <Search className="h-16 w-16" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">No matches found</h3>
          <p className="mt-2 text-muted max-w-sm">
            We couldn't find any intelligence sources matching "{searchQuery}". Try searching for locations or field names.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>
            Reset Investigation Search
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredData.map((item, index) => (
              <motion.div
                key={item.form.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/40">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary transition-all group-hover:bg-primary group-hover:text-white shadow-inner">
                      <Search className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-tighter">
                        INTEL SOURCE
                      </span>
                      {item.submissions.length > 5 && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[8px] font-black text-green-700 border border-green-200 uppercase animate-pulse">
                          HIGH ACTIVITY
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="mb-1 text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {item.form.title}
                    </h3>
                    <p className="mb-4 text-[10px] text-muted font-mono tracking-widest uppercase opacity-60">
                      REF: {item.form.id}
                    </p>
                  </div>


                  <div className="mt-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                      <div className="flex items-center text-sm text-foreground">
                        <div className="p-1.5 rounded-lg bg-background mr-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-bold">{item.submissions.length}</span>
                        <span className="ml-1 text-muted text-xs">entries</span>
                      </div>
                      <div className="flex items-center text-sm text-foreground">
                        <div className="p-1.5 rounded-lg bg-background mr-2">
                          <Clock className="h-4 w-4 text-muted" />
                        </div>
                        <span className="font-bold">{Object.keys(item.questions).length}</span>
                        <span className="ml-1 text-muted text-xs">fields</span>
                      </div>
                    </div>

                    <div className="relative group/btn">
                      <Link href={`/form/${item.form.id}`} className="block w-full">
                        <Button 
                          className="w-full justify-between pr-2 group-hover/btn:bg-primary group-hover/btn:text-white transition-all" 
                          variant="outline"
                        >
                          Deep Dive Intel
                          <div className="bg-primary/10 group-hover/btn:bg-white/20 p-1 rounded-lg transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
