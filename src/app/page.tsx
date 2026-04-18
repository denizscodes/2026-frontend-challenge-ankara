'use client';

import { useJotform } from '@/hooks/useJotform';
import { useInvestigation } from '@/hooks/useInvestigation';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      item.form.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

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
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
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
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search intel sources, locations, content..."
                icon={<Search className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="dark" className="shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                Advanced
              </Button>
            </div>
          </div>
          <div className="w-full md:w-48 h-64 relative rounded-xl overflow-hidden shadow-2xl border-4 border-white rotate-3 hover:rotate-0 transition-transform duration-500 group">
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


      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full" />
          Intelligence Sources
        </h3>
        <div className="flex gap-2">
          <span className="text-xs text-muted font-medium">Auto-sync: <span className="text-green-600">ON</span></span>
        </div>
      </div>


      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center">
          <div className="mb-4 text-muted">
            <FileText className="h-16 w-16" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">No forms found</h3>
          <p className="mt-2 text-muted">Try adjusting your search or refresh the page.</p>
          <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredData.map((item, index) => (
              <motion.div
                key={item.form.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative overflow-hidden h-full flex flex-col">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Search className="h-6 w-6" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">
                      INTEL SOURCE
                    </span>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="mb-1 text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {item.form.title}
                    </h3>
                    <p className="mb-4 text-xs text-muted font-mono tracking-tight">
                      SOURCE ID: {item.form.id}
                    </p>
                  </div>


                  <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <div className="flex items-center text-sm text-foreground">
                      <MessageSquare className="mr-2 h-4 w-4 text-muted" />
                      <span className="font-semibold">{item.submissions.length}</span>
                      <span className="ml-1 opacity-60">subs</span>
                    </div>
                    <div className="flex items-center text-sm text-foreground">
                      <Clock className="mr-2 h-4 w-4 text-muted" />
                      <span className="font-semibold">{Object.keys(item.questions).length}</span>
                      <span className="ml-1 opacity-60">fields</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link href={`/form/${item.form.id}`} className="block w-full">
                      <Button 
                        className="w-full justify-between" 
                        variant="outline"
                      >
                        View Submissions
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
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
