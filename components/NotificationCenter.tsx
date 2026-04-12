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
      <div className="absolute inset-0 bg-surface/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-surface border border-outline/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-outline/10 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-headline font-black text-on-surface uppercase tracking-tight">Notificaciones</h2>
              <p className="text-[10px] text-on-surface-variant font-label uppercase font-bold tracking-widest">
                {notifications.filter(n => !n.read).length} nuevas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button 
                onClick={markAllAsRead}
                className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                title="Marcar todas como leídas"
              >
                <Check className="h-5 w-5" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest">Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-surface-variant mx-auto mb-4" />
              <p className="text-on-surface font-headline font-black uppercase tracking-tight">No tienes notificaciones</p>
              <p className="text-on-surface-variant text-[10px] mt-1 font-label uppercase tracking-widest">Te avisaremos cuando haya novedades</p>
            </div>
          ) : (
            <div className="divide-y divide-outline/10">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-5 transition-colors group relative ${notification.read ? 'opacity-60' : 'bg-primary/5'}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notification.read ? 'bg-transparent' : 'bg-primary shadow-[0_0_8px_#b6a0ff]'}`} />
                    <div className="flex-1">
                      <p className={`text-sm leading-relaxed font-label ${notification.read ? 'text-on-surface-variant' : 'text-on-surface font-medium'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-on-surface-variant font-label uppercase tracking-widest font-bold">
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
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-error/20 rounded-lg text-on-surface-variant hover:text-error transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-surface-variant/30 border-t border-outline/10 text-center">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-headline font-black italic">
            AETHER PROTECT
          </p>
        </div>
      </div>
    </div>
  );
};
