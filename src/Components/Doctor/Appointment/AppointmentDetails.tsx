import { Breadcrumbs, Card, Text, Group, Stack, Divider, Grid, Badge, Paper, ThemeIcon, Tabs, Box } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAppointmentDetails } from '../../../Service/AppointmentService.tsx';
import { IconCalendarTime, IconUser, IconStethoscope, IconNote, IconVaccine, IconClipboardHeart, IconHistory } from '@tabler/icons-react';
import AppointmentReport from './AppointmentReport.tsx';
import Prescription from './Prescription.tsx';
import MedicalHistory from './MedicalHistory.tsx';

const AppointmentDetails = () => {
    const { id } = useParams();
    const [appointment, setAppointment] = useState<any>(null);

    useEffect(() => {
        getAppointmentDetails(id!).then((data) => {
            setAppointment(data);
        }).catch((err) => {
            console.log(err);
        });
    }, [id]);

    if (!appointment) return <Text>Loading...</Text>;

    const getStatusBadge = (status?: string) => {
        const getStatusBadgeColor = (currentStatus?: string) => {
            switch (currentStatus) {
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

        const label = status || 'IN_PROGRESS';
        return (
            <Badge color={getStatusBadgeColor(status)} variant="light" size="lg">
                {label}
            </Badge>
        );
    };

    return (
        <div style={{ margin: 'auto' }}>
            <Breadcrumbs mb='md'>
                <Link className='text-primary-400 hover:underline' to="/doctor/dashboard">Dashboard</Link>
                <Link className='text-primary-400 hover:underline' to="/doctor/appointments">Appointments</Link>
                <Text color="dimmed">Details</Text>
            </Breadcrumbs>

            {/* Top Summary Card */}
            <Card shadow="sm" padding="xl" radius="md" withBorder mb="lg">
                <Group justify="space-between" mb="xl">
                    <Stack gap={0}>
                        <Text size="xl" fw={700}>Appointment ID: #{appointment.id}</Text>
                        <Group gap="xs">
                            <IconCalendarTime size={16} color="gray" />
                            <Text size="sm" color="dimmed">{appointment.appointmentTime}</Text>
                        </Group>
                    </Stack>
                    {getStatusBadge(appointment.status)}
                </Group>

                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper withBorder p="md" radius="sm" bg="var(--mantine-color-gray-0)">
                            <Group mb="sm">
                                <ThemeIcon color="blue" variant="light" radius="xl">
                                    <IconUser size={18} />
                                </ThemeIcon>
                                <Text fw={600}>Patient Information</Text>
                            </Group>
                            <Divider mb="sm" />
                            <Stack gap="xs">
                                <InfoRow label="Full Name" value={appointment.patientName} />
                                <InfoRow label="Email" value={appointment.patientEmail} />
                                <InfoRow label="Phone" value={appointment.patientPhone} />
                                <InfoRow label="Citizen ID" value={appointment.patientCitizenId} />
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper withBorder p="md" radius="sm" bg="var(--mantine-color-gray-0)">
                            <Group mb="sm">
                                <ThemeIcon color="teal" variant="light" radius="xl">
                                    <IconStethoscope size={18} />
                                </ThemeIcon>
                                <Text fw={600}>Doctor Information</Text>
                            </Group>
                            <Divider mb="sm" />
                            <Stack gap="xs">
                                <InfoRow label="Doctor Name" value={appointment.doctorName} />
                                <InfoRow label="Specialization" value={appointment.doctorSpecialization} />
                                <InfoRow label="License No" value={appointment.doctorLicenseNumber} />
                                <InfoRow label="Contact" value={appointment.doctorEmail} />
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Paper withBorder p="md" radius="sm">
                            <Group mb="sm">
                                <ThemeIcon color="orange" variant="light" radius="xl">
                                    <IconNote size={18} />
                                </ThemeIcon>
                                <Text fw={600}>Clinical Notes</Text>
                            </Group>
                            <Divider mb="sm" />
                            <Stack gap="sm">
                                <div>
                                    <Text size="sm" fw={500} color="dimmed">Reason for visit:</Text>
                                    <Text size="sm">{appointment.reason || 'No reason provided'}</Text>
                                </div>
                                <div>
                                    <Text size="sm" fw={500} color="dimmed">Additional Notes:</Text>
                                    <Text size="sm">{appointment.notes || 'No extra notes'}</Text>
                                </div>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Card>

            {/* Consistent Tabs Design */}
            <Paper shadow="sm" radius="md" withBorder>
                <Tabs variant="pills" defaultValue="reports">
                    <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }} bg="var(--mantine-color-gray-0)">
                        <Tabs.List>
                            <Tabs.Tab value="medical" leftSection={<IconHistory size={18} />}>
                                Medical History
                            </Tabs.Tab>
                            <Tabs.Tab value="prescriptions" leftSection={<IconClipboardHeart size={18} />}>
                                 Prescriptions
                            </Tabs.Tab>
                            <Tabs.Tab value="reports" leftSection={<IconVaccine size={18} />}>
                               Clinical Report
                            </Tabs.Tab>
                        </Tabs.List>
                    </Box>

                    <Box p="xl">
                        <Tabs.Panel value="medical">
                            <MedicalHistory appointment={appointment} />
                        </Tabs.Panel>

                        <Tabs.Panel value="prescriptions">
                            <Prescription appointment={appointment} />
                        </Tabs.Panel>

                        <Tabs.Panel value="reports">
                            <AppointmentReport />
                        </Tabs.Panel>
                    </Box>
                </Tabs>
            </Paper>
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <Group justify="space-between">
        <Text size="sm" color="dimmed">{label}:</Text>
        <Text size="sm" fw={500}>{value || 'N/A'}</Text>
    </Group>
);

export default AppointmentDetails;