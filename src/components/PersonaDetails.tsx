import React from 'react';
import { LinkedPerson } from '@/hooks/useInvestigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Users, 
  Zap, 
  Mail, 
  Phone, 
  MapPin, 
  Database, 
  Clock, 
  Calendar, 
  ExternalLink 
} from 'lucide-react';
import dynamic from 'next/dynamic';

const InvestigationMap = dynamic(() => import('@/components/InvestigationMap'), { ssr: false });

interface PersonaDetailsProps {
  person: LinkedPerson;
  showTimeline?: boolean;
}

export const PersonaDetails = ({ person, showTimeline = true }: PersonaDetailsProps) => {
  return (
    <div className="space-y-8">
      {/* Persona Profile */}
      <Card className="p-8 border-none shadow-xl relative overflow-hidden bg-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center text-muted shrink-0 border-4 border-white shadow-xl">
            <Users className="h-12 w-12" />
          </div>
          <div className="flex-grow">
             <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">VERIFIED IDENTITY</span>
                <span className="text-[10px] font-bold text-muted bg-gray-100 px-2 py-0.5 rounded-full">REL_INDEX: {person.reliability.toFixed(1)}%</span>
             </div>
             <h2 className="text-4xl font-black text-foreground leading-tight">{person.name}</h2>
             
             {/* Suspicion Analysis Overlay */}
             {person.suspicionScore > 0 && person.name.toLowerCase() !== 'podo' && (
               <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                     <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest mb-1">
                        <Zap className="h-4 w-4 fill-red-600" />
                        Threat Assessment: {person.suspicionScore > 75 ? 'Critical' : 'Elevated'}
                     </div>
                     <p className="text-sm font-medium text-foreground opacity-80">{person.suspicionReason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-muted uppercase">Suspicion Score</p>
                        <p className="text-2xl font-black text-red-600">{person.suspicionScore}%</p>
                     </div>
                  </div>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mt-6">
                <div className="flex items-center gap-3 text-sm text-foreground">
                   <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted"><Mail className="h-4 w-4" /></div>
                   <div>
                      <p className="text-[10px] font-bold text-muted uppercase">Primary Contact</p>
                      <p className="font-semibold">{person.email || 'Not available'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                   <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted"><Phone className="h-4 w-4" /></div>
                   <div>
                      <p className="text-[10px] font-bold text-muted uppercase">Phone Number</p>
                      <p className="font-semibold">{person.phone || 'Not available'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                   <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted"><MapPin className="h-4 w-4" /></div>
                   <div>
                      <p className="text-[10px] font-bold text-muted uppercase">Primary Location</p>
                      <p className="font-semibold">{person.location || 'Unknown'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                   <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted"><Database className="h-4 w-4" /></div>
                   <div>
                      <p className="text-[10px] font-bold text-muted uppercase">Active Threads</p>
                      <p className="font-semibold">{person.submissions.length} Sources Linked</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </Card>

      {/* Map Section */}
      {person.coordinates && person.coordinates.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Sighting Locations
          </h3>
          <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-border">
            <InvestigationMap 
              coordinates={person.coordinates.map(c => ({ ...c, label: `Sighting of ${person.name}` }))} 
            />
          </div>
        </div>
      )}

      {/* Timeline of Records */}
      {showTimeline && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Activity Timeline
          </h3>
          <div className="relative space-y-6 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
            {person.submissions.map((sub, idx) => (
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
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
