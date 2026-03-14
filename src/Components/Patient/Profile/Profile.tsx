import { ActionIcon, Avatar, Button, Divider, Modal, NumberInput, Select, Table, TagsInput, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates';
import { IconDeviceFloppyFilled, IconEdit, IconCamera } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { bloodGroups, bloodGroupMap } from '../../../Data/DropdownData.tsx';
import { useDisclosure } from '@mantine/hooks';
import { getPatient, updatePatient } from '../../../Service/PatientProfileService.tsx';
import { useSelector } from 'react-redux';
import { formatDate, formatLocalDate } from '../../../Utility/DateUtility.tsx';
import { useForm } from '@mantine/form';
import { errorNotification, successNotification } from '../../../Utility/NotificationUtil.tsx';
import { arrayToCSV } from '../../../Utility/OtherUtility.tsx';

const Profile = () => {

    const patient = useSelector((state: any) => state.user);
    const [editMode, setEditMode] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const [profile, setProfile] = useState<any>({});
    useEffect(() => {
        if (!patient.profileId) return;
        getPatient(patient.profileId).then((data) => {
            setProfile({...data, allergies: data.allergies ? (JSON.parse(data.allergies)) : null, chronicDiseases: data.chronicDiseases ? (JSON.parse(data.chronicDiseases)) : null});
        }).catch((error) => {
            console.error('Error fetching profile profile:', error);
        });
    }, [patient.profileId]);

    const form = useForm({
        mode: 'uncontrolled',
        validateInputOnBlur: false,
        validateInputOnChange: false,
        initialValues: {
            dob: '',
            phone: '',
            address: '',
            citizenId: '',
            bloodGroup: '',
            allergies: [],
            chronicDiseases: [],
        },
        validate: {
            dob: (value) => (value ? null : 'Date of Birth is required'),
            phone: (value) => (/^\d{10}$/.test(value) ? null : 'Invalid phone number'),
            citizenId: (value) => (/^\d{12}$/.test(value) ? null : 'Invalid citizen ID'),
            bloodGroup: (value) => (value ? null : 'Blood group is required'),
        },
    });

    const handleEdit = () => {
        form.setValues({...profile, dob: profile.dob ? new Date(profile.dob) : undefined, chronicDiseases: profile.chronicDiseases ?? [], allergies: profile.allergies ?? []    });
        setEditMode(true);
    }

    const handleSubmit = (e: any) => {
        let values = form.getValues();
        console.log(values);
        form.validate();
        if (!form.isValid()) return;
        updatePatient({ ...profile, ...values, dob: formatLocalDate(values.dob), allergies: values.allergies ? JSON.stringify(values.allergies) : null, chronicDiseases: values.chronicDiseases ? JSON.stringify(values.chronicDiseases) : null }).then((data) => {
            console.log(data);
            successNotification('Profile updated successfully');
            setProfile({...data, ...values});
            setEditMode(false);
        }).catch((error) => {
            errorNotification(error.response?.data?.errorMessage || 'Failed to update profile');
        });
    }

    return (
        <div className='p-10'>
            <div className="flex justify-between items-center">
                <div className='flex items-center gap-5'>
                    <div className='relative inline-block'>
                        <Avatar variant="filled" src="/ssmr-avt.jpg" size={150} alt="User avatar" />
                        {editMode && (
                            <ActionIcon
                                variant="filled"
                                color="primary"
                                radius="xl"
                                size="md"
                                className='absolute -bottom-[-3px] -right-[-7px] shadow-md'
                                onClick={open}
                                aria-label='Change avatar'
                            >
                                <IconCamera size={16} />
                            </ActionIcon>
                        )}
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className='text-3xl font-medium text-neutral-900'>{profile.name}</div>
                        <div className='text-xl text-neutral-700' >{profile.email}</div>
                    </div>
                </div>
                {!editMode ? (
                    <Button type='button' onClick={handleEdit} size="lg" variant="filled" leftSection={<IconEdit />}>
                        Edit
                    </Button>
                ) : (
                    <Button type='button' onClick={() => handleSubmit(form.values)} size="lg" variant="filled" leftSection={<IconDeviceFloppyFilled />}>
                        Save
                    </Button>
                )}
            </div>
            <Divider my="xl" />
            <div>
                <div className="text-2xl font-medium mb-5 text-neutral-900"> Personal Information </div>
                <Table striped stripedColor="primary.1" verticalSpacing="md" withColumnBorders={false}>
                    <Table.Tbody className="[&>tr]:!mb-3 [&_td]:w-1/2">
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Date of Birth</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><DateInput {...form.getInputProps("dob")} label="" description="" placeholder='Date of Birth' defaultValue={new Date(profile.dob)}
                                /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{formatDate(profile.dob) ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Phone</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput {...form.getInputProps("phone")} label="" description="" placeholder='Phone Number' maxLength={10} clampBehavior='strict' hideControls defaultValue={profile.phone} />
                                </Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{profile.phone ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Address</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><TextInput {...form.getInputProps("address")} label="" description="" placeholder='Address' />
                                </Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{profile.address ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Citizen ID</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput {...form.getInputProps("citizenId")} label="" description="" placeholder='Citizen ID' maxLength={12} clampBehavior='strict' hideControls defaultValue={profile.citizenId} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{profile.citizenId ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Blood Group</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><Select {...form.getInputProps("bloodGroup")} placeholder="Blood Group" data={bloodGroups} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{bloodGroupMap[profile.bloodGroup] ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Allergies</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><TagsInput {...form.getInputProps("allergies")} label="" placeholder="Allergies separated by comma" /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{arrayToCSV(profile.allergies) ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Chronic Diseases</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><TagsInput {...form.getInputProps("chronicDiseases")} label="" placeholder="Chronic diseases separated by comma" /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{arrayToCSV(profile.chronicDiseases) ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>

                    </Table.Tbody>
                </Table>
            </div>
            <Modal centered opened={opened} onClose={close} title={<span className="text-xl font-medium">Upload Profile Image</span>}>

            </Modal>
        </div>


    )
}

export default Profile
