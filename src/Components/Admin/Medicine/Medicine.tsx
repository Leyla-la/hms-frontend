import { ActionIcon, Button, TextInput, Box, Stack, Card, Group, Title, Paper, Grid, Select, NumberInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconPill, IconBuildingFactory, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import type { DataTableFilterMeta } from 'primereact/datatable';
import React, { useEffect, useState, Suspense, useCallback } from 'react';

import { errorNotification, successNotification } from '../../../Utility/NotificationUtil.tsx';
import { medicineCategoryMap, medicationTypes } from '../../../Data/DropdownData.tsx';
import { getAllMedicines, addMedicine, updateMedicine, getMedicineById, deleteMedicine } from '../../../Service/MedicineService.tsx';


import { modals } from '@mantine/modals';
import PageHeader from '../../Common/PageHeader.tsx';

const Medicine = () => {
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        category: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        stock: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    });
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const form = useForm({
        initialValues: { id: null, name: '', dosage: '', category: '', type: '', manufacturer: '', unitPrice: 0, stock: 0 },
        validate: {
            name: (v) => (v.trim().length < 2 ? 'Required' : null),
            unitPrice: (v) => ((v || 0) <= 0 ? 'Must be > 0' : null),
        },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const page = lazyState.page;
            const size = lazyState.rows;
            const response = await getAllMedicines(page, size);

            // response is a Spring Page object: { content: [], totalElements: X, ... }
            setData(response.content || []);
            setTotalRecords(response.totalElements || 0);
            console.log('[Medicine] data set. page:', page, 'total:', response.totalElements);
        } catch (err) {
            console.error('[Medicine] fetch error', err);
            errorNotification("Failed to load medicines.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [lazyState]);

    const onPage = (event: any) => {
        setLazyState(event);
    };

    const handleSubmit = async (values: typeof form.values) => {
        console.log('[Medicine] submitting values:', values);
        setLoading(true);
        try {
            // ensure numeric fields are numbers
            const payload = { ...values, stock: Number(values.stock || 0), unitPrice: Number(values.unitPrice || 0) };
            const res = values.id ? await updateMedicine(payload) : await addMedicine(payload);
            console.log('[Medicine] submit response:', res);

            // optimistic update: if backend returns the created/updated object, update state locally
            if (!values.id) {
                if (res && res.id != null) {
                    setData(prev => [res, ...prev]);
                } else if (typeof res === 'number' || typeof res === 'string') {
                    try {
                        const created = await getMedicineById(res);
                        setData(prev => [created, ...prev]);
                    } catch {
                        await fetchData();
                    }
                } else {
                    await fetchData();
                }
            } else {
                if (res && res.id != null) {
                    setData(prev => prev.map(item => item.id === res.id ? res : item));
                } else {
                    // Backend may return no body on update; fetch the single updated entity by id
                    try {
                        console.log('[Medicine] update returned no body, fetching by id:', values.id);
                        const updated = await getMedicineById(values.id);
                        if (updated && updated.id != null) {
                            setData(prev => prev.map(item => item.id === updated.id ? updated : item));
                        } else {
                            await fetchData();
                        }
                    } catch (e) {
                        console.error('[Medicine] failed to fetch updated item, falling back to full fetch', e);
                        await fetchData();
                    }
                }
            }

            successNotification(`Medicine ${values.id ? 'updated' : 'added'} successfully!`);
            handleCloseForm();
        } catch (err) {
            console.error('[Medicine] submit error:', err);
            errorNotification("Action failed. Please check backend logs.");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        console.log('[Medicine] data state changed, length:', data.length, 'sample:', data.slice(0, 3));
    }, [data]);

    const handleDelete = (id: number) => {
        modals.openConfirmModal({
            title: <Text fw={700} c="primary.6" style={{ fontFamily: 'Merriweather, serif', fontSize: '1.25rem' }}>Please confirm your action</Text>,
            centered: true,
            children: (
                <Text size="sm">Are you sure you want to delete this medicine record? This action cannot be undone.</Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: () => {
                errorNotification("Backend chưa hỗ trợ API Delete!");
            }
        });
    };

    const handleOpenForm = (rowData?: any) => {
        form.reset();
        if (rowData?.id) form.setValues(rowData); // Đẩy data vào form nếu là Edit
        setIsFormOpen(true);
    };

    const handleCloseForm = () => { setIsFormOpen(false); form.reset(); };

    const actionBodyTemplate = useCallback((rowData: any) => (
        <Group gap="sm" justify="center">
            <ActionIcon bg="primary" color="white" variant="subtle" onClick={() => handleOpenForm(rowData)}>
                <IconEdit size={20} stroke={1.5} />
            </ActionIcon>
            <ActionIcon color="red" bg="#F9FAFB" variant="subtle" onClick={() => handleDelete(rowData.id)}>
                <IconTrash size={20} stroke={1.5} />
            </ActionIcon>
        </Group>
    ), []);

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, global: { ...(prev.global as any), value } }));
        setGlobalFilterValue(value);
    };

    return (
        <div className="p-4 md:p-6">
            {!isFormOpen ? (
                <Suspense fallback={<div />}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xl text-primary-600 font-semibold">Medicine Catalog</div>
                            <div className="text-sm text-neutral-500">
                                Browse and manage pharmacy medicine types and pricing
                            </div>
                        </div>

                        <div className="w-full flex gap-2 max-w-[440px]">
                            <Button variant="filled" onClick={() => handleOpenForm()} leftSection={<IconPlus size={16} />}>
                                Add Medicine
                            </Button>
                            <TextInput
                                leftSection={<IconSearch size={16} />}
                                placeholder="Search catalog..."
                                value={globalFilterValue}
                                onChange={onGlobalFilterChange}
                                radius="md"
                                style={{ width: '280px' }}
                            />
                        </div>
                    </div>

                    <DataTable value={data} paginator lazy
                        first={lazyState.first} rows={lazyState.rows} totalRecords={totalRecords} onPage={onPage}
                        dataKey="id" filters={filters} style={{ fontSize: 'var(--mantine-font-size-sm)' }} size='small' stripedRows
                        emptyMessage="No medicines found." paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[10, 50, 1000]} filterDisplay="menu" globalFilterFields={['name', 'manufacturer', 'category', 'stock']}
                        loading={loading}>
                        <Column field="name" header="Name" filter filterField="name" filterPlaceholder="Search by name" sortable style={{ minWidth: '12rem', fontWeight: 600 }} />
                        <Column field="category" header="Category" filter filterField="category" filterPlaceholder="Search by category" body={(row) => medicineCategoryMap[row.category] || row.category} />
                        <Column field="type" header="Type" filter filterField="type" body={(row: any) => (row?.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1).toLowerCase() : '')} />
                        <Column field="dosage" header="Dosage" />
                        <Column field="stock" header="Stock" sortable />
                        <Column field="unitPrice" header="Price (VND)" sortable body={(row) => row.unitPrice?.toLocaleString()} />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '8rem', textAlign: 'center' }} />
                    </DataTable>
                </Suspense>
            ) : (
                <Box component="form" onSubmit={form.onSubmit(handleSubmit)} p="sm">
                    <Stack gap="lg">
                        <Card padding="sm">
                            <Title order={5} ff="Google Sans, sans-serif" c="primary.6">
                                {form.values.id ? `Edit Medicine #${form.values.id}` : 'Add New Medicine'}
                            </Title>
                        </Card>

                        <Paper withBorder p="lg" radius="md">
                            <Grid gutter="md">
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <TextInput label="Medicine Name" placeholder="e.g. Paracetamol" withAsterisk leftSection={<IconPill size={16} />} {...form.getInputProps('name')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 3 }}>
                                    <TextInput label="Dosage" placeholder="e.g. 500mg" {...form.getInputProps('dosage')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 3 }}>
                                    <NumberInput label="Stock Quantity" min={0} {...form.getInputProps('stock')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Select label="Category" data={Object.entries(medicineCategoryMap).map(([value, label]) => ({ value, label }))} {...form.getInputProps('category')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Select label="Type" data={medicationTypes} {...form.getInputProps('type')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput label="Unit Price" min={0} prefix="VND " withAsterisk {...form.getInputProps('unitPrice')} />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <TextInput label="Manufacturer" placeholder="Company name" leftSection={<IconBuildingFactory size={16} />} {...form.getInputProps('manufacturer')} />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        <Group justify="flex-end" pt="lg">
                            <Button variant="light" color="neutral.5" onClick={handleCloseForm} leftSection={<IconX size={16} />}>Cancel</Button>
                            <Button type="submit" loading={loading} color="primary.4" leftSection={<IconDeviceFloppy size={16} />}>
                                {form.values.id ? 'Save Changes' : 'Create Medicine'}
                            </Button>
                        </Group>
                    </Stack>
                </Box>
            )}

        </div>
    );
};

export default Medicine;