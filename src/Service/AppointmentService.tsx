import axiosInstance from "../Interceptor/AxiosInterceptor.tsx";

const scheduleAppointment = async(data: any) => {
    const payload = {
        ...data,
        status: data?.status ?? 'SCHEDULED',
    };

    return axiosInstance.post('/appointments/schedule', payload)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error    })
};

const cancelAppointment = async(id: any) => {
    return axiosInstance.put('/appointments/cancel/' + id)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error;
    });
};

const getAppointment = async(id: any) => {
    return axiosInstance.get('/appointments/get/' + id)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error;
    });
}

const getAppointmentDetails = async(id: any) => {
    return axiosInstance.get('/appointments/get/details/' + id)
    .then((response: any) => response.data) 
    .catch((error: any) => {
        throw error;
    });
}

const getAppointmentsByPatient = async(patientId: any) => {
    return axiosInstance.get('/appointments/getAllByPatient/' + patientId)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error;
    });
};

const getAppointmentsByDoctor = async(doctorId: any) => {
    return axiosInstance.get('/appointments/getAllByDoctor/' + doctorId)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error;
    });
};

const createAppointmentRecord = async(data: any) => {
    return axiosInstance.post('/appointments/record/create', data)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error    })
};

const updateAppointmentRecord = async(data: any) => {
    return axiosInstance.put('/appointments/record/update', data)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error;
    });
};

const getAppointmentRecordByAppointmentId = async(appointmentId: any) => {
    return axiosInstance.get('/appointments/record/getByAppointmentId/' + appointmentId)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error;
    });
};

const isReportExists = async(appointmentId: any) => {
    return axiosInstance.get('/appointments/record/isRecordExists/' + appointmentId)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error;
    });
};

const getReportsByPatientId = async(patientId: any) => {
    return axiosInstance.get('/appointments/record/getRecordsByPatientId/' + patientId)
    .then((response: any) => response.data)
    .catch((error: any) => {
        throw error;
    });
};

const getPrescriptionsByPatientId = async(patientId: any) => {
    return axiosInstance.get('/appointments/record/getPrescriptionByPatientId/' + patientId)
    .then((response: any) => response.data)     
    .catch((error: any) => {
        throw error;
    });
};


export { scheduleAppointment, cancelAppointment, getAppointment, getAppointmentDetails, getAppointmentsByPatient, getAppointmentsByDoctor, createAppointmentRecord, updateAppointmentRecord, getAppointmentRecordByAppointmentId, isReportExists, getReportsByPatientId, getPrescriptionsByPatientId };