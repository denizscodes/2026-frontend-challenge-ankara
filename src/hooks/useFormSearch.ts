import { useState, useMemo } from 'react';

export const useFormSearch = (data: any[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();

    return data.filter((item) => {
      // 1. Search in form title
      if (item.form.title.toLowerCase().includes(query)) return true;
      
      // 2. Search in form ID
      if (item.form.id.includes(query)) return true;

      // 3. Search in question texts (content of the form)
      const hasMatchingQuestion = Object.values(item.questions || {}).some((q: any) => 
        q.text?.toLowerCase().includes(query)
      );
      if (hasMatchingQuestion) return true;

      // 4. Search in submission answers (deep search)
      const hasMatchingSubmission = item.submissions?.some((sub: any) => 
        Object.values(sub.answers || {}).some((ans: any) => 
          String(ans.answer || '').toLowerCase().includes(query)
        )
      );
      if (hasMatchingSubmission) return true;

      return false;
    });
  }, [data, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
  };
};
