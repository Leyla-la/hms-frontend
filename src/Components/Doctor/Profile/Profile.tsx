import { ActionIcon, Avatar, Button, Divider, Modal, NumberInput, Select, Table, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates';
import { IconDeviceFloppyFilled, IconEdit, IconCamera } from '@tabler/icons-react'
import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks';
import { doctorSpecializations, doctorDepartments } from '../../../Data/DropdownData.tsx';

const Profile = () => {

    // const doctor = useSelector((state: any) => state.user);

    const doctor = {
        id: 1,
        name: "Tran Thi Giang",
        email: "giang.hms@gmail.com",
        dob: "2002-05-15",
        phone: "+84 987 654 321",
        address: "Ha Dong Dist, Hanoi, Vietnam",
        licenseNo: "VN-MD-2023-0001",
        specialization: "Cardiology",
        department: "Cardiology Department",
        totalExp: 5
    };

    const [editMode, setEditMode] = useState(false);

    const [opened, { open, close }] = useDisclosure(false);

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
                    <Button size="lg" variant="filled" leftSection={<IconEdit />} onClick={() => setEditMode(!editMode)}>
                        Edit
                    </Button>
                ) : (
                    <Button type='submit' size="lg" variant="filled" leftSection={<IconDeviceFloppyFilled />} onClick={() => setEditMode(!editMode)}>
                        Save
                    </Button>
                )}
            </div>
            <Divider my="xl" />
            <div>
                <div className="text-2xl font-medium mb-5 text-neutral-900"> Personal Information </div>
                <Table striped stripedColor="primary.1" verticalSpacing="md" withColumnBorders={false}>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Date of Birth</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><DateInput label="" description="" placeholder='Date of Birth' defaultValue={new Date(doctor.dob)}
                                /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{doctor.dob}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Phone</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput label="" description="" placeholder='Phone Number' maxLength={10} clampBehavior='strict' hideControls defaultValue={doctor.phone} />
                                </Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{doctor.phone}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Address</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><TextInput label="" description="" placeholder='Address' defaultValue={doctor.address} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{doctor.address}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>License Number</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput label="" description="" placeholder='License Number' maxLength={12} clampBehavior='strict' hideControls defaultValue={doctor.licenseNo} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{doctor.licenseNo}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Specialization</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><Select label="" description="" placeholder='Specialization' data={doctorSpecializations} defaultValue={doctor.specialization} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{doctor.specialization}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Department</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><Select label="" description="" placeholder='Department' data={doctorDepartments} defaultValue={doctor.department} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{doctor.department}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Total Experience (Years)</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput label="" description="" placeholder='Total Experience' maxLength={2} min={0} max={60} clampBehavior='strict' hideControls defaultValue={doctor.totalExp} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{doctor.totalExp}</Table.Td>
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
