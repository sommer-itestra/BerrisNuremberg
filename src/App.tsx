import React, { useState, useEffect } from 'react';
import { PlusCircle, Send, Trash2, TrashIcon } from 'lucide-react';
import type { FoodOrder } from './types';
import { subscribeToOrders, addOrder, deleteOrder, deleteAllOrders } from './supabase';

function App() {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [userName, setUserName] = useState('');
  const [foodItem, setFoodItem] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOrders(setOrders);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !foodItem.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addOrder({
        user_name: userName.trim(),
        food_item: foodItem.trim(),
        notes: notes.trim() || undefined,
      });
      setFoodItem('');
      setNotes('');
    } catch (error) {
      console.error('Failed to add order:', error);
      alert('Failed to add order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOrder = async (id: string) => {
    try {
      await deleteOrder(id);
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Bist du wirklich sicher, dass du alle Bestellungen löschen möchtest?')) {
      return;
    }

    setIsClearing(true);
    try {
      await deleteAllOrders();
    } catch (error) {
      console.error('Failed to clear all orders:', error);
      alert('Failed to clear all orders. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const message = orders
      .map(order => {
        const baseText = `${order.user_name}: ${order.food_item}`;
        return order.notes ? `${baseText} (${order.notes})` : baseText;
      })
      .join('\n');

    const encodedMessage = encodeURIComponent(`📋 Essensbestellung:\n\n${message}`);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Essensbestellung Sammler
        </h1>

        <form onSubmit={handleAddOrder} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid gap-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Dein Name"
              />
            </div>

            <div>
              <label htmlFor="foodItem" className="block text-sm font-medium text-gray-700 mb-1">
                Bestellung
              </label>
              <input
                id="foodItem"
                type="text"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="z.B. Pizza Margherita"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Anmerkungen (optional)
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="z.B. ohne Zwiebeln"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Wird hinzugefügt...' : 'Bestellung hinzufügen'}
            </button>
          </div>
        </form>

        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Bestellungen</h2>
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className={`inline-flex items-center justify-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  isClearing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                {isClearing ? 'Wird gelöscht...' : 'Alle löschen'}
              </button>
            </div>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-800">{order.user_name}</p>
                    <p className="text-gray-600">{order.food_item}</p>
                    {order.notes && (
                      <p className="text-sm text-gray-500">Anmerkung: {order.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveOrder(order.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={generateWhatsAppMessage}
              className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Send className="w-5 h-5 mr-2" />
              WhatsApp Nachricht erstellen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
