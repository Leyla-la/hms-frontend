import React, { useEffect, useMemo, useState, Suspense, useCallback } from 'react';
import { ActionIcon, Box, Button, Card, Grid, Group, Modal, NumberInput, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconDeviceFloppy, IconEdit, IconEye, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import type { DataTableFilterMeta } from 'primereact/datatable';

import { getMedicineList } from '../../../Service/MedicineService.tsx';
import { getAllPrescriptionsList, getMedicinesByPrescriptionId } from '../../../Service/AppointmentService.tsx';
import { formatDateWithTime } from '../../../Utility/DateUtility.tsx';
import { computeQuantityFromFrequencyAndDuration } from '../../../Utility/PrescriptionUtil.tsx';
import { addSale, getAllSales, getSaleById, getSaleItemsBySaleId } from '../../../Service/SalesService.tsx';
import { errorNotification, successNotification } from '../../../Utility/NotificationUtil.tsx';
import PageHeader from '../../Common/PageHeader.tsx';



type SaleItemRow = {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  frequency?: string | null;
  duration?: number | null;
};

const Sales = () => {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [medicines, setMedicines] = useState<any[]>([]);
  const [medicineMap, setMedicineMap] = useState<Record<number, any>>({});

  const [salesList, setSalesList] = useState<any[]>([]);
  const [viewSale, setViewSale] = useState<any | null>(null);

  // editing feature removed — always create new sale from form

  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [saleItems, setSaleItems] = useState<SaleItemRow[]>([]);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerContact, setBuyerContact] = useState<string>('');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [presModalOpen, setPresModalOpen] = useState(false);
  const [importingPres, setImportingPres] = useState(false);


  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    addedDate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    total: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
  });

  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  // Paged state for prescriptions modal
  const [presTotalRecords, setPresTotalRecords] = useState(0);
  const [presLazyState, setPresLazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
  });
  const [presLoading, setPresLoading] = useState(false);

  const resetLineForm = () => {
    setSelectedMedicineId(null);
    setQuantity(1);
  };

  const resetSaleForm = () => {
    setSaleItems([]);
    resetLineForm();
    setBuyerName('');
    setBuyerContact('');
  };

  const handleOpenAddForm = () => {
    resetSaleForm();
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetSaleForm();
  };

  const buildMedicineMap = (list: any[]) => {
    const map: Record<number, any> = {};
    (list || []).forEach((m: any) => {
      map[m.id] = m;
    });
    return map;
  };

  const fetchMedicines = async () => {
    try {
      const list = await getMedicineList();
      console.log('[Sales] fetched medicines:', list);

      const active = (list || []).filter((m: any) => {
        const stock = Number(m?.stock ?? 0);
        const status = String(m?.status || '').toUpperCase();
        return (status === 'ACTIVE' || !m.status) && stock > 0;
      });

      console.log('[Sales] active medicines after filter:', active);
      setMedicines(active);
      setMedicineMap(buildMedicineMap(active));
    } catch (e) {
      console.error('[Sales] failed to load medicines', e);
      errorNotification('Failed to load medicines');
    }
  };

  // initial load
  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [lazyState]);

  const openPrescriptionsModal = async () => {
    setPresModalOpen(true);
    setPresLoading(true);
    try {
      const pres = await getAllPrescriptionsList();
      setPrescriptions(pres || []);
    } catch (err) {
      console.error('[Sales] failed to load prescriptions', err);
      errorNotification('Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setPresLoading(false);
    }
  };

  const handleImportPrescription = async (prescriptionOrId: any) => {
    setImportingPres(true);
    try {
      // resolve prescription object and id
      let prescription: any = null;
      let prescriptionId: any = null;
      if (prescriptionOrId && typeof prescriptionOrId === 'object') {
        prescription = prescriptionOrId;
        prescriptionId = prescription.id;
      } else {
        prescriptionId = prescriptionOrId;
        prescription = (prescriptions || []).find((p: any) => Number(p.id) === Number(prescriptionId));
      }

      // autofill buyer from the prescription row when available (prefer direct row data)
      if (prescription) {
        try {
          const name = prescription.patientName || prescription.patient?.name || prescription.patient?.fullName || null;
          const contact = prescription.patientContact || prescription.patient?.contact || prescription.patient?.phone || null;
          if (name) {
            console.log('[Sales] autofill buyer from prescription (direct):', { prescriptionId, name, contact });
            setBuyerName(name);
            if (contact) setBuyerContact(contact);
          }
        } catch (e) {
          console.warn('[Sales] failed to autofill buyer from prescription object', e);
        }
      }

      const items = await getMedicinesByPrescriptionId(prescriptionId);
      console.log('[Sales] medicines from prescription:', prescriptionId, items);
      (items || []).forEach((it: any, idx: number) => console.log(`[Sales][pres-item ${idx}]`, JSON.stringify(it, null, 2)));

      // detect items that are not linked to pharmacy master (no medicineId)
      const skipped = (items || []).filter((it: any) => !it.medicineId && !it.medicine?.id);
      if (skipped.length > 0) {
        const list = skipped.map((s: any) => s.name || s.itemName || `id:${s.id}`).slice(0, 10).join(', ');
        errorNotification(`Skipped ${skipped.length} prescription item(s) not linked to pharmacy: ${list}`);
        console.warn('[Sales] skipped prescription items (no medicineId):', skipped);
      }

      // only candidates that reference a pharmacy medicine id
      const candidates = (items || []).filter((it: any) => it.medicineId || it.medicine?.id);

      const computed = candidates.map((it: any) => {
        const freq = it.frequency || it.frequencyCode || '';
        const duration = Number(it.duration || 1);
        const qty = computeQuantityFromFrequencyAndDuration(freq, duration);
        console.log('[Sales] compute qty:', { freq, duration, qty });
        const resolvedMedicineId = Number(it.medicineId ?? it.medicine?.id ?? 0);

        // resolve pharmacy master data for price/stock
        const pharmacyMed = medicineMap[Number(resolvedMedicineId)];
        if (!pharmacyMed) console.warn('[Sales] no pharmacy master found for medicineId', resolvedMedicineId, 'prescriptionItem', it);
        const unitPrice = Number(pharmacyMed?.unitPrice ?? it.unitPrice ?? it.price ?? 0);

        return {
          prescriptionItemId: it.id,
          medicineId: resolvedMedicineId,
          name: it.name || it.medicine?.name || it.medicineName || it.itemName,
          unitPrice,
          frequency: freq,
          duration,
          quantity: qty,
          route: it.route,
          type: it.type,
          instructions: it.instructions,
        };
      });

      // check stock availability
      const insufficient: any[] = [];
      const withStockChecked = computed.map((si: any) => {
        const stock = medicineMap[Number(si.medicineId)];
        const available = stock?.stock ?? 0;
        if (available < si.quantity) insufficient.push({ ...si, available });
        return { ...si, available };
      });

      if (insufficient.length > 0) {
        console.error('[Sales] insufficient stock for import:', insufficient);
        const list = insufficient.map(i => `${i.name} (need ${i.quantity}, have ${i.available})`).join('; ');
        errorNotification(`Insufficient stock for: ${list}`);
        return;
      }

      // map to SaleItemRow and add
      const newItems: SaleItemRow[] = withStockChecked.map((si: any) => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        medicineId: Number(si.medicineId),
        medicineName: si.name,
        quantity: Number(si.quantity),
        unitPrice: Number(si.unitPrice || 0),
        lineTotal: Number(si.unitPrice || 0) * Number(si.quantity || 0),
        frequency: si.frequency ?? null,
        duration: si.duration ?? null,
      }));

      console.log('[Sales] import -> adding sale items:', newItems);
      setSaleItems((prev) => [...prev, ...newItems]);
      // no batch assignment UI — skip auto-open
      successNotification(`Imported ${newItems.length} items from prescription #${prescriptionId}`);
      setPresModalOpen(false);
    } catch (err) {
      console.error('[Sales] import failed:', err);
      errorNotification('Failed to import prescription items. See console logs.');
    } finally {
      setImportingPres(false);
    }
  };

  const fetchSales = async () => {
    setTableLoading(true);
    try {
      const page = lazyState.page;
      const size = lazyState.rows;
      const response = await getAllSales(page, size);

      setSalesList(response.content || []);
      setTotalRecords(response.totalElements || 0);
    } catch (e) {
      console.error('[Sales] failed to load sales', e);
      errorNotification('Failed to load sales');
    } finally {
      setTableLoading(false);
    }
  };

  const onPage = (event: any) => {
    setLazyState(event);
  };

  const medicineOptions = useMemo(
    () => {
      const pickedIds = new Set(saleItems.map((it) => Number(it.medicineId)));
      return medicines
        .filter((m) => !pickedIds.has(Number(m.id)))
        .map((m) => ({
          value: String(m.id),
          label: `${m.name} — ${m.manufacturer || ''} (stock ${m.stock ?? 0})`,
        }));
    },
    [medicines, saleItems]
  );

  const selectedMedicine = selectedMedicineId ? medicineMap[selectedMedicineId] : null;

  const handleSelectMedicineChange = (v: string | null) => {
    const id = v ? Number(v) : null;
    console.log('[Sales] select medicine change ->', { raw: v, id, entry: medicineMap[id ?? -1] });
    if (id && medicineMap[id]) {
      const m = medicineMap[id];
      console.log('[Sales] selected medicine full data:', JSON.stringify(m, null, 2));
      console.log('[Sales] candidate frequency fields:', {
        frequency: m.frequency, frequencyCode: m.frequencyCode, frequencyLabel: m.frequencyLabel
      });
    }
    setSelectedMedicineId(id);
  };

  const lineTotal = useMemo(() => {
    if (!selectedMedicine) return 0;
    return Number(selectedMedicine.unitPrice || 0) * Number(quantity || 0);
  }, [selectedMedicine, quantity]);

  useEffect(() => {
    if (!selectedMedicine) {
      setQuantity(1);
      return;
    }
    const max = Number(selectedMedicine.stock ?? 0) || undefined;
    if (max !== undefined && quantity > max) {
      setQuantity(max);
    }
  }, [selectedMedicine]);

  const total = useMemo(() => {
    return saleItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  }, [saleItems]);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({
      ...prev,
      global: { ...(prev.global as any), value },
    }));
  };

  const handleAddItem = () => {
    if (!selectedMedicine) {
      errorNotification('Please select a medicine');
      return;
    }

    const qty = Number(quantity || 0);
    if (qty <= 0) {
      errorNotification('Quantity must be greater than 0');
      return;
    }

    if (selectedMedicine.stock != null && qty > Number(selectedMedicine.stock)) {
      errorNotification('Quantity exceeds available stock');
      return;
    }

    const newItem: SaleItemRow = {
      id: Date.now(),
      medicineId: Number(selectedMedicine.id),
      medicineName: selectedMedicine.name,
      quantity: qty,
      unitPrice: Number(selectedMedicine.unitPrice || 0),
      lineTotal: Number(selectedMedicine.unitPrice || 0) * qty,
    };

    console.log('[Sales] adding sale item:', newItem);
    setSaleItems((prev) => [...prev, newItem]);
    resetLineForm();
  };

  const handleRemoveItem = (id: number) => {
    console.log('[Sales] removing sale item id:', id);
    setSaleItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateOrUpdateSale = async () => {
    if (!saleItems.length) {
      errorNotification('Add at least one sale item');
      return;
    }

    setLoading(true);
    try {
      const saleItemsDTO = saleItems.map((it) => ({
        medicineId: Number(it.medicineId),
        quantity: Number(it.quantity || 0),
        unitPrice: Number(it.unitPrice || 0),
        stock: medicineMap[Number(it.medicineId)]?.stock ?? null,
        frequency: it.frequency ?? null,
        duration: it.duration ?? null,
      }));

      const payload: any = {
        buyerName: buyerName || null,
        buyerContact: buyerContact || null,
        totalAmount: Number(total || 0),
        saleItems: saleItemsDTO,
      };

      console.log('[Sales] submit payload:', payload);
      await addSale(payload);
      successNotification('Sale created successfully');

      await Promise.all([fetchSales(), fetchMedicines()]);
      handleCloseForm();
    } catch (e: any) {
      console.error('[Sales] save failed', e);
      console.error('[Sales] save response data:', e?.response?.data || e);
      errorNotification(
        'Failed to save sale. Please check backend logs.'
      );
    } finally {
      setLoading(false);
    }
  };

  // batch assignment removed

  const mapSaleDetailsToRows = (saleDetail: any): SaleItemRow[] => {
    const rawItems = saleDetail?.items || saleDetail?.saleItems || [];
    if (!Array.isArray(rawItems)) return [];

    return rawItems.map((it: any, index: number) => {
      const medicineId = Number(it.medicineId || it.medicine?.id || 0);
      const medicineName =
        it.medicineName ||
        it.medicine?.name ||
        medicineMap[medicineId]?.name ||
        '';

      const qty = Number(it.quantity || 0);
      const price = Number(it.unitPrice || 0);

      return {
        id: Number(it.id || Date.now() + index),
        medicineId,
        medicineName,
        quantity: qty,
        unitPrice: price,
        lineTotal: qty * price,
      };
    });
  };

  // edit feature removed

  const handleViewSale = async (saleId: number) => {
    try {
      setLoading(true);
      console.log('[Sales] loading sale for view id:', saleId);
      const [res, items] = await Promise.all([getSaleById(saleId), getSaleItemsBySaleId(saleId)]);
      console.log('[Sales] loaded sale for view:', res, 'items:', items);
      setViewSale({ ...(res || {}), saleItems: items });
      setIsViewOpen(true);
    } catch (e) {
      console.error('[Sales] failed to load sale detail', e);
      errorNotification('Failed to load sale details');
    } finally {
      setLoading(false);
    }
  };

  const salesActionBody = useCallback((rowData: any) => (
    <Group gap="xs" justify="center">
      <ActionIcon
        bg="#F3F4F6"
        color="blue"
        variant="subtle"
        onClick={() => handleViewSale(rowData.id)}
      >
        <IconEye size={18} stroke={1.5} />
      </ActionIcon>
    </Group>
  ), []);

  const itemActionBody = useCallback((rowData: SaleItemRow) => (
    <ActionIcon
      color="red"
      bg="#F9FAFB"
      variant="subtle"
      onClick={() => handleRemoveItem(rowData.id)}
    >
      <IconTrash size={18} stroke={1.5} />
    </ActionIcon>
  ), []);

  const salesHeader = (
    <Group justify="space-between">
      <Button
        variant="filled"
        onClick={handleOpenAddForm}
        leftSection={<IconPlus size={16} />}
      >
        Add Sale
      </Button>

      <TextInput
        leftSection={<IconSearch size={16} />}
        placeholder="Global Search..."
        value={globalFilterValue}
        onChange={onGlobalFilterChange}
      />
    </Group>
  );

  // const saleItemsHeader = (
  //   <Group justify="space-between">
  //     <Title order={5} ff="Merriweather, serif" c="primary.6">
  //       Add New Sale
  //     </Title>
  //     <Text fw={700}>Total: {total.toLocaleString()} VND</Text>
  //   </Group>
  // );

  const detailItems = mapSaleDetailsToRows(viewSale);

  return (
    <div className="p-4 md:p-6">
      {!isFormOpen ? (
        <Suspense fallback={<div />}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-xl text-primary-600 font-semibold">Sales & Invoicing</div>
              <div className="text-sm text-neutral-500">
                Record new pharmacy sales and view transaction history
              </div>
            </div>

            <div className="w-full flex gap-2 max-w-[440px]">
              <Button variant="filled" onClick={() => handleOpenAddForm()} leftSection={<IconPlus size={16} />}>
                Add Sale
              </Button>
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder="Search sales..."
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                radius="md"
                style={{ width: '280px' }}
              />
            </div>
          </div>
          <DataTable
            value={salesList}
            paginator
            lazy
            first={lazyState.first}
            rows={lazyState.rows}
            totalRecords={totalRecords}
            onPage={onPage}
            dataKey="id"
            filters={filters}
            loading={tableLoading}
            style={{ fontSize: 'var(--mantine-font-size-sm)' }}
            size="small"
            stripedRows
            emptyMessage="No sales found."
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[10, 25, 50]}
            filterDisplay="menu"
            globalFilterFields={['id', 'addedDate', 'createdAt', 'total', 'amount']}
          >
            <Column
              field="buyerName"
              header="Buyer Name"
              filter
              filterField="buyerName"
              style={{ minWidth: '12rem' }}
            />
            <Column
              field="buyerContact"
              header="Contact"
              filter
              filterField="buyerContact"
              style={{ minWidth: '10rem' }}
            />
            <Column
              field="saleDate"
              header="Sale Date"
              sortable
              body={(row: any) => {
                const d = row.saleDate || row.addedDate || row.createdAt || null;
                return d ? formatDateWithTime(d) : '-';
              }}
              style={{ minWidth: '12rem' }}
            />
            <Column
              field="total"
              header="Total (VND)"
              sortable
              body={(row: any) => Number(row.totalAmount || row.total || row.amount || 0).toLocaleString()}
              style={{ minWidth: '12rem' }}
            />
            <Column
              header="Actions"
              body={salesActionBody}
              style={{ width: '6rem', textAlign: 'center' }}
            />
          </DataTable>
        </Suspense>
      ) : (
        <Box p="sm">
          <Stack gap="lg">
            <Group justify="space-between" align="center" mb="sm">
              <Stack gap={2}>
                <Title order={2} fw={600} c="primary.6" style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '1.25rem' }}>
                  Add New Sale
                </Title>
              </Stack>
            </Group>

            <Paper withBorder p="lg" radius="md">
              <Stack gap="lg">
                <Group justify="flex-end" mb="sm">
                  <Button size="xs" variant="outline" onClick={openPrescriptionsModal} loading={importingPres}>
                    Import Prescription
                  </Button>
                </Group>
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Buyer Name"
                      placeholder="Buyer full name"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.currentTarget.value)}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Buyer Contact"
                      placeholder="Phone or email"
                      value={buyerContact}
                      onChange={(e) => setBuyerContact(e.currentTarget.value)}
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter="md" align="end">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Medicine"
                      placeholder="Select medicine"
                      data={medicineOptions}
                      value={selectedMedicineId ? String(selectedMedicineId) : null}
                      onChange={(v) => handleSelectMedicineChange(v)}
                      searchable
                    />
                  </Grid.Col>



                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <NumberInput
                      label="Qty"
                      min={1}
                      max={selectedMedicine ? Number(selectedMedicine.stock ?? 0) : undefined}
                      value={quantity}
                      onChange={(v: any) => {
                        const attempted = Number(v || 0);
                        const max = selectedMedicine ? Number(selectedMedicine.stock ?? Infinity) : Infinity;
                        const clamped = Math.max(1, Math.min(attempted, max));
                        if (attempted !== clamped) console.warn('[Sales] quantity clamped from', attempted, 'to', clamped);
                        setQuantity(clamped);
                      }}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 2 }}>
                    <Text size="sm" mt={30} ta="center" c="dimmed">
                      {selectedMedicine
                        ? `${Number(selectedMedicine.unitPrice || 0).toLocaleString()} VND`
                        : '-'}
                    </Text>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 1 }}>
                    <Button
                      leftSection={<IconPlus size={14} />}
                      onClick={handleAddItem}
                      color="primary.4"
                      fullWidth
                      size="xs"
                      styles={() => ({ root: { padding: '6px 8px' } })}
                    >
                      Add
                    </Button>
                  </Grid.Col>
                </Grid>

                <Suspense fallback={<div />}>
                  <DataTable
                    value={saleItems}
                    dataKey="id"
                    size="small"
                    stripedRows
                    emptyMessage="No sale items added yet."
                  >
                    <Column field="medicineName" header="Medicine" />
                    {/* Batch column removed as requested */}
                    <Column field="quantity" header="Qty" />
                    <Column
                      header="Unit (VND)"
                      body={(row: SaleItemRow) => Number(row.unitPrice || 0).toLocaleString()}
                      style={{ width: '14%', textAlign: 'center' }}
                    />
                    <Column
                      field="lineTotal"
                      header="Line Total"
                      body={(row: SaleItemRow) => Number(row.lineTotal || 0).toLocaleString()}
                    />
                    <Column
                      header=""
                      body={itemActionBody}
                      style={{ width: '4rem', textAlign: 'center' }}
                    />
                  </DataTable>
                </Suspense>

                {/* Batch assignment UI removed */}

                <Group justify="flex-end">
                  <Text fw={700}>Total of all: {total.toLocaleString()} VND</Text>
                </Group>
              </Stack>
            </Paper>

            <Group justify="flex-end">
              <Button
                variant="light"
                color="neutral.5"
                onClick={handleCloseForm}
                leftSection={<IconX size={16} />}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrUpdateSale}
                loading={loading}
                color="primary.4"
                leftSection={<IconDeviceFloppy size={16} />}
              >
                Create Sale
              </Button>
            </Group>
          </Stack>
        </Box>
      )}

      <Modal
        opened={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewSale(null);
        }}
        title={
          // avoid nested heading tags: Modal wraps title in an h2, so render a non-heading element
          <Text fw={700} ff="Merriweather, serif" c="primary.6">
            Sale Detail {viewSale?.id ? `#${viewSale.id}` : ''}
          </Text>
        }
        size="lg"
        centered
        radius="md"
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Text>
              <b>Date:</b> {formatDateWithTime(viewSale?.saleDate || viewSale?.addedDate || viewSale?.createdAt) || '-'}
            </Text>
            <Text>
              <b>Total:</b>{' '}
              {Number(viewSale?.totalAmount || viewSale?.total || viewSale?.amount || 0).toLocaleString()} VND
            </Text>
          </Group>

          <Suspense fallback={<div />}>
            <DataTable
              value={detailItems}
              dataKey="id"
              size="small"
              stripedRows
              emptyMessage="No detail items found."
            >
              <Column field="medicineName" header="Medicine" />
              <Column field="quantity" header="Qty" />
              <Column
                field="unitPrice"
                header="Unit Price"
                body={(row: SaleItemRow) => Number(row.unitPrice || 0).toLocaleString()}
              />
              <Column
                field="lineTotal"
                header="Line Total"
                body={(row: SaleItemRow) => Number(row.lineTotal || 0).toLocaleString()}
              />
            </DataTable>
          </Suspense>
        </Stack>
      </Modal>

      <Modal
        opened={presModalOpen}
        onClose={() => setPresModalOpen(false)}
        title={<Text fw={700} ff="Merriweather, serif" c="primary.6">Import Prescription</Text>}
        size="lg"
        centered
        radius="md"
      >
        <Stack gap="sm">
          {prescriptions.length === 0 ? (
            <Text c="dimmed">No prescriptions found.</Text>
          ) : (
            <Suspense fallback={<div />}>
              <DataTable
                value={prescriptions}
                dataKey="id"
                size="small"
                stripedRows
                paginator
                rows={10}
                loading={presLoading}
                emptyMessage="No prescriptions found."
                filterDisplay="menu"
                globalFilterFields={['id', 'patientName', 'doctorName']}
              >
                <Column field="id" header="#" style={{ width: '10%' }} sortable />
                <Column field="patientName" header="Patient" sortable filter filterPlaceholder="Search by patient" />
                <Column field="doctorName" header="Doctor" sortable filter filterPlaceholder="Search by doctor" />
                <Column
                  field="prescriptionDate"
                  header="Date"
                  sortable
                  body={(r: any) => formatDateWithTime(r.prescriptionDate || r.appointmentDate || r.createdAt)}
                />
                <Column header="" body={(row: any) => (
                  <Button size="xs" onClick={() => handleImportPrescription(row)} loading={importingPres}>
                    Import
                  </Button>
                )} style={{ width: '8rem', textAlign: 'center' }} />
              </DataTable>
            </Suspense>
          )}
        </Stack>
      </Modal>
    </div>
  );
};

export default Sales;