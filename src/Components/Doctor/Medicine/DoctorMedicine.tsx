import { TextInput, Box, Stack, Group, Text, Paper, ThemeIcon, Badge } from '@mantine/core';
import { IconSearch, IconPill, IconFlask } from '@tabler/icons-react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import type { DataTableFilterMeta } from 'primereact/datatable';
import React, { useEffect, useState, Suspense } from 'react';

import { medicineCategoryMap } from '../../../Data/DropdownData.tsx';
import { getAllMedicines } from '../../../Service/MedicineService.tsx';
import { errorNotification } from '../../../Utility/NotificationUtil.tsx';

const DoctorMedicine = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        category: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    });
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const page = lazyState.page;
            const size = lazyState.rows;
            const response = await getAllMedicines(page, size);
            setData(response.content || []);
            setTotalRecords(response.totalElements || 0);
        } catch (err) {
            console.error('[DoctorMedicine] fetch error', err);
            errorNotification("Failed to load medicine catalog.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [lazyState]);

    const onPage = (event: any) => {
        setLazyState(event);
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, global: { ...(prev.global as any), value } }));
        setGlobalFilterValue(value);
    };


    const stockBodyTemplate = (row: any) => {
        const stock = row.stock || 0;
        const color = stock > 50 ? 'green' : stock > 10 ? 'orange' : 'red';
        return <Badge color={color} variant="light">{stock} units</Badge>;
    };

    const typeBodyTemplate = (row: any) => (
        <Badge variant="outline" size="sm" color="gray">
            {row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1).toLowerCase() : 'Generic'}
        </Badge>
    );

    return (
        <Paper withBorder radius="md" shadow="sm">
            <Suspense fallback={<div />}>
                <div className="p-4 md:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xl text-primary-600 font-semibold">Medicine Catalog</div>
                            <div className="text-sm text-neutral-500">
                                Search and view available medications
                            </div>
                        </div>

                        <div className="w-full max-w-[320px]">
                            <TextInput
                                leftSection={<IconSearch size={16} />}
                                placeholder="Search catalog..."
                                value={globalFilterValue}
                                onChange={onGlobalFilterChange}
                                w={250}
                            />
                        </div>
                    </div>

                    <DataTable value={data} paginator lazy
                        first={lazyState.first} rows={lazyState.rows} totalRecords={totalRecords} onPage={onPage}
                        dataKey="id" filters={filters} size='small' stripedRows
                        emptyMessage="No medicines found in catalog."
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[10, 50, 100]} filterDisplay="menu"
                        globalFilterFields={['name', 'manufacturer', 'category']}
                        loading={loading}>
                        <Column field="name" header="Name" sortable style={{ minWidth: '12rem', fontWeight: 600 }} />
                        <Column field="category" header="Category" body={(row) => medicineCategoryMap[row.category] || row.category} />
                        <Column field="type" header="Type" body={typeBodyTemplate} />
                        <Column field="dosage" header="Dosage" />
                        <Column field="stock" header="Status" body={stockBodyTemplate} sortable />
                        <Column field="unitPrice" header="Price" body={(row) => row.unitPrice?.toLocaleString() + " ₫"} />
                    </DataTable>
                </div>
            </Suspense>
        </Paper>
    );
};

export default DoctorMedicine;
