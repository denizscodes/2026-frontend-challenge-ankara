'use client';

import { useJotform } from '@/hooks/useJotform';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CardSkeleton } from '@/components/Skeleton';
import { Search, Filter, RefreshCcw, FileText, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

const FORM_IDS = process.env.NEXT_PUBLIC_JOTFORM_FORM_IDS?.split(',') || [];

export default function Home() {
  const { data, loading, error, refetch } = useJotform(FORM_IDS);
  const [searchQuery, setSearchQuery] = useState('');

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
        <h2 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
        <p className="mt-2 max-w-md text-gray-500">{error}</p>
        <Button className="mt-6" onClick={refetch}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <header className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Forms Dashboard
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Monitor and manage your Jotform submissions in real-time.
          </p>
        </div>
        <div className="flex w-full max-w-md gap-3">
          <Input
            placeholder="Search forms..."
            icon={<Search className="h-5 w-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="dark" className="shrink-0">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center">
          <div className="mb-4 text-gray-400">
            <FileText className="h-16 w-16" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No forms found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or refresh the page.</p>
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
                      <FileText className="h-6 w-6" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {item.form.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="mb-1 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {item.form.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-500 line-clamp-2">
                      Last updated: {new Date(item.form.updated_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MessageSquare className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="font-semibold">{item.submissions.length}</span>
                      <span className="ml-1 opacity-60">subs</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-2 h-4 w-4 text-gray-400" />
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
