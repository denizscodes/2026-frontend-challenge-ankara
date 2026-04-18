import { JotformSubmission } from '../types/jotform';

const API_KEY = process.env.NEXT_PUBLIC_JOTFORM_API_KEY;
const FORM_IDS = process.env.NEXT_PUBLIC_JOTFORM_FORM_IDS?.split(',') || [];

interface Sighting {
  timestamp: string;
  coords: string;
  location: string;
  id: string;
}

async function findPodo() {
  if (!API_KEY) {
    console.error('Error: NEXT_PUBLIC_JOTFORM_API_KEY is not defined in environment.');
    return;
  }

  const sightings: Sighting[] = [];
  
  for (const id of FORM_IDS) {
    try {
      const res = await fetch(`https://api.jotform.com/form/${id}/submissions?apiKey=${API_KEY}`);
      const data = await res.json();
      
      if (data.responseCode === 200) {
        const submissions = data.content as JotformSubmission[];
        submissions.forEach((sub) => {
          let coords = '';
          let location = '';
          const timestamp = sub.created_at;
          
          Object.values(sub.answers).forEach((ans: any) => {
            const text = ans.text.toLowerCase();
            const value = ans.answer;
            if (typeof value !== 'string') return;

            if (text.includes('koordinat') || text.includes('coordinate')) {
              coords = value;
            } else if (text.includes('location') || text.includes('konum')) {
              location = value;
            }
          });
          
          if (coords) {
            sightings.push({ timestamp, coords, location, id: sub.id });
          }
        });
      }
    } catch (e) {
      console.error(`Failed to fetch submissions for form ${id}:`, e);
    }
  }
  
  sightings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  console.log("\n--- Podo Intelligence Tracking Report ---");
  console.log(`Analyzing ${FORM_IDS.length} data sources...\n`);
  
  if (sightings.length === 0) {
    console.log("No sightings found in the current intelligence database.");
  } else {
    sightings.slice(0, 5).forEach((s, idx) => {
      const prefix = idx === 0 ? '📍 [LATEST]' : '   [HISTORY]';
      console.log(`${prefix} ${s.timestamp} | ${s.location.padEnd(20)} | Coords: ${s.coords}`);
    });
  }
  console.log("\n----------------------------------------\n");
}

findPodo();
