'use client';

import { useJotform } from '@/hooks/useJotform';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { ArrowLeft, Table, Layout, Calendar, MessageSquare, Search, FileText, ChevronRight, MapPin } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Input } from '@/components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/Modal';
import dynamic from 'next/dynamic';

const InvestigationMap = dynamic(() => import('@/components/InvestigationMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-muted">Loading Map...</div>
});

export default function FormDetail() {
  const { id } = useParams();
  const router = useRouter();
  const formIds = useMemo(() => [id as string], [id]);
  const { data, loading, error } = useJotform(formIds);

  const [subSearch, setSubSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const formData = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data[0];
  }, [data]);

  const filteredSubmissions = useMemo(() => {
    if (!formData || !formData.submissions) return [];
    return formData.submissions.filter((sub: any) => 
      Object.values(sub.answers).some((ans: any) => 
        String(ans.answer || '').toLowerCase().includes(subSearch.toLowerCase())
      ) || sub.id.toLowerCase().includes(subSearch.toLowerCase())
    );
  }, [formData, subSearch]);

  const submissionCoordinates = useMemo(() => {
    if (!selectedSubmission) return null;
    const coordsAnswer: any = Object.values(selectedSubmission.answers).find((ans: any) => 
      ans.text.toLowerCase().includes('koordinat') || ans.text.toLowerCase().includes('coordinate')
    );
    if (coordsAnswer && typeof coordsAnswer.answer === 'string') {
      const parts = coordsAnswer.answer.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { lat: parts[0], lng: parts[1] };
      }
    }
    return null;
  }, [selectedSubmission]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600">
          <FileText className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Form not found</h2>
        <p className="mt-2 text-muted">The form you are looking for does not exist or you don't have access.</p>
        <Button className="mt-6" onClick={() => router.push('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const { form, submissions, questions } = formData;

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.push('/')} className="-ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Command Center
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
               <img src="/podo.png" alt="Podo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
               <span className="text-[8px] font-bold text-primary">PODO</span>
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Case: #PODO-2026</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="text-[10px] bg-dark text-white px-2 py-0.5 rounded uppercase tracking-tighter font-bold">Intel Channel</span>
               <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase font-bold">Live Feed</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{form.title}</h1>
            <p className="text-muted mt-1 font-medium flex items-center gap-2">
              <span className="text-xs font-mono">Source ID: {form.id}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-xs text-primary font-bold">{submissions.length} Leads Collected</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <Layout className="mr-2 h-4 w-4" />
              Analyze Pattern
            </Button>
            <Button size="sm" variant="dark">
              <Table className="mr-2 h-4 w-4" />
              Export Intel
            </Button>
          </div>
        </div>
      </motion.div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Submissions Section */}
          <section>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Submissions
              </h2>
              <div className="w-full max-w-xs">
                <Input 
                  placeholder="Search submissions..." 
                  size="sm" 
                  icon={<Search className="h-4 w-4" />}
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredSubmissions.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-16 border-2 border-dashed border-border rounded-2xl text-center"
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-background text-muted mb-4">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No submissions found</h3>
                    <p className="text-muted mt-1">
                      {subSearch ? "Try adjusting your search filters." : "This form hasn't received any submissions yet."}
                    </p>
                    {subSearch && (
                      <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSubSearch('')}>
                        Clear Search
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  filteredSubmissions.map((sub: any, idx: number) => (
                    <motion.div
                      key={`${sub.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="hover:border-primary/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-muted font-bold border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Submission #{sub.id.slice(-6)}</p>
                              <p className="text-xs text-muted flex items-center mt-0.5">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(sub.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-muted uppercase font-mono border">
                            IP: {sub.ip}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background/50 p-4 rounded-lg border border-gray-100 mb-4">
                          {Object.entries(sub.answers).slice(0, 4).map(([answerId, ans]: [string, any]) => (
                            <div key={answerId}>

                              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{ans.text}</p>
                              <p className="text-sm text-foreground mt-1 font-medium">{ans.answer || '—'}</p>
                            </div>
                          ))}
                        </div>

                        {/* Primary Content Preview */}
                        {(() => {
                          const getPrimaryContent = () => {
                            const answers = sub.answers;
                            const title = form.title.toLowerCase();
                            const fieldMap: Record<string, string[]> = {
                              'checkins': ['note'],
                              'messages': ['text', 'mesaj'],
                              'sightings': ['note', 'sighting details'],
                              'personal notes': ['note'],
                              'tips': ['tip', 'bilgi']
                            };

                            for (const [key, fields] of Object.entries(fieldMap)) {
                              if (title.includes(key)) {
                                for (const field of fields) {
                                  const match = Object.values(answers).find((a: any) => a.text.toLowerCase().includes(field));
                                  if (match && match.answer) return match.answer;
                                }
                              }
                            }
                            const fallback = Object.values(answers).find((a: any) => 
                              a.text.toLowerCase().includes('note') || 
                              a.text.toLowerCase().includes('text') ||
                              a.text.toLowerCase().includes('tip')
                            );
                            return fallback?.answer || null;
                          };

                          const content = getPrimaryContent();
                          if (!content) return null;

                          return (
                            <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden">
                               <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                              
                               <p className="text-sm text-foreground font-medium italic leading-relaxed">"{content}"</p>
                            </div>
                          );
                        })()}
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-8"
                            onClick={() => setSelectedSubmission(sub)}
                          >
                            View Details <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Form Structure / Questions */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Layout className="mr-2 h-5 w-5 text-primary" />
              Form Structure
            </h2>
            <Card className="p-0 overflow-hidden border-border shadow-sm">
              <div className="bg-background px-6 py-3 border-b border-border">
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Field List ({Object.keys(questions).length})</p>
              </div>
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto custom-scrollbar">
                {Object.values(questions).map((q: any) => (
                  <div key={q.qid} className="px-6 py-4 flex items-center gap-4 hover:bg-background transition-colors">
                    <div className="h-8 w-8 rounded bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{q.text}</p>
                      <p className="text-[10px] text-muted uppercase font-mono tracking-tighter">{q.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Form Meta Info */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
               <div className="w-1.5 h-5 bg-primary mr-2 rounded-full" />
               Analytics
            </h2>
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Source Quality</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase border border-green-100">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Last Intel</span>
                <span className="text-sm font-semibold text-foreground">{submissions.length > 0 ? new Date(submissions[0].created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Reliability Index</span>
                <span className="text-sm font-bold text-primary">84.2%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '84.2%' }} />
              </div>
            </Card>
          </section>

          {/* Record Linking Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
               <div className="w-1.5 h-5 bg-dark mr-2 rounded-full" />
               Intelligence Connections
            </h2>
            <Card className="p-4 bg-dark text-white border-none shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
              <p className="text-xs text-primary font-bold uppercase tracking-widest mb-4">Record Linking Active</p>
              <div className="space-y-3 relative z-10">
                 <div className="p-3 bg-card/10 rounded-lg border border-white/10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                       <p className="text-[10px] text-muted font-bold uppercase">Cross-Source Match</p>
                       <p className="text-xs font-medium">Potential sighting link in "Sightings" source</p>
                    </div>
                 </div>
                 <div className="p-3 bg-card/10 rounded-lg border border-white/10 flex items-center gap-3 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-background0" />
                    <div>
                       <p className="text-[10px] text-muted font-bold uppercase">Identity Correlation</p>
                       <p className="text-xs font-medium">Matching phone number in "Messages"</p>
                    </div>
                 </div>
              </div>
              <Button variant="outline" className="w-full mt-6 border-white/20 text-white hover:bg-card/10 h-9 text-xs">
                Run Cross-Reference
              </Button>
            </Card>
          </section>
        </div>


      </div>

      <Modal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        title={`Submission Details - #${selectedSubmission?.id.slice(-6)}`}
      >
        {selectedSubmission && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-background p-4 rounded-xl border">
              <div>
                <p className="text-xs text-muted uppercase font-bold">Created At</p>
                <p className="text-sm font-medium">{new Date(selectedSubmission.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase font-bold">IP Address</p>
                <p className="text-sm font-medium">{selectedSubmission.ip}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-foreground border-b pb-2">Form Responses</h4>
              {Object.values(selectedSubmission.answers).map((ans: any) => (
                <div key={ans.text} className="bg-card p-4 rounded-lg border shadow-sm">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{ans.text}</p>
                  <p className="text-foreground whitespace-pre-wrap">{ans.answer || <span className="text-muted italic">No response</span>}</p>
                </div>
              ))}
            </div>

            {submissionCoordinates && (
              <div className="space-y-4">
                <h4 className="font-bold text-foreground border-b pb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Geographic Intelligence
                </h4>
                <div className="h-64 w-full">
                  <InvestigationMap 
                    coordinates={[{ ...submissionCoordinates, label: 'Lead Location' }]} 
                    zoom={15}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

