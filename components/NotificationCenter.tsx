import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Clock } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'request_accepted' | 'info';
  read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Notification));
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-end p-4 sm:p-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-500/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Notificaciones</h2>
              <p className="text-xs text-gray-500">
                {notifications.filter(n => !n.read).length} nuevas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button 
                onClick={markAllAsRead}
                className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                title="Marcar todas como leídas"
              >
                <Check className="h-5 w-5" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-800 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No tienes notificaciones</p>
              <p className="text-gray-600 text-xs mt-1">Te avisaremos cuando haya novedades</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-5 transition-colors group relative ${notification.read ? 'opacity-60' : 'bg-brand-500/5'}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notification.read ? 'bg-transparent' : 'bg-brand-500 shadow-[0_0_8px_rgba(255,51,51,0.5)]'}`} />
                    <div className="flex-1">
                      <p className={`text-sm leading-relaxed ${notification.read ? 'text-gray-400' : 'text-white font-medium'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            SAM IA NOTIFICATIONS
          </p>
        </div>
      </div>
    </div>
  );
};
