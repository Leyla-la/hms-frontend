import axiosInstance from "../Interceptor/AxiosInterceptor.tsx";

const uploadMedia = async (mediaData: any) => {
    const formData = new FormData();
    formData.append('file', mediaData.file);
    return axiosInstance.post('/media/upload', formData)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error });
};

const getMedia = async (id: any) => {
    return axiosInstance.get(`/media/${id}`)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error });
};

export { uploadMedia, getMedia };

