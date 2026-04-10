import React, { useEffect, useState, useCallback } from 'react';
import { Avatar, Badge, Group, Text, TextInput } from '@mantine/core';
import { IconSearch, IconStethoscope } from '@tabler/icons-react';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { getAllDoctors } from '../../../Service/DoctorProfileService.tsx';


const formatDate = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
};


const Doctors: React.FC = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [doctors, setDoctors] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await getAllDoctors();
                if (!mounted) return;

                const list = Array.isArray(res) ? res : [];
                setDoctors(list);
                console.log('[Doctors] loaded doctors', list);
            } catch (err) {
                console.error('[Doctors] failed to load doctors', err);
                setDoctors([]);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const nameBody = useCallback((row: any) => {
        const initials =
            row.name
                ?.split(' ')
                .filter(Boolean)
                .slice(-2)
                .map((p: string) => p[0]?.toUpperCase())
                .join('') || 'DR';

        return (
            <div className="min-h-[56px] flex items-center">
                <Group gap="sm" wrap="nowrap">
                    <Avatar radius="xl" size={40} color="teal" variant="light">
                        {initials || <IconStethoscope size={16} />}
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

    const textBody = useCallback((value?: string | number) => (
        <div className="min-h-[56px] flex items-center">
            <Text size="sm" c="dark.7" lineClamp={2} title={value !== undefined && value !== null ? String(value) : ''}>
                {value !== undefined && value !== null && value !== '' ? value : '-'}
            </Text>
        </div>
    ), []);

    const specializationBody = useCallback((row: any) => (
        <div className="min-h-[56px] flex items-center">
            <Badge color="teal" variant="light" radius="sm">
                {row.specialization || '-'}
            </Badge>
        </div>
    ), []);

    const departmentBody = useCallback((row: any) => (
        <div className="min-h-[56px] flex items-center">
            <Badge color="gray" variant="light" radius="sm">
                {row.department || '-'}
            </Badge>
        </div>
    ), []);

    const expBody = useCallback((row: any) => (
        <div className="min-h-[56px] flex items-center">
            <Badge color="lime" variant="light" radius="sm">
                {row.totalExp ?? 0} yrs
            </Badge>
        </div>
    ), []);

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <div className="text-xl text-primary-600 font-semibold">Doctors</div>
                    <div className="text-sm text-neutral-500">
                        Full doctor directory with professional information
                    </div>
                </div>

                <div className="w-full max-w-[320px]">
                    <TextInput
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.currentTarget.value)}
                        placeholder="Search all doctor fields..."
                        leftSection={<IconSearch size={16} />}
                        radius="md"
                    />
                </div>
            </div>

            <DataTable
                value={doctors}
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
                    'dob',
                    'phone',
                    'address',
                    'licenseNo',
                    'specialization',
                    'department',
                    'totalExp',
                ]}
                emptyMessage="No doctors found"
                tableStyle={{ minWidth: '1280px' }}
            >
                <Column
                    field="name"
                    header="Doctor"
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
                    field="address"
                    header="Address"
                    body={(row: any) => textBody(row.address)}
                    style={{ minWidth: '220px' }}
                />
                <Column
                    field="licenseNo"
                    header="License No"
                    body={(row: any) => textBody(row.licenseNo)}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    field="specialization"
                    header="Specialization"
                    body={specializationBody}
                    style={{ minWidth: '170px' }}
                />
                <Column
                    field="department"
                    header="Department"
                    body={departmentBody}
                    style={{ minWidth: '170px' }}
                />
                <Column
                    field="totalExp"
                    header="Experience"
                    body={expBody}
                    sortable
                    style={{ minWidth: '120px' }}
                />
            </DataTable>
        </div>
    );
};

export default Doctors;