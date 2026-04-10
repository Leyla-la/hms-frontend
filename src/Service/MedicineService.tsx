import axiosInstance from "../Interceptor/AxiosInterceptor.tsx";
import { normalizeListResponse } from "../Utils/DataUtils.ts";


const getAvailableMedicines = async () => {
    try {
        const [medsData, invRes] = await Promise.all([
            getMedicineList(),
            axiosInstance.get('/pharmacy/inventory/getAll?size=1000'),
        ]);

        console.log('[MedicineService] Raw medicines response (list):', medsData);
        console.log('[MedicineService] Raw inventory response:', invRes?.data);

        const meds = medsData;
        const invs = normalizeListResponse(invRes?.data);

        // compute total active stock per medicine from inventories
        const stockMap: Record<number, number> = {};
        const today = new Date().toISOString().slice(0,10);
        invs.forEach((inv: any) => {
            const status = (inv?.status || '').toString().toUpperCase();
            const expiry = inv?.expiryDate ? inv.expiryDate.slice(0,10) : null;
            const qty = Number(inv?.quantity || 0);
            if (qty > 0 && status === 'ACTIVE' && (!expiry || expiry > today)) {
                const mid = Number(inv.medicineId || inv.medicine?.id);
                if (!mid) return;
                stockMap[mid] = (stockMap[mid] || 0) + qty;
            }
        });

        console.log('[MedicineService] Computed stock map:', stockMap);

        // attach stock info: favor inventory total, fallback to medicine's own stock field
        const available = meds
            .map((m: any) => {
                const invStock = stockMap[Number(m.id)];
                return { 
                    ...m, 
                    stock: invStock !== undefined ? invStock : (Number(m.stock) || 0) 
                };
            })
            .filter((m: any) => Number(m.stock) >= 0); // Include 0 stock in total list, or filter > 0 if for Sales only. 
            // In Sales context (getAvailableMedicines), > 0 is usually preferred, but for Catalog view, >= 0.
            // Let's keep it > 0 for Sales logic, but the Doctor's Catalog uses getAllMedicines directly now.

        const filteredAvailable = available.filter((m: any) => Number(m.stock) > 0);
        console.log('[MedicineService] Available medicines computed:', filteredAvailable);
        return filteredAvailable;
    } catch (err) {
        console.error('[MedicineService] getAvailableMedicines error:', err);
        throw err;
    }
};

const addMedicine = async (medicineDTO: any) => {
    return axiosInstance.post('/pharmacy/medicines/add', medicineDTO)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error });
};

const updateMedicine = async (medicineDTO: any) => {
    return axiosInstance.put('/pharmacy/medicines/update', medicineDTO)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error });
};

const getMedicineById = async (id: any) => {
    return axiosInstance.get(`/pharmacy/medicines/get/${id}`)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error });
};

const getAllMedicines = async (page = 0, size = 10) => {
    const res = await axiosInstance.get(`/pharmacy/medicines/getAll?page=${page}&size=${size}`);
    return res.data;
};

const getAllInventories = async (page = 0, size = 10) => {
    const res = await axiosInstance.get(`/pharmacy/inventory/getAll?page=${page}&size=${size}`);
    return res.data;
};

const deleteMedicine = async (id: any) => {
    return axiosInstance.delete(`/pharmacy/medicines/delete/${id}`)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error });
};

const getMedicineList = async () => {
    const res = await axiosInstance.get('/pharmacy/medicines/getAll?size=1000');
    return normalizeListResponse(res.data);
};

export { 
    getAllMedicines,
    getMedicineList,
    getAvailableMedicines,
    getAllInventories,
    addMedicine, 
    updateMedicine, 
    getMedicineById, 
    deleteMedicine 
};