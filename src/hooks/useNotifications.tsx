import { useEffect, useState, useRef, useCallback } from 'react'
import { 
  NotificationDTO, 
  fetchNotificationsForUser, 
  markAsRead as serviceMarkAsRead, 
  markAllAsRead as serviceMarkAllAsRead,
  subscribeToNotifications 
} from '../Service/NotificationService.tsx'
import { useSelector } from 'react-redux'
import { notifications as mantineNotifications } from '@mantine/notifications'

export default function useNotifications(userIdProp?: string, roleProp?: string) {
  const userFromStore = useSelector((s: any) => s.user)
  const profileFromStore = useSelector((s: any) => s.profile)
  
  const userId = userIdProp || userFromStore?.id || userFromStore?.userId
  const profileId = userFromStore?.profileId || profileFromStore?.profileId || profileFromStore?.id
  const role = roleProp || userFromStore?.role || userFromStore?.roles?.[0]
  const normalizedRole = String(role || '').toUpperCase()

  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [wsStatus, setWsStatus] = useState<'connecting' | 'online' | 'offline'>('connecting')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const seenRef = useRef(new Set<string>())
  const subRef = useRef<any>(null)

  const targetId = normalizedRole === 'ADMIN' ? userId : (profileId || userId);

  const loadNotifications = useCallback(async (pagenum: number, append = false) => {
    if (!targetId) return;
    try {
      setLoading(true);
      const data: any = await fetchNotificationsForUser(targetId, pagenum, 20);
      const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
      
      if (list.length < 20) setHasMore(false);
      else setHasMore(true);

      if (append) {
        setNotifications(prev => {
          const filtered = list.filter((n: any) => !seenRef.current.has(n.id));
          filtered.forEach((n: any) => seenRef.current.add(n.id));
          return [...prev, ...filtered];
        });
      } else {
        seenRef.current.clear();
        list.forEach((n: any) => seenRef.current.add(n.id));
        setNotifications(list);
      }
      setPage(pagenum);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    loadNotifications(0, false);
  }, [loadNotifications]);

  useEffect(() => {
    if (!userId && !profileId) return

    try { subRef.current?.unsubscribe() } catch (e) {}
    subRef.current = null

    let mounted = true
    ;(async () => {
      try {
        setWsStatus('connecting')
        const handle = await subscribeToNotifications({ 
          userId: userId, 
          role, 
          transport: 'auto', 
          profileId: profileId 
        } as any, (n) => {
          if (!mounted) return
          if (seenRef.current.has(n.id)) return
          seenRef.current.add(n.id)
          
          mantineNotifications.show({
            title: n.title || 'New Notification',
            message: n.message || n.body || 'You have received a new notification.',
            color: 'blue',
            autoClose: 6000,
          })

          setNotifications(prev => [n, ...prev])
        })
        subRef.current = handle
        if (mounted) setWsStatus('online')
      } catch (err) {
        console.error("🔔 WebSocket connection failed:", err)
        if (mounted) setWsStatus('offline')
      }
    })()
    return () => { mounted = false; try { subRef.current?.unsubscribe() } catch (e) {} }
  }, [userId, role, profileId])

  const markRead = useCallback(async (id: string) => {
    try { 
      await serviceMarkAsRead(id)
      setNotifications(prev => prev.map(p => p.id == id ? { ...p, isRead: true } : p))
    } catch (e) { 
      console.error("Failed to mark notification as read:", e)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    if (!targetId) return
    try { 
      await serviceMarkAllAsRead(targetId)
      setNotifications(prev => prev.map(p => ({ ...p, isRead: true })))
    } catch (e) {
      console.error("Failed to mark all as read:", e)
    }
  }, [targetId])

  const unreadCount = notifications.filter(n => !n.isRead).length

  return { notifications, loading, unreadCount, markRead, markAllRead, wsStatus, hasMore, loadMore: () => loadNotifications(page + 1, true) }
}
