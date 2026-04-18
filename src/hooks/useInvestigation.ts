import { useMemo } from 'react';
import { useJotform } from './useJotform';
import { JotformSubmission } from '@/types/jotform';

export interface LinkedPerson {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  coordinates?: { lat: number; lng: number }[];
  submissions: (JotformSubmission & { formTitle: string })[];
  lastSeen?: string;
  reliability: number;
  suspicionScore: number;
  suspicionReason?: string;
}

const FORM_IDS = process.env.NEXT_PUBLIC_JOTFORM_FORM_IDS?.split(',') || [];

export const useInvestigation = () => {
  const { data, loading, error, refetch } = useJotform(FORM_IDS);

  const investigationData = useMemo(() => {
    if (!data || data.length === 0) return { linkedPeople: [], totalLeads: 0, matchedCount: 0 };

    const allSubmissions: (JotformSubmission & { formTitle: string })[] = [];
    data.forEach((formItem) => {
      formItem.submissions.forEach((sub: JotformSubmission) => {
        allSubmissions.push({ ...sub, formTitle: formItem.form.title });
      });
    });

    const clusters: (JotformSubmission & { formTitle: string })[][] = [];
    const submissionToCluster = new Map<string, number>();

    // Step 1: Normalize and Extract Identifiers for each submission
    const processedSubs = allSubmissions.map(sub => {
      let name = '';
      let email = '';
      let phone = '';
      let location = '';
      let coords: { lat: number; lng: number } | null = null;

      Object.values(sub.answers).forEach((ans: any) => {
        const text = ans.text.toLowerCase();
        const value = ans.answer;
        if (typeof value !== 'string') return;

        if (text.includes('adınız') || text.includes('name') || text.includes('ad soyad') || text.includes('kişi')) {
          name = value.trim();
        } else if (text.includes('e-posta') || text.includes('email') || text.includes('mail')) {
          email = value.toLowerCase().trim();
        } else if (text.includes('telefon') || text.includes('phone') || text.includes('gsm') || text.includes('no')) {
          phone = value.replace(/\D/g, '');
        } else if (text.includes('konum') || text.includes('location') || text.includes('adres') || text.includes('nerede') || text.includes('yer')) {
          location = value;
        } else if (text.includes('koordinat') || text.includes('coordinate')) {
          const parts = value.split(',').map(p => parseFloat(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            coords = { lat: parts[0], lng: parts[1] };
          }
        }
      });

      return { sub, name, email, phone, location, coords };
    });

    // Step 2: Build Clusters based on identifier overlaps
    processedSubs.forEach((item, i) => {
      let clusterIndex = -1;

      // Check if this submission matches any existing cluster
      for (let j = 0; j < clusters.length; j++) {
        const cluster = clusters[j];
        const isMatch = cluster.some(otherSub => {
          const otherProcessed = processedSubs.find(p => p.sub.id === otherSub.id);
          if (!otherProcessed) return false;

          // High Confidence Matches
          const emailMatch = item.email && otherProcessed.email && item.email === otherProcessed.email;
          const phoneMatch = item.phone && otherProcessed.phone && item.phone === otherProcessed.phone;
          
          // Medium Confidence Matches
          const nameMatch = item.name && otherProcessed.name && 
                           item.name.length > 4 && 
                           item.name.toLowerCase() === otherProcessed.name.toLowerCase() &&
                           !item.name.toLowerCase().includes('anonim');
          
          // Spatial-Temporal Match (New: Linking based on location if name/email missing)
          const locationMatch = item.location && otherProcessed.location && 
                               item.location.toLowerCase() === otherProcessed.location.toLowerCase() &&
                               ((item.name && item.name === otherProcessed.name) || 
                                (item.phone && item.phone === otherProcessed.phone));

          return emailMatch || phoneMatch || nameMatch || locationMatch;
        });

        if (isMatch) {
          clusterIndex = j;
          break;
        }
      }

      if (clusterIndex !== -1) {
        clusters[clusterIndex].push(item.sub);
      } else {
        clusters.push([item.sub]);
      }
    });

    // Step 3: Map Clusters to LinkedPerson objects
    const linkedPeople: LinkedPerson[] = clusters.map((cluster, idx) => {
      const submissions = cluster;
      const clusterProcessed = cluster.map(sub => processedSubs.find(p => p.sub.id === sub.id)!);

      // Aggregate data from all submissions in the cluster
      const name = clusterProcessed.find(p => p.name && !p.name.toLowerCase().includes('anonim'))?.name || 'Anonymous Agent';
      const email = clusterProcessed.find(p => p.email)?.email;
      const phone = clusterProcessed.find(p => p.phone)?.phone;
      const location = clusterProcessed.find(p => p.location)?.location;
      const coordinates = clusterProcessed.filter(p => p.coords).map(p => p.coords!);
      
      // Calculate reliability based on data diversity
      const hasEmail = !!email;
      const hasPhone = !!phone;
      const submissionCount = submissions.length;
      const reliability = Math.min(100, 50 + (submissionCount * 10) + (hasEmail ? 20 : 0) + (hasPhone ? 20 : 0));

      // NEW: Suspicion Analysis (Analytical View)
      let suspicionScore = 0;
      let suspicionReason = "";

      if (name.toLowerCase() !== 'podo') {
        // High frequency reporting is suspicious
        if (submissionCount > 2) {
          suspicionScore += 40;
          suspicionReason = "High-frequency reporting pattern detected.";
        }
        
        // Overlap with Podo's known locations
        if (coordinates.length > 1) {
          suspicionScore += 30;
          suspicionReason = suspicionReason ? "Multiple sighting coordinates provided." : "Multiple coordinates in trail.";
        }

        // Check for specific suspicious keywords in answers
        const hasCriticalKeywords = clusterProcessed.some(p => {
          return Object.values(p.sub.answers).some((ans: any) => {
            const val = String(ans.answer).toLowerCase();
            return val.includes('buldum') || val.includes('tuttum') || val.includes('evimde') || val.includes('yakaladım');
          });
        });

        if (hasCriticalKeywords) {
          suspicionScore += 50;
          suspicionReason = "Critical keywords ('found', 'caught') detected in intel.";
        }
      }

      return {
        id: `persona-${idx}`,
        name,
        email,
        phone,
        location,
        coordinates,
        submissions: submissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        reliability,
        suspicionScore: Math.min(100, suspicionScore),
        suspicionReason,
      };
    }).sort((a, b) => b.suspicionScore - a.suspicionScore || b.submissions.length - a.submissions.length);

    return {
      linkedPeople,
      totalLeads: allSubmissions.length,
      matchedCount: linkedPeople.filter(p => p.submissions.length > 1).length,
    };
  }, [data]);

  return {
    ...investigationData,
    loading,
    error,
    refetch,
  };
};
