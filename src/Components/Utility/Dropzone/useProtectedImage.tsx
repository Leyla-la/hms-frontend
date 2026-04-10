import { useEffect, useState } from "react";
import axiosInstance from "../../../Interceptor/AxiosInterceptor.tsx";

const useProtectedImage = (imageId: string | null) => {
    const [imageUrl, setImageUrl] = useState<string | null>('/ssmr-avt.jpg'); 
    useEffect(() => {
        console.log('useProtectedImage: effect start', { imageId });
        if (!imageId) {
            console.log('useProtectedImage: no imageId, using fallback');
            setImageUrl('/ssmr-avt.jpg');
            return;
        }
        let objectUrl: string | null = null;
        const fetchImage = async () => {
            try {
                console.log('useProtectedImage: fetching /media/', imageId);
                const response = await axiosInstance.get(`/media/${imageId}`, { responseType: 'blob' });
                objectUrl = URL.createObjectURL(response.data);
                console.log('useProtectedImage: fetched blob, created object URL', objectUrl);
                setImageUrl(objectUrl);
            } catch (error) {
                console.error('useProtectedImage: Error fetching protected image:', error);
                setImageUrl('/ssmr-avt.jpg');
            }
        };
        fetchImage();
        return () => {
            console.log('useProtectedImage: cleanup for imageId', imageId);
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                console.log('useProtectedImage: revoked URL during cleanup');
            }
        };
    }, [imageId]);
    return imageUrl;
};

export default useProtectedImage;