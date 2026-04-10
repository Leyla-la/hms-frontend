import React, { useEffect, useMemo, useState, Suspense, useCallback } from 'react';
import { Avatar, Group, Stack, Text, TextInput, Badge } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconSearch } from '@tabler/icons-react';


import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';


import { getAllPatients } from '../../../Service/PatientProfileService.tsx';
import { arrayToCSV, safeStringArray } from '../../../Utility/OtherUtility.tsx';
import { bloodGroupMap } from '../../../Data/DropdownData.tsx';
import PageHeader from '../../Common/PageHeader.tsx';



const formatDate = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
};

const bloodGroupLabel = (value?: string) => {
    if (!value) return '-';
    return value.replace('_POS', '+').replace('_NEG', '-').replace('_', '');
};

const Patients: React.FC = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [patients, setPatients] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getAllPatients();
                if (!mounted) return;
                const list = Array.isArray(res) ? res : [];
                const mapped = list.map((p: any) => ({
                    ...p,
                    allergiesText: p.allergies || p.allergiesText || '',
                    chronicDiseasesText: p.chronicDiseases || p.chronicDiseasesText || '',
                }));
                setPatients(mapped);
                console.log('[Patients] loaded patients', mapped);
            } catch (err) {
                console.error('[Patients] failed to load patients', err);
                setPatients([]);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const nameBody = useCallback((row: any) => {
        const initials =
            row.name
                ?.split(' ')
                .filter(Boolean)
                .slice(-2)
                .map((p: string) => p[0]?.toUpperCase())
                .join('') || 'PT';

        return (
            <div className="min-h-[56px] flex items-center">
                <Group gap="sm" wrap="nowrap">
                    <Avatar radius="xl" size={40} color="teal" variant="light">
                        {initials}
                    </Avatar>
                    <Text fw={600} size="sm" lineClamp={1}>
                        {row.name || '-'}
                    </Text>
                </Group>
            </div>
        );
    }, []);

    const emailBody = useCallback((row: any) => (
        <div className="min-h-[56px] flex items-center">
            <Text size="sm" c="dark.7" lineClamp={2}>
                {row.email || '-'}
            </Text>
        </div>
    ), []);

    const textBody = useCallback((value?: string) => (
        <div className="min-h-[56px] flex items-center">
            <Text size="sm" c="dark.7" lineClamp={2} title={value || ''}>
                {value || '-'}
            </Text>
        </div>
    ), []);

    const bloodBody = useCallback((row: any) => {
        const code = row.bloodGroup || row.bloodGroupCode || row.blood || '';
        const label = bloodGroupMap[code] || bloodGroupLabel(code) || '-';
        return (
            <div className="min-h-[56px] flex items-center">
                <Badge color="red" variant="light" radius="sm">
                    {label}
                </Badge>
            </div>
        );
    }, []);

    const allergiesBody = useCallback((row: any) => {
        const arr = safeStringArray(row.allergies || row.allergiesText || row.allergyList || null);
        const out = arrayToCSV(arr);
        return (
            <div className="min-h-[56px] flex items-center">
                <Text size="sm" c="dark.7" lineClamp={2} title={out || '-'}>
                    {out || '-'}
                </Text>
            </div>
        );
    }, []);

    const chronicBody = useCallback((row: any) => {
        const arr = safeStringArray(row.chronicDiseases || row.chronicDiseasesText || row.conditions || null);
        const out = arrayToCSV(arr);
        return (
            <div className="min-h-[56px] flex items-center">
                <Text size="sm" c="dark.7" lineClamp={2} title={out || '-'}>
                    {out || '-'}
                </Text>
            </div>
        );
    }, []);

    // expansion removed — details are shown inline in table columns instead

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <div className="text-xl text-primary-600 font-semibold">Patients</div>
                    <div className="text-sm text-neutral-500">
                        Full patient directory with medical summary
                    </div>
                </div>

                <div className="w-full max-w-[320px]">
                    <TextInput
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.currentTarget.value)}
                        placeholder="Search all patient fields..."
                        leftSection={<IconSearch size={16} />}
                        radius="md"
                    />
                </div>
            </div>

            <Suspense fallback={<div />}>
                <DataTable
                    value={patients}
                    paginator
                    stripedRows
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    dataKey="id"
                    filterDisplay="menu"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    globalFilter={globalFilter}
                    globalFilterFields={[
                        'name',
                        'email',
                        'phone',
                        'address',
                        'citizenId',
                        'bloodGroup',
                        'allergiesText',
                        'chronicDiseasesText',
                    ]}
                    emptyMessage="No patients found"
                    tableStyle={{ minWidth: '1250px' }}
                >
                    <Column
                        field="name"
                        header="Patient"
                        body={nameBody}
                        style={{ minWidth: '220px' }}
                    />
                    <Column
                        field="email"
                        header="Email"
                        body={emailBody}
                        style={{ minWidth: '220px' }}
                    />
                    <Column
                        field="dob"
                        header="DOB"
                        body={(row: any) => textBody(formatDate(row.dob))}
                        sortable
                        style={{ minWidth: '120px' }}
                    />
                    <Column
                        field="phone"
                        header="Phone"
                        body={(row: any) => textBody(row.phone)}
                        style={{ minWidth: '130px' }}
                    />
                    <Column
                        field="bloodGroup"
                        header="Blood"
                        body={bloodBody}
                        style={{ minWidth: '100px' }}
                    />
                    <Column
                        field="allergiesText"
                        header="Allergies"
                        body={allergiesBody}
                        style={{ minWidth: '240px' }}
                    />
                    <Column
                        field="chronicDiseasesText"
                        header="Chronic diseases"
                        body={chronicBody}
                        style={{ minWidth: '240px' }}
                    />
                    <Column
                        field="address"
                        header="Address"
                        body={(row: any) => textBody(row.address)}
                        style={{ minWidth: '220px' }}
                    />
                </DataTable>
            </Suspense>
        </div>
    );
};

export default Patients;