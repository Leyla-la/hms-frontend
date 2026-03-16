
import React, { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ActionIcon, Button, LoadingOverlay, Modal, SegmentedControl, Select, Textarea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { Tag } from 'primereact/tag';
import { TextInput } from '@mantine/core';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useSelector } from 'react-redux';
import { useDisclosure } from '@mantine/hooks';
import { getDoctorDropdown } from '../../../Service/DoctorProfileService.tsx';
import { appointmentReasons } from '../../../Data/DropdownData.tsx';
import { cancelAppointment, getAppointmentsByPatient, scheduleAppointment } from '../../../Service/AppointmentService.tsx';
import { formatDateWithTime } from '../../../Utility/DateUtility.tsx';
import { errorNotification, successNotification } from '../../../Utility/NotificationUtil.tsx';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';
import { Toolbar } from 'primereact/toolbar';


const Appointment = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [opened, { open, close }] = useDisclosure(false);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const user = useSelector((state: any) => state.user);
    const [tab, setTab] = useState<string>('Today');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        doctorName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        reason: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        status: { value: null, matchMode: FilterMatchMode.IN },
        notes: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },

    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const getSeverity = (status: string) => {
        switch (status) {
            case 'CANCELLED':
                return 'danger';

            case 'COMPLETED':
                return 'success';

            case 'SCHEDULED':
                return 'info';

            case 'negotiation':
                return 'warning';

            default:
                return null;
        }
    };

    useEffect(() => {
        fetchData();
        getDoctorDropdown().then((data) => {
            setDoctors(data.map((d: any) => ({ label: d.name, value: "" + d.id })));
        }).catch((error) => {
            console.error('Error fetching doctor dropdown data:', error);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = () => {
        getAppointmentsByPatient(user.profileId).then((data) => {
            setAppointments(data);
        }).catch((error) => {
            console.error('Error fetching appointments:', error);
        });
    }

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters: any = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const form = useForm({
        initialValues: {
            doctorId: '',
            patientId: user.profileId,
            appointmentTime: new Date(),
            reason: '',
            notes: ''
        },
        validate: {
            doctorId: (value) => (value ? null : 'Doctor is required'),
            appointmentTime: (value) => (value ? null : 'Appointment time is required'),
            reason: (value) => (value ? null : 'Reason is required'),
        }
    })


    const statusBodyTemplate = (rowData: any) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };


    const activityBodyTemplate = (rowData: any) => {
        return <div className='flex gap-2'>
            <ActionIcon>
                <IconEdit size={20} stroke={1.5} />
            </ActionIcon>
            <ActionIcon color='red' onClick={() => handleDelete(rowData)}>
                <IconTrash size={20} stroke={1.5} />
            </ActionIcon>
        </div>
    };

    const handleSubmit = (values: any) => {
        console.log('Form values:', values);
        form.validate();
        if (!form.isValid()) return;
        setLoading(true);
        scheduleAppointment(values).then(() => {
            close();
            form.reset();
            fetchData();
            successNotification('Appointment scheduled successfully');
        }).catch((error) => {
            errorNotification('Failed to schedule appointment');
            setLoading(false);
        }).finally(() => {
            setLoading(false);
            form.reset();
        });
    }

    const handleDelete = (rowData: any) => {
        modals.openConfirmModal({
            title: <span className="text-xl font-serif font-semibold">Please confirm your action</span>,
            centered: true,
            children: (
                <Text size="sm">Are you sure you want to cancel this appointment?</Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: () => {
                setLoading(true);
                cancelAppointment(rowData.id).then(() => {
                    successNotification('Appointment cancelled successfully');
                    setAppointments(appointments.map(appointment =>
                        appointment.id === rowData.id ? { ...appointment, status: 'CANCELLED' } : appointment
                    ))
                }).catch((error) => {
                    errorNotification('Failed to cancel appointment');
                }).finally(() => {
                    setLoading(false);
                    close();
                });
            }
        });
    }

    const leftToolbarTemplate = () => {
        return (
            <Button leftSection={<IconPlus />} onClick={open} variant="filled" className="">Schedule Appointment</Button>
        );
    };

    const rightToolbarTemplate = () => {
        return <TextInput leftSection={<IconSearch />} fw={500} value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />;
    };

    const centerToolbarTemplate = () => {
        return <SegmentedControl
            value={tab}
            onChange={setTab}
            variant="filled"
            color={tab === 'Today' ? 'blue' : tab === 'Upcoming' ? 'green' : 'gray'}
            data={[
                "Today", "Upcoming", "Past"
            ]}
        />;

    };

    const filterAppointmentsByTab = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day
        const appointmentDay = new Date(appointmentDate);
        appointmentDay.setHours(0, 0, 0, 0); // Set to start of the day

        if (tab === 'Today') {
            return appointmentDay.getTime() === today.getTime();
        } else if (tab === 'Upcoming') {
            return appointmentDay.getTime() > today.getTime();
        } else if (tab === 'Past') {
            return appointmentDay.getTime() < today.getTime();
        }
        return true;
    });

    return (
        <div className="card">
            <Toolbar className="mb-4" start={leftToolbarTemplate} center={centerToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
            <DataTable stripedRows value={filterAppointmentsByTab} size='small' paginator rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[10, 25, 50]} dataKey="id" filters={filters} filterDisplay="menu" globalFilterFields={['doctorName', 'reason', 'notes', 'status']}
                emptyMessage="No appointments found." currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
                <Column field="doctorName" header="Doctor" sortable filter filterPlaceholder="Search by name" style={{ minWidth: '14rem' }} />
                <Column field="appointmentTime" header="Appointment Time" sortable style={{ minWidth: '14rem' }} body={(rowData) => formatDateWithTime(rowData.appointmentTime)} />
                <Column field="reason" header="Reason" sortable filter filterPlaceholder="Search by reason" style={{ minWidth: '14rem' }} />
                <Column field="notes" header="Notes" sortable filter filterPlaceholder="Search by notes" style={{ minWidth: '14rem' }} />
                <Column field="status" header="Status" sortable filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '12rem' }} body={statusBodyTemplate} filter />
                <Column header="Actions" headerStyle={{ width: '7rem', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={activityBodyTemplate} />
            </DataTable>

            <Modal size="lg" opened={opened} onClose={close} title={<div className="text-xl font-semibold text-primary-500">Schedule Appointment</div>} centered>
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                <form onSubmit={form.onSubmit(handleSubmit)} className="grid grid-cols-1 gap-5">
                    <Select {...form.getInputProps('doctorId')} withAsterisk data={doctors} label="Doctor" placeholder="Select a doctor" />
                    <DateTimePicker minDate={new Date()} {...form.getInputProps('appointmentTime')} withAsterisk label="Appointment time" placeholder="Select appointment time" />
                    <Select {...form.getInputProps('reason')} data={appointmentReasons} withAsterisk label="Reason for appointment" placeholder="Enter reason for appointment" />
                    <Textarea {...form.getInputProps('notes')} label="Additional notes" placeholder="Enter any additional notes" />
                    <Button type="submit" variant="filled" fullWidth>Schedule</Button>
                </form>
            </Modal>
        </div>
    );
}

export default Appointment;


