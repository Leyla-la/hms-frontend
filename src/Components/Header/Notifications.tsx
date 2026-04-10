import { useState } from 'react'
import { ActionIcon, Popover, Badge, Button, ScrollArea, Group, Text, Divider, UnstyledButton } from '@mantine/core'
import { IconBellRinging, IconBellOff } from '@tabler/icons-react'
import useNotifications from '../../hooks/useNotifications.tsx'
import { useSelector } from 'react-redux'

export default function Notifications() {
  const user = useSelector((s: any) => s.user)
  // JWT claim uses `userId` (set by UserMS JwtUtil); some old tokens may still carry `id`
  const resolvedUserId = user?.userId || user?.id
  const { notifications, unreadCount, markRead, markAllRead, loading, hasMore, loadMore } = useNotifications(resolvedUserId, user?.role)

  const [opened, setOpened] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleItemClick = (id: string, isReadVal: any) => {
    const isRead = !!isReadVal;
    if (!isRead) {
      markRead(id);
    }
    setExpandedId(prev => (prev == id ? null : id));
  };

  const newest = [...notifications]

  return (
    <>
      <Popover opened={opened} onClose={() => setOpened(false)} position="bottom" radius="md" shadow="md">
        <Popover.Target>
          <div style={{ position: 'relative' }}>
            <ActionIcon variant="transparent" size="md" aria-label="Notifications" onClick={() => setOpened((o) => !o)}>
              <IconBellRinging style={{ width: '98%', height: '98%', transform: 'translateY(3px)', color: '#433a3b' }} stroke={2} />
            </ActionIcon>
            {unreadCount > 0 && (
              <div
                role="status"
                aria-label={`${unreadCount} unread notifications`}
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 0,
                  width: 16,
                  height: 16,
                  backgroundColor: 'var(--mantine-color-red-filled)',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 2px rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 700,
                  lineHeight: 1
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </Popover.Target>

        <Popover.Dropdown style={{ width: 320, padding: 0, transform: 'translateX(-130px)', boxShadow: '0 12px 34px rgba(0,0,0,0.45)' }}>
          <Group justify="space-between" px="sm" py="xs">
            <Text fw={600}>Notifications</Text>
            <Button variant="subtle" size="xs" onClick={() => markAllRead()}>
              Mark all read
            </Button>
          </Group>
          <Divider />
          <ScrollArea style={{ height: 260 }}>
            <div>
              {newest.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <IconBellOff size={36} color="var(--mantine-color-gray-4)" stroke={1.5} style={{ marginBottom: 8 }} />
                  <Text size="sm" c="dimmed" fw={500}>No notifications yet</Text>
                  <Text size="xs" c="dimmed" mt={4}>When you get notifications, they'll show up here.</Text>
                </div>
              ) : (
                <>
                  {newest.map((n) => {
                    const isRead = !!n.isRead;
                    return (
                    <UnstyledButton
                      key={n.id}
                      style={{ 
                        display: 'block', 
                        width: '100%', 
                        textAlign: 'left', 
                        padding: 12,
                        backgroundColor: n.id == expandedId ? 'var(--mantine-color-gray-0)' : 'transparent'
                      }}
                      onClick={() => handleItemClick(n.id, isRead)}
                    >
                      <Group justify='space-between' align="flex-start" wrap="nowrap">
                        <div style={{ flex: 1 }}>
                          <Text size="sm" fw={isRead ? 400 : 700} lineClamp={n.id == expandedId ? 0 : 1}>
                            {n.title}
                          </Text>
                          {(n.message || n.body) && (
                            <Text size="xs" c="dimmed" style={{ fontSize: 12, lineHeight: 1.2 }} lineClamp={n.id == expandedId ? 0 : 1}>
                              {n.message || n.body}
                            </Text>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <Text style={{ fontSize: 10 }} c="dimmed">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Text>
                          {!isRead && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--mantine-color-blue-filled)', marginLeft: 'auto', marginTop: 4 }} />}
                        </div>
                      </Group>
                    </UnstyledButton>
                  )})}
                  
                  {hasMore && (
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                      <Button 
                        variant="subtle" 
                        size="xs" 
                        fullWidth 
                        onClick={() => loadMore()} 
                        loading={loading}
                      >
                        Load more
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
          <Divider />
          <Group justify="flex-end" px="sm" py="xs">
            <Button variant="light" size="xs" onClick={() => setOpened(false)}>
              Close
            </Button>
          </Group>
        </Popover.Dropdown>
      </Popover>
    </>
  )
}
