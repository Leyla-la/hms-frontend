import { ActionIcon, Avatar, Button, Divider, Modal, NumberInput, Select, Table, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates';
import { IconDeviceFloppyFilled, IconEdit, IconCamera } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks';
import { doctorSpecializations, doctorDepartments } from '../../../Data/DropdownData.tsx';
import { getDoctor, updateDoctor } from '../../../Service/DoctorProfileService.tsx';
import { useSelector } from 'react-redux';
import { formatDate, formatLocalDate } from '../../../Utility/DateUtility.tsx';
import { useForm } from '@mantine/form';
import { errorNotification, successNotification } from '../../../Utility/NotificationUtil.tsx';

const Profile = () => {

    const doctor = useSelector((state: any) => state.user);
    const [editMode, setEditMode] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const [profile, setProfile] = useState<any>({});
    
    useEffect(() => {
        if (!doctor.profileId) return;
        getDoctor(doctor.profileId).then((data) => {
            setProfile({...data});
        }).catch((error) => {
            console.error('Error fetching doctor profile:', error);
        });
    }, [doctor.profileId]);

    const form = useForm({
        mode: 'uncontrolled',
        validateInputOnBlur: false,
        validateInputOnChange: false,
        initialValues: {
            dob: '',
            phone: '',
            address: '',
            licenseNo: '',
            specialization: '',
            department: '',
            totalExp: '',
        },
        validate: {
            dob: (value) => (value ? null : 'Date of Birth is required'),
            phone: (value) => (/^\d{10}$/.test(value) ? null : 'Invalid phone number'),
            licenseNo: (value) => (/^\d{12}$/.test(value) ? null : 'Invalid license number'),
            specialization: (value) => (value ? null : 'Specialization is required'),
            department: (value) => (value ? null : 'Department is required'),
            totalExp: (value) => (value === undefined || value === null || (Number(value) >= 0 && Number(value) <= 60) ? null : 'Total experience must be between 0 and 60 years'),
        },
    });

     const handleEdit = () => {
        form.setValues({...profile, dob: profile.dob ? new Date(profile.dob) : undefined});
        setEditMode(true);
    }

    const handleSubmit = (e: any) => {
        let values = form.getValues();
        form.validate();
        if (!form.isValid()) return;
        updateDoctor({ ...profile, ...values, dob: formatLocalDate(values.dob) }).then((_data) => {
            successNotification('Profile updated successfully');
            setProfile({...profile, ...values});
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
                        <div className='text-3xl font-medium text-neutral-900'>{doctor.name}</div>
                        <div className='text-xl text-neutral-700' >{doctor.email}</div>
                    </div>
                </div>
                {!editMode ? (
                    <Button type='button' onClick={handleEdit} size="lg" variant="filled" leftSection={<IconEdit />} >
                        Edit
                    </Button>
                ) : (
                    <Button type="button" onClick={handleSubmit} size="lg" variant="filled" leftSection={<IconDeviceFloppyFilled />}>
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
                                <Table.Td className='text-xl'><DateInput {...form.getInputProps("dob")} label="" description="" placeholder='Date of Birth'/></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{formatDate(profile.dob) ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Phone</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput {...form.getInputProps("phone")} label="" description="" placeholder='Phone Number' maxLength={10} clampBehavior='strict' hideControls defaultValue={doctor.phone} />
                                </Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{profile.phone ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Address</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><TextInput {...form.getInputProps("address")} label="" description="" placeholder='Address' defaultValue={doctor.address} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{profile.address ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>License Number</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput {...form.getInputProps("licenseNo")} label="" description="" placeholder='License Number' maxLength={12} clampBehavior='strict' hideControls defaultValue={doctor.licenseNo} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{profile.licenseNo ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Specialization</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><Select {...form.getInputProps("specialization")} label="" description="" placeholder='Specialization' data={doctorSpecializations} defaultValue={doctor.specialization} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{profile.specialization ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Department</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><Select {...form.getInputProps("department")} label="" description="" placeholder='Department' data={doctorDepartments} defaultValue={doctor.department} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{profile.department ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Total Experience (Years)</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput {...form.getInputProps("totalExp")} label="" description="" placeholder='Total Experience' maxLength={2} min={0} max={60} clampBehavior='strict' hideControls defaultValue={doctor.totalExp} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{profile.totalExp ?? '-'} {profile.totalExp ? 'years' : ''}</Table.Td>
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
