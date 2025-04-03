import { createClient } from '@supabase/supabase-js';
import type { FoodOrder } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const subscribeToOrders = (
  callback: (orders: FoodOrder[]) => void
) => {
  // Initial fetch
  getOrders().then(callback);

  // Real-time updates
  const channel = supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders'
      },
      () => {
        getOrders().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const getOrders = async (): Promise<FoodOrder[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
};

export const addOrder = async (order: Omit<FoodOrder, 'id' | 'created_at'>) => {
  const { error } = await supabase
    .from('orders')
    .insert([order]);

  if (error) {
    console.error('Error adding order:', error);
    throw error;
  }
  window.location.reload();
};

export const deleteOrder = async (id: string) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
  window.location.reload();
};

export const deleteAllOrders = async () => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) {
    console.error('Error deleting all orders:', error);
    throw error;
  }
  window.location.reload();
};