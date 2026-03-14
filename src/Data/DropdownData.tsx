const bloodGroups = [
    { value: 'A_POSITIVE', label: 'A+' },
    { value: 'A_NEGATIVE', label: 'A-' },
    { value: 'B_POSITIVE', label: 'B+' },
    { value: 'B_NEGATIVE', label: 'B-' },
    { value: 'AB_POSITIVE', label: 'AB+' },
    { value: 'AB_NEGATIVE', label: 'AB-' },
    { value: 'O_POSITIVE', label: 'O+' },
    { value: 'O_NEGATIVE', label: 'O-' },
];

const bloodGroupMap: Record<string, string> = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-',
};

const doctorSpecializations = ["Anesthesiology", "Cardiology", "Dermatology", "Emergency Medicine", "Endocrinology", "Gastroenterology", "General Surgery", "Geriatrics", "Hematology", "Infectious Diseases", "Internal Medicine", "Nephrology", "Neurology", "Obstetrics and Gynecology", "Oncology", "Ophthalmology", "Orthopedics", "Otolaryngology (ENT)", "Pediatrics", "Physical Medicine and Rehabilitation", "Psychiatry", "Pulmonology", "Radiology", "Rheumatology", "Urology"];
const doctorDepartments = ["Emergency", "Intensive Care Unit (ICU)", "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", "General Surgery", "Hematology", "Internal Medicine", "Nephrology", "Neurology", "Obstetrics and Gynecology", "Oncology", "Ophthalmology", "Orthopedics", "Otolaryngology (ENT)", "Pediatrics", "Psychiatry", "Pulmonology", "Radiology", "Rheumatology", "Urology"];

export { bloodGroups, bloodGroupMap, doctorSpecializations, doctorDepartments };