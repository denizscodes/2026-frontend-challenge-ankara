import { useMemo } from 'react';
import { useJotform } from './useJotform';
import { JotformSubmission } from '@/types/jotform';

export interface LinkedPerson {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  coordinates: { lat: number; lng: number; timestamp: string }[];
  submissions: (JotformSubmission & { formTitle: string })[];
  lastSeen?: string;
  reliability: number;
  suspicionScore: number;
  suspicionReason?: string;
  relationToPodo?: 'direct' | 'shadow' | 'proxy' | 'observer' | 'none';
  suspicionBreakdown?: {
    persistentFollowing: number;
    trajectoryMatch: number;
    criticalKeywords: number;
    spatialProximity: number;
    singleCoPresence: number;
  };
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
    const linkedPeopleRaw: LinkedPerson[] = clusters.map((cluster, idx) => {
      const submissions = cluster;
      const clusterProcessed = cluster.map(sub => processedSubs.find(p => p.sub.id === sub.id)!);

      const name = clusterProcessed.find(p => p.name && !p.name.toLowerCase().includes('anonim'))?.name || 'Anonymous Agent';
      const email = clusterProcessed.find(p => p.email)?.email;
      const phone = clusterProcessed.find(p => p.phone)?.phone;
      const location = clusterProcessed.find(p => p.location)?.location;
      const coordinates = clusterProcessed
        .filter(p => p.coords)
        .map(p => ({ ...p.coords!, timestamp: p.sub.created_at }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      const hasEmail = !!email;
      const hasPhone = !!phone;
      const submissionCount = submissions.length;
      const reliability = Math.min(100, 50 + (submissionCount * 10) + (hasEmail ? 20 : 0) + (hasPhone ? 20 : 0));

      return {
        id: `persona-${idx}`,
        name,
        email,
        phone,
        location,
        coordinates,
        submissions: submissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        reliability,
        suspicionScore: 0, // Will calculate in Step 4
        suspicionReason: "",
        relationToPodo: 'none',
        suspicionBreakdown: {
          persistentFollowing: 0,
          trajectoryMatch: 0,
          criticalKeywords: 0,
          spatialProximity: 0,
          singleCoPresence: 0,
        }
      };
    });

    // Step 4: Cross-Persona Analysis (Trail Overlap)
    const podoPersona = linkedPeopleRaw.find(p => p.name.toLowerCase().trim().includes('podo'));
    const podoCoords = podoPersona?.coordinates || [];

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // meters
      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const linkedPeople = linkedPeopleRaw.map(person => {
      if (person.name.toLowerCase().trim().includes('podo')) return person;

      let suspicionScore = 0;
      let reasons: string[] = [];
      let relationToPodo: LinkedPerson['relationToPodo'] = 'none';
      let breakdown = {
        persistentFollowing: 0,
        trajectoryMatch: 0,
        criticalKeywords: 0,
        spatialProximity: 0,
        singleCoPresence: 0,
      };

      // Basic Suspicion
      // (High-frequency reporting removed as per request)


      // Advanced Spatiotemporal Analysis
      let shadowCount = 0;
      let extremeProximityCount = 0;
      let synchronousTimestamps: number[] = [];

      if (podoCoords.length > 1) {
        person.coordinates.forEach(pCoord => {
          let minDistance = Infinity;
          let closestPodoTime: string | null = null;
          
          for (let i = 0; i < podoCoords.length - 1; i++) {
            const v = podoCoords[i];
            const w = podoCoords[i+1];
            
            const l2 = Math.pow(v.lat - w.lat, 2) + Math.pow(v.lng - w.lng, 2);
            let d;
            let currentProjTime: string;

            if (l2 === 0) {
              d = getDistance(pCoord.lat, pCoord.lng, v.lat, v.lng);
              currentProjTime = v.timestamp;
            } else {
              let t = ((pCoord.lat - v.lat) * (w.lat - v.lat) + (pCoord.lng - v.lng) * (w.lng - v.lng)) / l2;
              t = Math.max(0, Math.min(1, t));
              const projection = {
                lat: v.lat + t * (w.lat - v.lat),
                lng: v.lng + t * (w.lng - v.lng)
              };
              d = getDistance(pCoord.lat, pCoord.lng, projection.lat, projection.lng);
              
              // Interpolate time for the projection point
              const vTime = new Date(v.timestamp).getTime();
              const wTime = new Date(w.timestamp).getTime();
              currentProjTime = new Date(vTime + t * (wTime - vTime)).toISOString();
            }

            if (d < minDistance) {
              minDistance = d;
              closestPodoTime = currentProjTime;
            }
          }
          
          if (minDistance < 300) {
            shadowCount++;
            if (minDistance < 100) extremeProximityCount++;
            
            // Temporal Check: Was the person there at the same time?
            if (closestPodoTime) {
              const personTime = new Date(pCoord.timestamp).getTime();
              const podoTime = new Date(closestPodoTime).getTime();
              const timeDiffMinutes = Math.abs(personTime - podoTime) / (1000 * 60);
              if (timeDiffMinutes < 60) { // Within 1 hour
                synchronousTimestamps.push(personTime);
              }
            }
          }
        });
      }

      // Relational Evaluation: Check for distinct co-occurrence events
      synchronousTimestamps.sort((a, b) => a - b);
      let distinctSynchronousEvents = 0;
      if (synchronousTimestamps.length > 0) {
        distinctSynchronousEvents = 1;
        let lastEventTime = synchronousTimestamps[0];
        for (let i = 1; i < synchronousTimestamps.length; i++) {
          if (synchronousTimestamps[i] - lastEventTime > 30 * 60 * 1000) { // 30 mins gap between events
            distinctSynchronousEvents++;
            lastEventTime = synchronousTimestamps[i];
          }
        }
      }

      if (distinctSynchronousEvents > 1) {
        breakdown.persistentFollowing = 60;
        suspicionScore += 60;
        reasons.push(`Persistent Co-occurrence: Persona moving in sync with Podo across ${distinctSynchronousEvents} distinct time windows.`);
        relationToPodo = 'direct';
      } else if (distinctSynchronousEvents === 1) {
        breakdown.singleCoPresence = 30;
        suspicionScore += 30;
        reasons.push("Single-instance Co-presence: Persona was near Podo's location at the same time.");
        if (relationToPodo === 'none') relationToPodo = 'observer';
      } else if (extremeProximityCount > 0) {
        breakdown.spatialProximity = 30;
        suspicionScore += 30;
        reasons.push(`High Spatial Proximity: Persona frequently appears in Podo's movement corridor.`);
        relationToPodo = 'proxy';
      }

      if (shadowCount > 0) {
        const shadowRatio = shadowCount / person.coordinates.length;
        if (shadowRatio > 0.6) {
          breakdown.trajectoryMatch = 40;
          suspicionScore += 40;
          reasons.push("Strategic Trajectory Match: Route mirrors Podo's trail.");
          if (relationToPodo !== 'direct') relationToPodo = 'shadow';
        }
      }

      // Keyword Analysis
      const hasCriticalKeywords = person.submissions.some(sub => {
        return Object.values(sub.answers).some((ans: any) => {
          const val = String(ans.answer).toLowerCase();
          return val.includes('buldum') || val.includes('tuttum') || val.includes('evimde') || val.includes('yakaladım');
        });
      });

      if (hasCriticalKeywords) {
        breakdown.criticalKeywords = 40;
        suspicionScore += 40;
        reasons.push("Critical keywords detected in intel.");
      }

      return {
        ...person,
        suspicionScore: Math.min(100, suspicionScore),
        suspicionReason: reasons.join(" "),
        relationToPodo,
        suspicionBreakdown: breakdown,
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
