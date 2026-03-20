import { Badge, Divider, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { getAppointmentsByPatient } from '../../../Service/AppointmentService.tsx';
import { getPatient } from '../../../Service/PatientProfileService.tsx';
import { formatDateWithTime } from '../../../Utility/DateUtility.tsx';
import { safeStringArray } from '../../../Utility/OtherUtility.tsx';
import { bloodGroupMap } from '../../../Data/DropdownData.tsx';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

const MedicalHistory = ({ appointment }: any) => {
    const patientId = appointment?.patientId;
    const currentAppointmentId = appointment?.id;

    const [patient, setPatient] = useState<any>(null);
    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        doctorName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        reason: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        status: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const allergies = useMemo(() => safeStringArray(patient?.allergies), [patient?.allergies]);
    const chronicDiseases = useMemo(() => safeStringArray(patient?.chronicDiseases), [patient?.chronicDiseases]);

    useEffect(() => {
        if (patientId === null || patientId === undefined) {
            setPatient(null);
            setVisits([]);
            return;
        }

        setLoading(true);
        Promise.all([
            getPatient(patientId).catch(() => null),
            getAppointmentsByPatient(patientId).catch(() => []),
        ])
            .then(([patientData, appointmentList]) => {
                setPatient(patientData);
                const list = Array.isArray(appointmentList) ? appointmentList : [];
                const normalized = list
                    .filter((x: any) =>
                        x &&
                        x.id !== currentAppointmentId &&
                        new Date(x.appointmentTime) < new Date() // Chỉ lấy lịch sử TRƯỚC thời điểm hiện tại
                    )
                    .sort((a: any, b: any) => +new Date(b?.appointmentTime) - +new Date(a?.appointmentTime));
                setVisits(normalized);
            })
            .finally(() => setLoading(false));
    }, [patientId, currentAppointmentId]);

    const statusColor = (status?: string) => {
        switch (status) {
            case 'CANCELLED':
                return 'red';
            case 'COMPLETED':
                return 'teal';
            case 'SCHEDULED':
                return 'blue';
            default:
                return 'primary.5';
        }
    };

    const Chips = ({ items, color }: { items: string[], color?: string }) =>
        items?.length ? (
            <Group gap={6} wrap="wrap">
                {items.map((x) => (
                    <Badge key={x} variant="light" color={color}>
                        {x}
                    </Badge>
                ))}
            </Group>
        ) : (
            <Text size="sm" c="dimmed">
                N/A
            </Text>
        );

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const nextFilters: any = { ...filters };
        nextFilters['global'].value = value;
        setFilters(nextFilters);
        setGlobalFilterValue(value);
    };

    const renderVisitHeader = () => (
        <div className='flex flex-wrap gap-2 justify-between items-center'>
            <TextInput
                leftSection={<IconSearch />}
                fw={500}
                placeholder="Global Search"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
            />
        </div>
    );

    const doctorBody = (rowData: any) => (
        <div>
            <Text size="sm" fw={500}>{rowData?.doctorName || 'N/A'}</Text>
            <Text size="xs" c="dimmed">{rowData?.doctorSpecialization || ''}</Text>
        </div>
    );

    const dateBody = (rowData: any) => formatDateWithTime(rowData?.appointmentTime) || rowData?.appointmentTime || 'N/A';

    const statusBody = (rowData: any) => (
        <Badge color={statusColor(rowData?.status)} variant="light">
            {rowData?.status || 'N/A'}
        </Badge>
    );

    return (
        <Stack gap="md">
            <Paper withBorder p="md" radius="sm" bg="var(--mantine-color-gray-0)">
                <Group justify="space-between" mb="xs">
                    <Text fw={600}>Patient Snapshot</Text>
                    {loading && (
                        <Text size="sm" c="dimmed">
                            Loading...
                        </Text>
                    )}
                </Group>
                <Divider mb="sm" />

                <Stack gap={10}>
                    <Group justify="space-between" align="flex-start">
                        <Text size="sm" c="dimmed">
                            Blood Group:
                        </Text>
                        <Text size="sm" fw={500}>
                            {bloodGroupMap[patient?.bloodGroup] || patient?.bloodGroup || 'N/A'}
                        </Text>
                    </Group>

                    <Group justify="space-between" align="flex-start">
                        <Text size="sm" c="dimmed">
                            Allergies:
                        </Text>
                        <Chips items={allergies} color="pink" />
                    </Group>

                    <Group justify="space-between" align="flex-start">
                        <Text size="sm" c="dimmed">
                            Chronic Diseases:
                        </Text>
                        <Chips items={chronicDiseases} color="yellow" />
                    </Group>
                </Stack>
            </Paper>

            <Paper withBorder p="md" radius="sm">
                <Text fw={600} mb="sm">
                    Visit History
                </Text>

                <DataTable
                    header={renderVisitHeader()}
                    value={visits}
                    stripedRows
                    size='small'
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    dataKey="id"
                    filters={filters}
                    filterDisplay="menu"
                    globalFilterFields={['doctorName', 'doctorSpecialization', 'reason', 'status', 'appointmentTime']}
                    emptyMessage="No previous visits found."
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    style={{ fontSize: 'var(--mantine-font-size-sm)' }}
                >
                    <Column field="appointmentTime" header="Date" sortable style={{ minWidth: '14rem' }} body={dateBody} />
                    <Column field="doctorName" header="Doctor" style={{ minWidth: '14rem' }} body={doctorBody} />
                    <Column field="status" header="Status" sortable filter filterPlaceholder="Search by status" style={{ minWidth: '10rem' }} body={statusBody} />
                    <Column field="reason" header="Reason" sortable filter filterPlaceholder="Search by reason" style={{ minWidth: '14rem' }} body={(rowData) => rowData?.reason || 'N/A'} />
                </DataTable>
            </Paper>
        </Stack>
    );
};

export default MedicalHistory;
