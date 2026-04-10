import React from 'react';
import { Group, Paper, Text, ThemeIcon } from '@mantine/core';

type Def = {
  id: string;
  label: string;
  sub?: string;
  hue?: 'green'|'teal'|'sky'|'indigo'|'purple'|'slate'|'azure'|'cyan'|'emerald'|'violet';
  icon?: React.ReactNode;
  spark?: number[];
  delta?: string;
  val?: string | number;
}

type PropsA = { def: Def; revenue?: number; count?: number }
type PropsB = { title: string; value: string | number; hint?: string; color?: string; icon?: React.ReactNode }
type Props = Partial<PropsA & PropsB> & ({ def: Def } | { title: string })

const KpiCard: React.FC<Props> = (props) => {
  // If `def` provided, render the dashboard-style KPI
  if (props.def) {
    const def = props.def
    const val = def.id === 'rev' && props.revenue
      ? (props.revenue).toLocaleString('vi-VN') + ' ₫'
      : props.count !== undefined
        ? String(props.count)
        : def.val
    return (
      <Paper withBorder style={{ borderRadius: 14, padding: 18, background: '#fff' }}>
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text size="sm" c="dimmed">{def.label}</Text>
            <Text fw={900} style={{ fontSize: 21, lineHeight: 1, marginTop: 6 }}>{val}</Text>
            {def.sub && <Text size="xs" c="dimmed">{def.sub}</Text>}
          </div>
          {def.icon ? <ThemeIcon variant="light" radius="xl" size={42}>{def.icon}</ThemeIcon> : null}
        </Group>
      </Paper>
    )
  }

  // Fallback simple KPI card
  const { title = 'Metric', value = '—', hint, color = 'teal', icon } = props as PropsB
  return (
    <Paper radius="xl" p="md" withBorder className="bg-white border-neutral-200 shadow-sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text size="sm" c="dimmed">{title}</Text>
          <Text fw={900} style={{ fontSize: 28, marginTop: 6 }} c="dark.8" truncate>{value}</Text>
          {hint && <Text size="xs" c="dimmed">{hint}</Text>}
        </div>
        {icon ? <ThemeIcon color={color as any} variant="light" radius="xl" size={42}>{icon}</ThemeIcon> : null}
      </Group>
    </Paper>
  )
}

export default KpiCard;
