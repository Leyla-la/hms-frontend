import axiosInstance from "../Interceptor/AxiosInterceptor.tsx";
import { normalizeListResponse } from "../Utils/DataUtils.ts";

const getAllStocks = async (page = 0, size = 10) => {
    const res = await axiosInstance.get(`/pharmacy/inventory/getAll?page=${page}&size=${size}`);
    return res.data;
};

const addStock = async (medicineDTO: any) => {
    return axiosInstance.post('/pharmacy/inventory/add', medicineDTO)
        .then((response: any) => response.data);
};

const updateStock = async (medicineDTO: any) => {
    return axiosInstance.put('/pharmacy/inventory/update', medicineDTO)
        .then((response: any) => response.data);
};

const getStockById = async (id: any) => {
    return axiosInstance.get(`/pharmacy/inventory/get/${id}`)
        .then((response: any) => response.data);
};

const deleteStock = async (id: any) => {
    return axiosInstance.delete(`/pharmacy/inventory/delete/${id}`)
        .then((response: any) => response.data);
};

export { 
    getAllStocks, 
    addStock, 
    updateStock, 
    getStockById, 
    deleteStock 
};