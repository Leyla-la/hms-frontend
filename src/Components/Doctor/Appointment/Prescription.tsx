import { ActionIcon, Badge, Card, Divider, Grid, Text, Group, Modal, Stack, TextInput } from '@mantine/core';
import { IconClock, IconEye, IconMedicineSyrup, IconNotes, IconPill, IconRoute, IconSearch } from '@tabler/icons-react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { formatDateWithTime } from '../../../Utility/DateUtility.tsx';
import { getPrescriptionsByPatientId } from '../../../Service/AppointmentService.tsx';
import { errorNotification } from '../../../Utility/NotificationUtil.tsx';
import { useDisclosure } from '@mantine/hooks';

const Prescription = ({ appointment }: any) => {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        patientName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        reason: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        status: { value: null, matchMode: FilterMatchMode.IN },
        notes: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },

    });

    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters: any = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    useEffect(() => {
        const patientId = appointment?.patientId;
        if (patientId === null || patientId === undefined) {
            setPrescriptions([]);
            return;
        }

        setIsLoading(true);
        getPrescriptionsByPatientId(patientId)
            .then((data) => {
                console.log('Fetched prescriptions:', data);
                setPrescriptions(Array.isArray(data) ? data : []);
            })
            .catch((err: any) => {
                const serverPayload = err?.response?.data;
                console.error('Failed to load prescriptions:', serverPayload ?? err);
                errorNotification(
                    typeof serverPayload === 'string'
                        ? serverPayload
                        : serverPayload?.message || 'Failed to load prescriptions (500). Check backend logs.'
                );
                setPrescriptions([]);
            })
            .finally(() => setIsLoading(false));
    }, [appointment?.patientId]);

const activityBodyTemplate = (rowData: any) => {
    return (
        <div className='flex gap-2'>
            <ActionIcon color="blue" variant="light" onClick={() => navigate("/doctor/appointments/" + rowData.id)}>
                <IconEye size={20} stroke={1.5} />
            </ActionIcon>
            <ActionIcon 
                color="teal" 
                variant="light" 
                onClick={() => handleMedicine(rowData.medicines)}
            >
                <IconMedicineSyrup size={20} stroke={1.5} />
            </ActionIcon>
        </div>
    );
};

const handleMedicine = (medicines: any[]) => {
    setSelectedMedicines(medicines || []);
    open(); 
};

    const renderHeader = () => {
        return (
            <div className='flex flex-wrap gap-2 justify-between items-center'>
                <TextInput leftSection={<IconSearch />} fw={500} placeholder="Global Search" value={globalFilterValue} onChange={onGlobalFilterChange} />
            </div>
        )
    }


    const header = renderHeader();

    return (
        <div>
            <DataTable header={header} stripedRows value={prescriptions} size='small' paginator rows={10} loading={isLoading} style={{ fontSize: 'var(--mantine-font-size-sm)' }}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[10, 25, 50]} dataKey="id" filters={filters} filterDisplay="menu" globalFilterFields={['doctorName', 'notes']}
                emptyMessage="No prescriptions found." currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
                <Column field="doctorName" header="Doctor" style={{ minWidth: '14rem' }} />
                <Column field="prescriptionDate" header="Prescription Date" sortable style={{ minWidth: '14rem' }} body={(rowData) => formatDateWithTime(rowData.prescriptionDate)} />
                <Column field="medicine" header="Medicines" style={{ minWidth: '14rem' }} body={(rowData) => rowData.medicines?.length ?? 0} />
                <Column field="notes" header="Notes" sortable filter filterPlaceholder="Search by notes" style={{ minWidth: '14rem' }} />
                <Column header="Actions" headerStyle={{ width: '7rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={activityBodyTemplate} />
            </DataTable>
            <Modal 
            opened={opened} 
            onClose={close} 
            title={<Text fw={700} fz="lg">Prescription Details</Text>} 
            centered 
            size="lg"
            radius="md"
        >
            <Stack gap="md">
                {selectedMedicines.length > 0 ? (
                    selectedMedicines.map((med, index) => (
                        <Card key={index} withBorder shadow="sm" radius="md" p="md">
                            <Group justify="space-between" mb="xs">
                                <Group gap="xs">
                                    <IconPill size={20} color="var(--mantine-color-teal-6)" />
                                    <Text fw={700} c="teal.7">{med.name}</Text>
                                </Group>
                                <Badge variant="light" color="blue" size="sm">
                                    {med.type}
                                </Badge>
                            </Group>

                            <Divider mb="sm" variant="dashed" />

                            <Grid gutter="xs">
                                <Grid.Col span={6}>
                                    <Text size="xs" c="dimmed">Dosage:</Text>
                                    <Text size="sm" fw={500}>{med.dosage}</Text>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Text size="xs" c="dimmed">Frequency:</Text>
                                    <Text size="sm" fw={500} c="orange.7">{med.frequency}</Text>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Group gap={4}>
                                        <IconClock size={14} color="gray" />
                                        <Text size="xs" c="dimmed">Duration: {med.duration} days</Text>
                                    </Group>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Group gap={4}>
                                        <IconRoute size={14} color="gray" />
                                        <Text size="xs" c="dimmed">Route: {med.route}</Text>
                                    </Group>
                                </Grid.Col>
                                {med.instructions && (
                                    <Grid.Col span={12}>
                                        <Group gap={4} mt={4} p={8} bg="gray.0" style={{ borderRadius: '4px' }}>
                                            <IconNotes size={14} color="gray" />
                                            <Text size="xs" fs="italic" c="gray.7">
                                                Note: {med.instructions}
                                            </Text>
                                        </Group>
                                    </Grid.Col>
                                )}
                            </Grid>
                        </Card>
                    ))
                ) : (
                    <Text ta="center" c="dimmed" py="xl">No medicine information available.</Text>
                )}
            </Stack>
        </Modal>
        </div>
    )
}

export default Prescription
