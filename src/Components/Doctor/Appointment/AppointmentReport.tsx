import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Button, Stack, TextInput, Textarea, Grid, Paper, Group,
    Text, Box, ActionIcon, Select, NumberInput, Title, MultiSelect, Card, Badge, Divider
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
    IconStethoscope, IconRoute, IconDeviceFloppy, IconTrash,
    IconPlus, IconCalendarTime, IconPill,
    IconMicroscope, IconUser,
    IconSearch,
    IconEye
} from '@tabler/icons-react';

// Service & Notifications
import { successNotification, errorNotification } from '../../../Utility/NotificationUtil.tsx';
import { createAppointmentRecord, getAppointmentDetails, getReportsByPatientId, isReportExists } from '../../../Service/AppointmentService.tsx';
import { formatDateWithTime, formatLocalDate } from '../../../Utility/DateUtility.tsx';

// Dropdown Data
import {
    symptomsData,
    diagnosticTestsData,
    medicationFrequencies,
    medicationRoutes,
    medicationTypes
} from '../../../Data/DropdownData.tsx';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

const AppointmentReport = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [allowAdd, setAllowAdd] = useState<boolean>(false);
    const [edit, setEdit] = useState(false);
    const [appointmentData, setAppointmentData] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const navigate = useNavigate();
    const [filters, setFilters] = useState<DataTableFilterMeta>({
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

    const activityBodyTemplate = (rowData: any) => {
        return <div className='flex gap-2'>
            <ActionIcon onClick={() => navigate("/doctor/appointments/" + rowData.id)}>
                <IconEye size={20} stroke={1.5} />
            </ActionIcon>
        </div>
    };

    const renderHeader = () => {
        return (
            <div className='flex flex-wrap gap-2 justify-between items-center'>
                {allowAdd && (
                    <Button variant="filled" onClick={() => setEdit(true)}>
                        <IconPlus /> Add Report
                    </Button>
                )}
                <TextInput leftSection={<IconSearch />} fw={500} placeholder="Global Search" value={globalFilterValue} onChange={onGlobalFilterChange} />
            </div>
        )
    }


    const header = renderHeader();

    const getStatusBadgeColor = (status?: string) => {
        switch (status) {
            case 'CANCELLED':
                return 'red';
            case 'COMPLETED':
                return 'teal';
            case 'SCHEDULED':
                return 'blue';
            case 'negotiation':
                return 'yellow';
            default:
                return 'primary.5';
        }
    };

    const formatRequestError = (err: unknown) => {
        const anyErr = err as any;
        const status = anyErr?.response?.status;
        const statusText = anyErr?.response?.statusText;
        const url = anyErr?.config?.url;
        const method = anyErr?.config?.method;
        const responseData = anyErr?.response?.data;

        const messageFromResponse =
            typeof responseData === 'string'
                ? responseData
                : responseData?.message ?? responseData?.error ?? responseData?.details;

        const message =
            anyErr?.message ||
            messageFromResponse ||
            (status ? `Request failed with status ${status}` : 'Unknown error');

        return {
            message: String(message),
            status: status as number | undefined,
            statusText: statusText as string | undefined,
            url: url as string | undefined,
            method: method as string | undefined,
            responseData,
        };
    };

    const form = useForm({
        initialValues: {
            appointmentId: Number(id),
            symptoms: [] as string[],
            diagnosis: '',
            tests: [] as string[],
            notes: '',
            referral: '',
            followUpDate: null as Date | null,
            prescription: {
                patientId: null as number | null,
                doctorId: null as number | null,
                prescriptionDate: new Date(),
                notes: '',
                medicines: [
                    { name: '', dosage: '', frequency: '', duration: 5, route: 'ORAL', type: 'TABLET', instructions: '' }
                ]
            }
        },
        validate: {
            diagnosis: (value) => (value.trim().length < 2 ? 'Required' : null),
            prescription: {
                medicines: {
                    name: (value) => (value.trim().length < 1 ? 'Required' : null),
                    dosage: (value) => (value.trim().length < 1 ? 'Required' : null),
                    frequency: (value) => (!value ? 'Required' : null),
                }
            }
        },
    });

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                const data = await getAppointmentDetails(id);
                setAppointmentData(data);
                form.setValues({
                    prescription: {
                        ...form.values.prescription,
                        patientId: data.patientId,
                        doctorId: data.doctorId,
                    }
                });
            } catch (err) {
                errorNotification("Could not fetch appointment details.");
            }
        };
        if (id) fetchAppointmentDetails();
    }, [id]);

    const fetchReports = async () => {
        const patientId = appointmentData?.patientId;
        const appointmentId = appointmentData?.id;

        // Avoid calling backend with "undefined" path params.
        if (!patientId || !appointmentId) {
            setData([]);
            setAllowAdd(false);
            return;
        }

        try {
            try {
                const reports = await getReportsByPatientId(patientId);
                console.log('Fetched reports:', reports);
                setData(reports || []);
            } catch (err: any) {
                const serverPayload = err?.response?.data;
                console.error('Failed to load reports:', serverPayload ?? err);
                errorNotification(
                    typeof serverPayload === 'string'
                        ? serverPayload
                        : serverPayload?.message || 'Failed to load reports (500). Check backend logs.'
                );
                setData([]);
            }

            try {
                const exists = await isReportExists(appointmentId);
                setAllowAdd(!exists);
            } catch (err) {
                console.error('Failed to check report existence:', err);
                // Fallback: allow add; backend will still block duplicates.
                setAllowAdd(true);
            }
        } catch (err) {
            console.error('Unexpected error during fetchReports:', err);
            setData([]);
            setAllowAdd(false);
        }
    };

    useEffect(() => {
        if (!appointmentData?.patientId || !appointmentData?.id) return;
        fetchReports();
    }, [appointmentData?.patientId, appointmentData?.id]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        console.groupCollapsed(`[AppointmentReport] Save record #${id}`);
        console.log('Form values (raw):', values);

        try {
            const payload = {
                ...values,
                patientId: appointmentData?.patientId,
                doctorId: appointmentData?.doctorId,
                followUpDate: formatLocalDate(values.followUpDate),
                prescription: {
                    ...values.prescription,
                    patientId: appointmentData?.patientId,
                    doctorId: appointmentData?.doctorId,
                    prescriptionDate: formatLocalDate(values.prescription.prescriptionDate),
                }
            };

            console.log('Payload (sent to API):', payload);
            const response = await createAppointmentRecord(payload);
            console.log('API response:', response);
            successNotification("Appointment record and prescription saved successfully!");
            form.reset();
            setEdit(false);
            setAllowAdd(false);
            fetchReports(); 
        } catch (err) {
            const formatted = formatRequestError(err);
            console.error('Save failed (raw error):', err);
            console.error('Save failed (formatted):', formatted);
            if (formatted?.responseData !== undefined) {
                console.error('Response data:', formatted.responseData);
            }

            const details = [
                formatted.status ? `HTTP ${formatted.status}` : null,
                formatted.method && formatted.url ? `${String(formatted.method).toUpperCase()} ${formatted.url}` : null,
                formatted.message,
            ]
                .filter(Boolean)
                .join(' — ');

            errorNotification(details || 'Failed to save.');
        } finally {
            setLoading(false);
            console.groupEnd();
        }
    };


    const sectionTitleStyle = {
        fontFamily: "Merriweather, serif",
        borderLeft: '5px solid var(--mantine-color-primary-4)',
        paddingLeft: '8px',
        color: 'var(--mantine-color-primary-6)',
        fontSize: '0.95rem',
        marginBottom: '5px',
        marginTop: '15px',
        lineHeight: 1.2
    };

    // Keep medicine-row fields from shifting when error text appears
    const hasAnyErrorWithPrefix = (prefix: string) => {
        return Object.entries(form.errors).some(([key, value]) => key.startsWith(prefix) && Boolean(value));
    };

    const getMedicineRowColStyle = (index: number) => {
        const prefix = `prescription.medicines.${index}.`;
        return { minHeight: hasAnyErrorWithPrefix(prefix) ? 95 : 80 } as const;
    };


    return (
        <div>
            {!edit ?
                <DataTable header={header} stripedRows value={data} size='small' paginator rows={10} style={{ fontSize: 'var(--mantine-font-size-sm)' }}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]} dataKey="id" filters={filters} filterDisplay="menu" globalFilterFields={['doctorName', 'notes']}
                    emptyMessage="No appointment records found." currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
                    <Column field="doctorName" header="Doctor" style={{ minWidth: '14rem' }} />
                    <Column field="diagnosis" header="Diagnosis" style={{ minWidth: '14rem' }} />
                    <Column field="reportDate" header="Report Date" sortable style={{ minWidth: '14rem' }} body={(rowData) => formatDateWithTime(rowData.createdAt)} />
                    <Column field="notes" header="Notes" sortable filter filterPlaceholder="Search by notes" style={{ minWidth: '14rem' }} />
                    <Column header="Actions" headerStyle={{ width: '7rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={activityBodyTemplate} />
                </DataTable>
                : <Box component="form" onSubmit={form.onSubmit(handleSubmit)} p="sm">
                    <Stack gap="lg">
                        {/* --- TOP SUMMARY CARD --- */}
                        <Card shadow="xs" padding="sm" radius="md" withBorder bg="primary.2">
                            <Group justify="space-between" align="center">
                                <Stack gap={2}>
                                    <Title order={5} ff="Merriweather, serif" c="primary.6">Medical Examination Report</Title>
                                    <Group gap="lg">
                                        <Group gap={6}>
                                            <IconCalendarTime size={16} color="var(--mantine-color-neutral-6)" />
                                            <Text size="xs" c="neutral.7" fw={500}>ID: #{id} — {appointmentData?.appointmentTime}</Text>
                                        </Group>
                                        <Group gap={6}>
                                            <IconUser size={16} color="var(--mantine-color-neutral-6)" />
                                            <Text size="xs" c="neutral.7" fw={500}>Patient: {appointmentData?.patientName}</Text>
                                        </Group>
                                    </Group>
                                </Stack>
                                <Badge size="md" variant="filled" color={getStatusBadgeColor(appointmentData?.status)}>
                                    {appointmentData?.status || 'IN_PROGRESS'}
                                </Badge>
                            </Group>
                        </Card>

                        {/* --- CLINICAL ASSESSMENT --- */}
                        <Stack gap="xs">
                            <Title order={5} style={sectionTitleStyle}>Clinical Assessment</Title>
                            <Paper withBorder p="lg" radius="md">
                                <Grid gutter="md">
                                    <Grid.Col span={12}>
                                        <TextInput label="Primary Diagnosis" placeholder="Enter final diagnosis..." withAsterisk {...form.getInputProps('diagnosis')} />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <MultiSelect label="Symptoms Observed" placeholder="Select multiple symptoms" data={symptomsData} searchable hidePickedOptions leftSection={<IconStethoscope size={16} />} {...form.getInputProps('symptoms')} />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <MultiSelect label="Diagnostic Tests" placeholder="Laboratory or imaging tests" data={diagnosticTestsData} searchable hidePickedOptions leftSection={<IconMicroscope size={16} />} {...form.getInputProps('tests')} />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                        <Textarea label="Doctor's Notes" placeholder="Clinical observations..." minRows={3} {...form.getInputProps('notes')} />
                                    </Grid.Col>
                                </Grid>
                            </Paper>
                        </Stack>

                        {/* --- PRESCRIPTION PART --- */}
                        <Stack gap="xs">
                            <Title order={5} style={sectionTitleStyle}>Prescription Details</Title>
                            <Paper withBorder p="lg" radius="md" bg="primary.0">
                                <Stack gap="md">
                                    {form.values.prescription.medicines.map((_, index) => (
                                        <Paper key={index} withBorder p="md" radius="md" shadow="xs">
                                            <Group justify="space-between" mb="xs">
                                                <Group gap="xs">
                                                    <IconPill size={16} color="var(--mantine-color-primary-5)" />
                                                    <Text fw={700} size="xs" c="primary.7" tt="uppercase">
                                                        Medicine {(index + 1).toString().padStart(2, '0')}
                                                    </Text>
                                                </Group>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    size="sm"
                                                    onClick={() => form.removeListItem('prescription.medicines', index)}
                                                    disabled={form.values.prescription.medicines.length === 1}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>

                                            <Divider mb="md" variant="dashed" />

                                            <Grid gutter="sm" align="flex-end">
                                                <Grid.Col span={{ base: 12, md: 5 }} style={getMedicineRowColStyle(index)}>
                                                    <TextInput label="Medicine Name" placeholder="Generic name" withAsterisk {...form.getInputProps(`prescription.medicines.${index}.name`)} />
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 6, md: 3 }} style={getMedicineRowColStyle(index)}>
                                                    <TextInput label="Dosage" placeholder="e.g. 500mg" withAsterisk {...form.getInputProps(`prescription.medicines.${index}.dosage`)} />
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 6, md: 4 }} style={getMedicineRowColStyle(index)}>
                                                    <Select label="Frequency" placeholder="Frequency" withAsterisk data={medicationFrequencies} {...form.getInputProps(`prescription.medicines.${index}.frequency`)} />
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 4, md: 2 }} style={getMedicineRowColStyle(index)}>
                                                    <NumberInput label="Duration (Days)" min={1} withAsterisk {...form.getInputProps(`prescription.medicines.${index}.duration`)} />
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 4, md: 3 }} style={getMedicineRowColStyle(index)}>
                                                    <Select label="Route" data={medicationRoutes} {...form.getInputProps(`prescription.medicines.${index}.route`)} />
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 4, md: 3 }} style={getMedicineRowColStyle(index)}>
                                                    <Select label="Type" data={medicationTypes} {...form.getInputProps(`prescription.medicines.${index}.type`)} />
                                                </Grid.Col>
                                                <Grid.Col span={{ base: 12, md: 4 }} style={getMedicineRowColStyle(index)}>
                                                    <TextInput label="Special Instructions" placeholder="After meal, etc." {...form.getInputProps(`prescription.medicines.${index}.instructions`)} />
                                                </Grid.Col>
                                            </Grid>
                                        </Paper>
                                    ))}

                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        variant="light"
                                        color="primary.4"
                                        fullWidth
                                        size="sm"
                                        onClick={() => form.insertListItem('prescription.medicines', { name: '', dosage: '', frequency: '', duration: 5, route: 'ORAL', type: 'TABLET', instructions: '' })}
                                    >
                                        <Text size="xs" fw={600}>Add More Medication</Text>
                                    </Button>
                                </Stack>
                            </Paper>
                        </Stack>

                        {/* --- FOOTER --- */}
                        <Paper withBorder p="lg" radius="md">
                            <Grid gutter="lg">
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <TextInput label="Medical Referral" leftSection={<IconRoute size={16} color="var(--mantine-color-primary-5)" />} placeholder="Refer to hospital..." {...form.getInputProps('referral')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <DateInput label="Follow-up Date" placeholder="Schedule next visit" clearable {...form.getInputProps('followUpDate')} />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        <Group justify="flex-end" pt="lg" gap="md">
                            <Button variant="light" color="neutral.3" size="sm" onClick={() => form.reset()} disabled={loading} styles={{ label: { fontSize: '0.85rem' } }}>
                                Reset Form
                            </Button>
                            <Button type="submit" size="sm" loading={loading} leftSection={<IconDeviceFloppy size={18} />} color="primary.4" styles={{ label: { fontSize: '0.85rem' } }}>
                                Save Final Record
                            </Button>
                        </Group>
                    </Stack>
                </Box>
            }
        </div>
    );
};

export default AppointmentReport;