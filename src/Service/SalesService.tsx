import axiosInstance from "../Interceptor/AxiosInterceptor.tsx";
import { normalizeListResponse } from "../Utils/DataUtils.ts";

const addSale = async (SaleDTO: any) => {
    console.log('[SalesService] POST /pharmacy/sales/add request payload:', SaleDTO);
    return axiosInstance.post('/pharmacy/sales/add', SaleDTO)
        .then((response: any) => response.data);
};

const updateSale = async (SaleDTO: any) => {
    return axiosInstance.put('/pharmacy/sales/update', SaleDTO)
        .then((response: any) => response.data);
};

const getSaleById = async (id: any) => {
    return axiosInstance.get(`/pharmacy/sales/get/${id}`)
        .then((response: any) => response.data);
};

const getSaleItemsBySaleId = async (id: any) => {
    const res = await axiosInstance.get(`/pharmacy/sales/getSaleItems/${id}`);
    return normalizeListResponse(res.data);
};

const getAllSales = async (page = 0, size = 10) => {
    console.log(`[SalesService] GET /pharmacy/sales/getAll?page=${page}&size=${size}`);
    const res = await axiosInstance.get(`/pharmacy/sales/getAll?page=${page}&size=${size}`);
    return res.data;
};

export { 
    addSale, 
    updateSale, 
    getSaleById, 
    getSaleItemsBySaleId, 
    getAllSales 
};
