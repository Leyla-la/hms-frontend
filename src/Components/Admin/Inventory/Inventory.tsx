import { ActionIcon, Button, TextInput, Box, Stack, Card, Group, Title, Paper, Grid, Select, NumberInput, Text, Badge } from '@mantine/core';
import { DateInput, DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import type { DataTableFilterMeta } from 'primereact/datatable';
import React, { useEffect, useState, Suspense, useCallback } from 'react';

import { errorNotification, successNotification } from '../../../Utility/NotificationUtil.tsx';
import { formatLocalDate } from '../../../Utility/DateUtility.tsx';

import { getAllStocks, addStock, updateStock, getStockById, deleteStock } from '../../../Service/InventoryService.tsx';
import { getMedicineList } from '../../../Service/MedicineService.tsx';


import { modals } from '@mantine/modals';
import PageHeader from '../../Common/PageHeader.tsx';

const Inventory = () => {
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [medicineOptions, setMedicineOptions] = useState<Array<{ value: string, label: string }>>([]);
    const [medicineMap, setMedicineMap] = useState<Record<number, any>>({});
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        medicineName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        batchNo: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        status: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        addedDate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        expiryDate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    });
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    type InventoryFormValues = {
        id: number | null;
        medicineId: number | null;
        batchNo: string;
        quantity: number;
        expiryDate: Date | null;
    };

    const form = useForm<InventoryFormValues>({
        initialValues: { id: null, medicineId: null, batchNo: '', quantity: 0, expiryDate: null },
        validate: {
            medicineId: (v) => (v == null ? 'Required' : null),
            quantity: (v) => ((v || 0) < 0 ? 'Must be >= 0' : null),
        },
    });

    const fetchMetadata = async () => {
        try {
            const meds = await getMedicineList();
            const mMap: Record<number, any> = {};
            const medOpts = meds.map((m: any) => {
                mMap[m.id] = m;
                return {
                    value: String(m.id),
                    label: `${m.name || 'Unknown'} — ${m.manufacturer || ''}`
                };
            });
            setMedicineMap(mMap);
            setMedicineOptions(medOpts);
        } catch (err) {
            console.error('[inventory] metadata error', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const page = lazyState.page;
            const size = lazyState.rows;
            const response = await getAllStocks(page, size);

            // response is a Spring Page object: { content: [], totalElements: X, ... }
            // Medicine name and manufacturer are now provided by backend in the DTO
            setData(response.content || []);
            setTotalRecords(response.totalElements || 0);
            console.log('[inventory] data set. page:', page, 'total:', response.totalElements);
        } catch (err) {
            console.error('[inventory] fetch error', err);
            errorNotification("Failed to load inventories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        fetchData();
    }, [lazyState]);

    const onPage = (event: any) => {
        setLazyState(event);
    };

    const handleSubmit = async (values: typeof form.values) => {
        console.log('[inventory] submitting values:', values);
        setLoading(true);
        try {
            // build payload matching MedicineInventoryDTO expected by backend
            const addedDateValue = values.id
                ? (data.find(d => d.id === values.id)?.addedDate || new Date().toISOString())
                : new Date().toISOString();

            const payload = {
                ...values,
                medicineId: Number(values.medicineId),
                quantity: Number(values.quantity || 0),
                expiryDate: formatLocalDate(values.expiryDate),
                addedDate: addedDateValue,
            };
            const res = values.id ? await updateStock(payload) : await addStock(payload);
            console.log('[inventory] submit response:', res);

            // optimistic update: if backend returns the created/updated object, update state locally
            if (!values.id) {
                if (res && res.id != null) {
                    setData(prev => [res, ...prev]);
                } else if (typeof res === 'number' || typeof res === 'string') {
                    try {
                        const created = await getStockById(res);
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
                        console.log('[inventory] update returned no body, fetching by id:', values.id);
                        const updated = await getStockById(values.id);
                        if (updated && updated.id != null) {
                            setData(prev => prev.map(item => item.id === updated.id ? updated : item));
                        } else {
                            await fetchData();
                        }
                    } catch (e) {
                        console.error('[inventory] failed to fetch updated item, falling back to full fetch', e);
                        await fetchData();
                    }
                }
            }

            successNotification(`Inventory ${values.id ? 'updated' : 'added'} successfully!`);
            handleCloseForm();
        } catch (err) {
            console.error('[inventory] submit error:', err);
            errorNotification("Action failed. Please check backend logs.");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        console.log('[inventory] data state changed, length:', data.length, 'sample:', data.slice(0, 3));
    }, [data]);

    const handleDelete = (id: number) => {
        modals.openConfirmModal({
            title: <Text fw={700} c="primary.6" style={{ fontFamily: 'Merriweather, serif', fontSize: '1.25rem' }}>Please confirm your action</Text>,
            centered: true,
            children: (
                <Text size="sm">Are you sure you want to delete this inventory record? This will permanently remove the batch data.</Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: () => {
                errorNotification("Backend chưa hỗ trợ API Delete!");
            }
        });
    };

    const handleOpenForm = (rowData?: any) => {
        form.reset();
        if (rowData?.id) {
            form.setValues({
                id: rowData.id,
                medicineId: rowData.medicineId ?? null,
                batchNo: rowData.batchNo ?? '',
                quantity: rowData.quantity ?? 0,
                expiryDate: rowData.expiryDate ? new Date(rowData.expiryDate) : null,
            });
        }
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

    const medicineBody = useCallback((row: any) => {
        return `${row.medicineName || 'Unknown'} ${row.manufacturer ? '— ' + row.manufacturer : ''}`;
    }, []);

    const statusBody = useCallback((row: any) => {
        const now = new Date();
        const exp = row.expiryDate ? new Date(row.expiryDate) : null;
        const statusNorm = String(row.status || '').toUpperCase();
        const isExpired = statusNorm === 'EXPIRED' || (exp instanceof Date && !isNaN(exp.getTime()) && exp < now);
        const qty = Number(row.quantity ?? (row.stock ?? 0));
        const isOutOfStock = statusNorm === 'SOLD_OUT' || (!isExpired && qty <= 0);

        if (isExpired) return <Badge color="red">EXPIRED</Badge>;
        if (isOutOfStock) return <Badge color="orange">OUT OF STOCK</Badge>;
        return <Badge color="green">ACTIVE</Badge>;
    }, []);

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, global: { ...(prev.global as any), value } }));
        setGlobalFilterValue(value);
    };

    return (
        <div className="p-4 md:p-6">
            {!isFormOpen ? (
                <Suspense fallback={<div />}>
                    {/* <PageHeader
                        title="Medicine Inventory"
                        description="Track medicine batches, stock levels, and expiration dates"
                        rightSection={
                            <Group>
                                <Button variant="filled" onClick={() => handleOpenForm()} leftSection={<IconPlus size={16} />}>
                                    Add Inventory
                                </Button>
                                <TextInput
                                    leftSection={<IconSearch size={16} />}
                                    placeholder="Search inventory..."
                                    value={globalFilterValue}
                                    onChange={onGlobalFilterChange}
                                    radius="md"
                                    style={{ width: '280px' }}
                                />
                            </Group>
                        }
                    /> */}
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xl text-primary-600 font-semibold">Medicine Inventory</div>
                            <div className="text-sm text-neutral-500">
                                Track medicine batches, stock levels, and expiration dates
                            </div>
                        </div>

                        <div className="w-full flex gap-2 max-w-[440px]">
                            <Button variant="filled" onClick={() => handleOpenForm()} leftSection={<IconPlus size={16} />}>
                                Add Inventory
                            </Button>
                            <TextInput
                                leftSection={<IconSearch size={16} />}
                                placeholder="Search inventory..."
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
                        emptyMessage="No inventories found." paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[10, 50, 1000]} filterDisplay="menu" globalFilterFields={['medicineName', 'batchNo', 'status', 'addedDate', 'expiryDate']}
                        loading={loading}>
                        <Column header="Medicine" field="medicineName" filter filterField="medicineName" filterPlaceholder="Search by medicine" body={medicineBody} style={{ minWidth: '12rem', fontWeight: 600 }} />
                        <Column field="batchNo" header="Batch No" filter filterField="batchNo" />
                        <Column field="quantity" header="Quantity" sortable />
                        <Column field="expiryDate" header="Expiry Date" sortable filter filterField="expiryDate" body={(row: any) => row.expiryDate ? formatLocalDate(row.expiryDate) : ''} />
                        <Column field="status" header="Status" filter filterField="status" body={statusBody} />
                        <Column header="Remaining" body={(row: any) => (row.quantity != null ? row.quantity : (medicineMap[row.medicineId]?.stock ?? '-'))} />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '8rem', textAlign: 'center' }} />
                    </DataTable>
                </Suspense>
            ) : (
                <Box component="form" onSubmit={form.onSubmit(handleSubmit)} p="sm">
                    <Stack gap="lg">
                        <Group justify="space-between" align="center" mb="sm">
                            <Stack gap={2}>
                                <Title order={2} fw={600} c="primary.6" style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '1.25rem' }}>
                                    {form.values.id ? `Edit inventory #${form.values.id}` : 'Add New inventory'}
                                </Title>
                            </Stack>
                        </Group>

                        <Paper withBorder p="lg" radius="md">
                            <Grid gutter="md">
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <Select label="Medicine" placeholder="Select medicine" data={medicineOptions} value={form.values.medicineId ? String(form.values.medicineId) : ''}
                                        onChange={(v) => form.setFieldValue('medicineId', v ? Number(v) : null)} withAsterisk />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <TextInput label="Batch No" placeholder="Batch number" {...form.getInputProps('batchNo')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <NumberInput label="Quantity" min={0} {...form.getInputProps('quantity')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <DateInput
                                        label="Expiry Date"
                                        placeholder="YYYY-MM-DD"
                                        clearable
                                        {...form.getInputProps('expiryDate')}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        <Group justify="flex-end" pt="lg">
                            <Button variant="light" color="neutral.5" onClick={handleCloseForm} leftSection={<IconX size={16} />}>Cancel</Button>
                            <Button type="submit" loading={loading} color="primary.4" leftSection={<IconDeviceFloppy size={16} />}>
                                {form.values.id ? 'Save Changes' : 'Create inventory'}
                            </Button>
                        </Group>
                    </Stack>
                </Box>
            )}
        </div>
    );
};

export default Inventory;