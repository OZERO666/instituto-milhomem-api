// src/features/admin/hooks/useFaq.js
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import api from '@/lib/apiServerClient';
import { genericSubmit } from '@/features/admin/utils/adminApi.js';

export function useFaq(currentUser) {
  const [faqItems,   setFaqItems]   = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading,   setIsLoading]  = useState(false);

  const faqForm = useForm({
    mode: 'onBlur',
    defaultValues: { pergunta: '', resposta: '', ordem: 0, ativo: 1 },
  });

  const fetchFaq = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.fetch('/faq/all').then(r => r.json());
      if (Array.isArray(res)) setFaqItems(res);
    } catch (err) {
      console.error('Error fetching FAQ:', err);
      toast.error('Erro ao carregar FAQ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFaqSubmit = (data, onSuccess) =>
    genericSubmit({
      collection: 'faq',
      data,
      form: faqForm,
      fileFields: [],
      editingItem,
      setEditingItem,
      currentUser,
      onSuccess,
    });

  return { faqItems, isLoading, faqForm, editingItem, setEditingItem, fetchFaq, handleFaqSubmit };
}
