'use client';

import { useJotform } from '@/hooks/useJotform';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { ArrowLeft, Table, Layout, Calendar, MessageSquare, Search, FileText, ChevronRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Input } from '@/components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/Modal';

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
        <h2 className="text-2xl font-bold text-gray-900">Form not found</h2>
        <p className="mt-2 text-gray-500">The form you are looking for does not exist or you don't have access.</p>
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
        <Button variant="ghost" onClick={() => router.push('/')} className="-ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded border">ID: {form.id}</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                {submissions.length} Submissions
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <Layout className="mr-2 h-4 w-4" />
              Edit Form
            </Button>
            <Button size="sm">
              <Table className="mr-2 h-4 w-4" />
              Export CSV
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
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No submissions found</h3>
                    <p className="text-gray-500 mt-1">
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
                            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Submission #{sub.id.slice(-6)}</p>
                              <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(sub.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase font-mono border">
                            IP: {sub.ip}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                          {Object.entries(sub.answers).slice(0, 4).map(([answerId, ans]: [string, any]) => (
                            <div key={answerId}>

                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ans.text}</p>
                              <p className="text-sm text-gray-700 mt-1 font-medium">{ans.answer || '—'}</p>
                            </div>
                          ))}
                        </div>
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
              <div className="bg-gray-50 px-6 py-3 border-b border-border">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Field List ({Object.keys(questions).length})</p>
              </div>
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto custom-scrollbar">
                {Object.values(questions).map((q: any) => (
                  <div key={q.qid} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="h-8 w-8 rounded bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{q.text}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-mono tracking-tighter">{q.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Form Meta Info */}
          <section>
            <h2 className="text-xl font-bold mb-4">Analytics</h2>
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase border border-green-100">{form.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created At</span>
                <span className="text-sm font-semibold text-gray-900">{new Date(form.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Views</span>
                <span className="text-sm font-semibold text-gray-900">1,248</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-gray-500 font-medium">Response Rate</span>
                <span className="text-sm font-bold text-primary">84.2%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '84.2%' }} />
              </div>
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
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Created At</p>
                <p className="text-sm font-medium">{new Date(selectedSubmission.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">IP Address</p>
                <p className="text-sm font-medium">{selectedSubmission.ip}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 border-b pb-2">Form Responses</h4>
              {Object.values(selectedSubmission.answers).map((ans: any) => (
                <div key={ans.text} className="bg-white p-4 rounded-lg border shadow-sm">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{ans.text}</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{ans.answer || <span className="text-gray-300 italic">No response</span>}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

