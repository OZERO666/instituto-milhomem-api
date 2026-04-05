import { useEffect, useState } from 'react';
import { api } from '@/lib/apiServerClient.js';

export function useFeaturedSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const response = await api.fetch('/featured-slots');
        if (response.ok) {
          const data = await response.json();
          setSlots(Array.isArray(data) ? data : []);
        } else {
          setError('Erro ao carregar destaques');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  // Get specific slot by name
  const getSlotByName = (slotName) => slots.find(s => s.slot_name === slotName);

  // Get slots by type
  const getSlotsByType = (type) => slots.filter(s => s.slot_type === type);

  return { slots, loading, error, getSlotByName, getSlotsByType };
}

export function useFeaturedSlot(slotName) {
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slotName) return;

    const fetchSlot = async () => {
      try {
        setLoading(true);
        const response = await api.fetch(`/featured-slots/${slotName}`);
        if (response.ok) {
          const data = await response.json();
          setSlot(data);
        } else {
          setError('Destaque não encontrado');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSlot();
  }, [slotName]);

  return { slot, loading, error };
}
