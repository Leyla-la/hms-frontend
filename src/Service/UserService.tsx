import axiosInstance from "../Interceptor/AxiosInterceptor.tsx";

const registerUser = async(user: any) => {
    return axiosInstance.post('/users/register', user)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error    })
};

const loginUser = async(credentials: any) => {
    return axiosInstance.post('/users/login', credentials)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error;
    });
};

export { registerUser, loginUser };