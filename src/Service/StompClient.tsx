// Minimal stomp wrapper: lazy-loads libs, connects with token, exposes subscribe/unsubscribe
import type { IMessage } from '@stomp/stompjs'

let client: any = null

export async function connectStomp(url = '/notification-ws', token?: string) {
  if (client && client.connected) return client
  const [{ Client }, SockJSModule] = await Promise.all([import('@stomp/stompjs'), import('sockjs-client')])
  const SockJS = (SockJSModule as any).default || SockJSModule
  client = new Client({
    webSocketFactory: () => new (SockJS as any)(url),
    connectHeaders: { Authorization: token ? `Bearer ${token}` : '' },
    reconnectDelay: 5000,
  })
  return new Promise<any>((resolve, reject) => {
    client.onConnect = () => resolve(client)
    client.onStompError = (err: any) => reject(err)
    client.activate()
  })
}

export function subscribe(destination: string, cb: (msg: any) => void) {
  if (!client) throw new Error('stomp-not-connected')
  return client.subscribe(destination, (m: IMessage) => {
    try {
      const b = (m.body as string) || '{}'
      const parsed = JSON.parse(b)
      cb(parsed)
    } catch (e) {
      try { cb((m.body as any)) } catch (err) {}
    }
  })
}

export function disconnect() { try { client && client.deactivate && client.deactivate() } catch(e){} }
