import { ActionIcon, Avatar, Button, Divider, Modal, NumberInput, Select, Table, TagsInput, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates';
import { IconDeviceFloppyFilled, IconEdit, IconCamera } from '@tabler/icons-react'
import { useState } from 'react'
import {bloodGroups} from '../../../Data/DropdownData.tsx';
import { useDisclosure } from '@mantine/hooks';

const Profile = () => {

    // const patient = useSelector((state: any) => state.user);

    const patient = {
        name: "Tran Thi Giang",
        email: "giang.hms@gmail.com",
        dob: "2002-05-15",
        phone: "+84 987 654 321",
        address: "Ha Dong Dist, Hanoi, Vietnam",
        citizenId: "001202001234",
        bloodGroup: "O+",
        allergies: "Pollen, Shellfish",
        chronicDiseases: "Sinusitis"
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
                        <div className='text-3xl font-medium text-neutral-900'>{patient.name}</div>
                        <div className='text-xl text-neutral-700' >{patient.email}</div>
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
                                <Table.Td className='text-xl'><DateInput label="" description="" placeholder='Date of Birth' defaultValue={new Date(patient.dob)}
                                /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{patient.dob}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Phone</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput label="" description="" placeholder='Phone Number' maxLength={10} clampBehavior='strict' hideControls defaultValue={patient.phone} />
                                </Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{patient.phone}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Address</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><TextInput label="" description="" placeholder='Address' defaultValue={patient.address} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{patient.address}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Citizen ID</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><NumberInput label="" description="" placeholder='Citizen ID' maxLength={12} clampBehavior='strict' hideControls defaultValue={patient.citizenId} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{patient.citizenId}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Blood Group</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><Select placeholder="Blood Group" data={bloodGroups} /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{patient.bloodGroup}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Allergies</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><TagsInput label="" placeholder="Allergies separated by comma" /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{patient.allergies}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className='font-semibold text-xl'>Chronic Diseases</Table.Td>
                            {editMode ? (
                                <Table.Td className='text-xl'><TagsInput label="" placeholder="Chronic diseases separated by comma" /></Table.Td>
                            ) : (
                                <Table.Td className='text-xl'>{patient.chronicDiseases}</Table.Td>
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
