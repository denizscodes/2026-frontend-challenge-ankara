import { useState, useEffect, useCallback } from 'react';
import { jotformService } from '@/services/jotform';
import toast from 'react-hot-toast';

export const useJotform = (formIds: string[]) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await jotformService.getAllFormsData(formIds);
      setData(results);
    } catch (err: any) {
      const message = err.message || 'Failed to fetch Jotform data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [formIds.join(',')]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
