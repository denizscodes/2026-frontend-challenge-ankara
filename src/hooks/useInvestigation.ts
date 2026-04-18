import { useMemo } from 'react';
import { useJotform } from './useJotform';
import { JotformSubmission } from '@/types/jotform';

export interface LinkedPerson {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  submissions: (JotformSubmission & { formTitle: string })[];
  lastSeen?: string;
  reliability: number;
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

    const peopleMap = new Map<string, LinkedPerson>();

    allSubmissions.forEach((sub) => {
      // Extract potential identifiers
      let name = 'Anonymous Agent';
      let email = '';
      let phone = '';
      let location = '';

      Object.values(sub.answers).forEach((ans: any) => {
        const text = ans.text.toLowerCase();
        const value = ans.answer;

        if (typeof value === 'string') {
          if (text.includes('adınız') || text.includes('name') || text.includes('ad soyad')) {
            name = value;
          } else if (text.includes('e-posta') || text.includes('email')) {
            email = value.toLowerCase().trim();
          } else if (text.includes('telefon') || text.includes('phone') || text.includes('gsm')) {
            phone = value.replace(/\D/g, '');
          } else if (text.includes('konum') || text.includes('location') || text.includes('adres') || text.includes('nerede')) {
            location = value;
          }
        }
      });

      // Simple linking logic: Priority is Email > Phone > Name
      const linkKey = email || phone || name;
      
      if (peopleMap.has(linkKey)) {
        const person = peopleMap.get(linkKey)!;
        person.submissions.push(sub);
        // Update name if we found a better one
        if (name !== 'Anonymous Agent' && person.name === 'Anonymous Agent') {
          person.name = name;
        }
        if (email && !person.email) person.email = email;
        if (phone && !person.phone) person.phone = phone;
        if (location && !person.location) person.location = location;
      } else {
        peopleMap.set(linkKey, {
          id: linkKey,
          name,
          email,
          phone,
          location,
          submissions: [sub],
          reliability: 70 + Math.random() * 20, // Mock reliability for UI
        });
      }
    });

    const linkedPeople = Array.from(peopleMap.values()).sort((a, b) => 
      b.submissions.length - a.submissions.length
    );

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
