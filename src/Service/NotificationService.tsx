import axiosInstance from "../Interceptor/AxiosInterceptor.tsx";
import { normalizeListResponse } from "../Utils/DataUtils.ts";

export type NotificationDTO = {
  id: string;
  type: string;
  title: string;
  message?: string;
  body?: string;
  targetUserId?: string;
  targetRole?: string;
  metadata?: any;
  isRead?: boolean;
  createdAt?: string;
}

type SubscribeOpts = { userId?: string; role?: string; profileId?: string; transport?: 'auto' | 'ws' | 'sse' | 'poll' }

export async function fetchNotificationsForUser(recipientId: string, page = 0, size = 50) {
  const url = `/notifications?recipientId=${recipientId}&page=${page}&size=${size}`
  const r = await axiosInstance.get(url)
  const list = normalizeListResponse(r.data);
  
    return list.map((n: any) => {
      const isReadVal = n.isRead !== undefined ? n.isRead : (n.is_read !== undefined ? n.is_read : (n.read !== undefined ? n.read : n.status));
      const parsedIsRead = isReadVal === 1 || isReadVal === '1' || isReadVal === true || String(isReadVal).toLowerCase() === 'true' || isReadVal === '0x01' || String(isReadVal).toUpperCase() === 'READ';
      return { ...n, isRead: parsedIsRead } as NotificationDTO
    });
}

export async function fetchNotificationsForRole(role: string, recipientId: string, page = 0, size = 20) {
  const url = `/notifications/role/${role}?recipientId=${recipientId}&page=${page}&size=${size}`
  const r = await axiosInstance.get(url)
  const list = normalizeListResponse(r.data);

    return list.map((n: any) => {
      const isReadVal = n.isRead !== undefined ? n.isRead : (n.is_read !== undefined ? n.is_read : (n.read !== undefined ? n.read : n.status));
      const parsedIsRead = isReadVal === 1 || isReadVal === '1' || isReadVal === true || String(isReadVal).toLowerCase() === 'true' || isReadVal === '0x01' || String(isReadVal).toUpperCase() === 'READ';
      return { ...n, isRead: parsedIsRead } as NotificationDTO
    });
}

export async function markAsRead(id: string) {
  // Matching @PatchMapping("/{id}/read")
  return axiosInstance.patch(`/notifications/${id}/read`, {})
}

export async function markManyRead(ids: string[]) {
  // Call individual endpoint for list or use mark-all-read if context allows
  // But for better performance, use the dedicated all-read endpoint when available
  return Promise.all(ids.map(id => markAsRead(id)))
}

export async function markAllAsRead(recipientId: string) {
  return axiosInstance.patch(`/notifications/mark-all-read?recipientId=${recipientId}`, {})
}

// subscribeToNotifications: tries STOMP/WebSocket, falls back to SSE, then polling
export async function subscribeToNotifications(opts: SubscribeOpts, onMessage: (n: NotificationDTO) => void) {
  const token = localStorage.getItem('token') || ''
  const seen = new Set<string>()
  let sockJSClient: any = null
  let eventSource: EventSource | null = null
  let pollHandle: number | null = null
  const normalizedRole = String(opts.role || '').toUpperCase()
  const targetUserId = opts.userId || ''
  const profileId = String((opts as any).profileId || '')

  const startStomp = async () => {
    try {
      const SockJSModule = await import('sockjs-client')
      const SockJS = (SockJSModule as any).default || SockJSModule
      const { Client } = await import('@stomp/stompjs')

      // Build URL params dynamically to avoid empty values
      const params = new URLSearchParams()
      if (token) params.set('token', token)
      if (profileId && profileId !== 'undefined' && profileId !== 'null') params.set('profileId', profileId)
      if (targetUserId) params.set('userId', targetUserId)
      if (normalizedRole) params.set('role', normalizedRole)

      // Connect through Gateway (port 9000) → routes to NotificationMS
      const sockUrl = `http://localhost:9000/notification-ws?${params.toString()}`

      const stompClient = new Client({
        webSocketFactory: () => new (SockJS as any)(sockUrl),
        reconnectDelay: 5000,
        onConnect: () => {
          console.log(`🔔 STOMP connected. Identifier: ${profileId || targetUserId || 'GUEST'}`)
          // Subscribe to user-specific queue — backend uses profileId || userId as Principal
          stompClient.subscribe('/user/queue/notifications', (message) => {
            if (message.body) handleRaw(message.body)
          })
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame.headers['message'])
        },
        onDisconnect: () => {
          console.log('🔔 STOMP disconnected')
        }
      })

      stompClient.activate()
      sockJSClient = stompClient
      return true
    } catch (e) {
      console.error('startStomp failed:', e)
      return false
    }
  }

  const startSse = () => {
    try {
      const q = new URLSearchParams()
      if (targetUserId) q.set('userId', targetUserId)
      if (opts.role) q.set('role', opts.role)
      if (token) q.set('token', token)
      const backendBase = (axiosInstance.defaults as any).baseURL || window.location.origin
      const url = backendBase.replace(/\/$/, '') + '/notifications/stream?' + q.toString()
      eventSource = new EventSource(url)
      eventSource.onmessage = (ev) => handleRaw(ev.data)
      eventSource.onerror = () => {}
      return true
    } catch (e) {
      return false
    }
  }

  const startPoll = () => {
    const poll = async () => {
      try {
        const targetId = normalizedRole === 'ADMIN' ? opts.userId : ((opts as any).profileId || opts.userId);
        if (targetId) {
          const list = await fetchNotificationsForUser(targetId, 0, 20);
          list.forEach(handleRaw)
        }
      } catch (e) {}
    }
    pollHandle = window.setInterval(poll, 15000)
    // run immediately
    poll()
  }

  function handleRaw(raw: any) {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      // Backend (Notification entity) uses 'id', but wrapping in Page puts content in 'content'
      const nodes = Array.isArray(parsed?.content) ? parsed.content : (Array.isArray(parsed) ? parsed : [parsed])
      
      nodes.forEach((n: any) => {
        const id = n?.id || n?.notificationId
        if (!id || seen.has(id)) return
        seen.add(id)
        
        // Ensure mapping type properly 0/1 to boolean, including status='READ'
        const isReadVal = n.isRead !== undefined ? n.isRead : (n.is_read !== undefined ? n.is_read : (n.read !== undefined ? n.read : n.status));
        const parsedIsRead = isReadVal === 1 || isReadVal === '1' || isReadVal === true || String(isReadVal).toLowerCase() === 'true' || isReadVal === '0x01' || String(isReadVal).toUpperCase() === 'READ';
        n.isRead = parsedIsRead
        
        onMessage(n as NotificationDTO)
      })
    } catch (e) {}
  }

  // try preferred transports
  const tryWS = opts.transport === 'ws' || opts.transport === 'auto'
  if (tryWS) {
    const ok = await startStomp()
    if (!ok) {
      const ok2 = startSse()
      if (!ok2) startPoll()
    }
  } else if (opts.transport === 'sse') {
    const ok = startSse()
    if (!ok) startPoll()
  } else {
    startPoll()
  }

  return {
    unsubscribe: () => {
      try {
        if (sockJSClient) {
          if (typeof sockJSClient.deactivate === 'function') {
            sockJSClient.deactivate()
          } else if (typeof sockJSClient.close === 'function') {
            sockJSClient.close()
          }
        }
      } catch (e) {}
      try { if (eventSource) eventSource.close() } catch (e) {}
      try { if (pollHandle) window.clearInterval(pollHandle) } catch (e) {}
    }
  }
}
