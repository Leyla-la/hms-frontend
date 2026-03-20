// ==========================================
// MEDICAL DATASETS (EXTENSIVE VERSION)
// ==========================================

// 1. SYMPTOMS (Triệu chứng lâm sàng - Sắp xếp Alphabet)
export const symptomsData = [
    { value: 'ABDOMINAL_PAIN', label: 'Abdominal Pain' },
    { value: 'AMENORRHEA', label: 'Amenorrhea' },
    { value: 'AMNESIA', label: 'Amnesia' },
    { value: 'ANGINA', label: 'Angina' },
    { value: 'ANOSMIA', label: 'Anosmia (Loss of smell)' },
    { value: 'ANURIA', label: 'Anuria' },
    { value: 'ANXIETY', label: 'Anxiety' },
    { value: 'APHASIA', label: 'Aphasia' },
    { value: 'ARRHYTHMIA', label: 'Arrhythmia' },
    { value: 'ARTHRALGIA', label: 'Arthralgia (Joint Pain)' },
    { value: 'ASCITES', label: 'Ascites' },
    { value: 'ASTHENIA', label: 'Asthenia (Weakness)' },
    { value: 'BACK_PAIN', label: 'Back Pain' },
    { value: 'BRADYCARDIA', label: 'Bradycardia' },
    { value: 'CHEST_PAIN', label: 'Chest Pain' },
    { value: 'CHILLS', label: 'Chills' },
    { value: 'CLAUDICATION', label: 'Claudication' },
    { value: 'CONFUSION', label: 'Confusion' },
    { value: 'CONSTIPATION', label: 'Constipation' },
    { value: 'COUGH_DRY', label: 'Cough (Dry)' },
    { value: 'COUGH_PRODUCTIVE', label: 'Cough (Productive)' },
    { value: 'CYANOSIS', label: 'Cyanosis' },
    { value: 'DIARRHEA', label: 'Diarrhea' },
    { value: 'DIZZINESS', label: 'Dizziness' },
    { value: 'DYSARTHRIA', label: 'Dysarthria' },
    { value: 'DYSPHAGIA', label: 'Dysphagia (Difficulty Swallowing)' },
    { value: 'DYSPNEA', label: 'Dyspnea (Shortness of Breath)' },
    { value: 'DYSURIA', label: 'Dysuria (Painful Urination)' },
    { value: 'EDEMA', label: 'Edema' },
    { value: 'EPISTAXIS', label: 'Epistaxis (Nosebleed)' },
    { value: 'FATIGUE', label: 'Fatigue' },
    { value: 'FEVER', label: 'Fever' },
    { value: 'FLATULENCE', label: 'Flatulence' },
    { value: 'HALITOSIS', label: 'Halitosis' },
    { value: 'HEADACHE', label: 'Headache' },
    { value: 'HEMATEMESIS', label: 'Hematemesis (Vomiting Blood)' },
    { value: 'HEMATURIA', label: 'Hematuria (Blood in Urine)' },
    { value: 'HEMOPTYSIS', label: 'Hemoptysis (Coughing Blood)' },
    { value: 'HYPERTENSION', label: 'Hypertension' },
    { value: 'HYPOTENSION', label: 'Hypotension' },
    { value: 'INSOMNIA', label: 'Insomnia' },
    { value: 'JAUNDICE', label: 'Jaundice' },
    { value: 'LETHARGY', label: 'Lethargy' },
    { value: 'MELENA', label: 'Melena' },
    { value: 'MYALGIA', label: 'Myalgia (Muscle Pain)' },
    { value: 'NAUSEA', label: 'Nausea' },
    { value: 'NEURALGIA', label: 'Neuralgia' },
    { value: 'NYCTURIA', label: 'Nycturia' },
    { value: 'OLIGURIA', label: 'Oliguria' },
    { value: 'ORTHOPNEA', label: 'Orthopnea' },
    { value: 'PALPITATIONS', label: 'Palpitations' },
    { value: 'PARESTHESIA', label: 'Paresthesia (Numbness/Tingling)' },
    { value: 'PHOTOPHOBIA', label: 'Photophobia' },
    { value: 'POLYURIA', label: 'Polyuria' },
    { value: 'PRURITUS', label: 'Pruritus (Itching)' },
    { value: 'RASH', label: 'Rash' },
    { value: 'RHINORRHEA', label: 'Rhinorrhea (Runny Nose)' },
    { value: 'SYNCOPE', label: 'Syncope (Fainting)' },
    { value: 'TACHYCARDIA', label: 'Tachycardia' },
    { value: 'TINNITUS', label: 'Tinnitus (Ringing in Ears)' },
    { value: 'TREMOR', label: 'Tremor' },
    { value: 'VERTIGO', label: 'Vertigo' },
    { value: 'VOMITING', label: 'Vomiting' },
    { value: 'WEIGHT_LOSS', label: 'Weight Loss (Unintentional)' }
];

export const symptomMap: Record<string, string> = symptomsData.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

// 2. DIAGNOSTIC TESTS (Cận lâm sàng & Xét nghiệm - Sắp xếp Alphabet)
export const diagnosticTestsData = [
    { value: 'ABG', label: 'Arterial Blood Gas (ABG)' },
    { value: 'ALBUMIN', label: 'Albumin Test' },
    { value: 'ALLERGY_PANEL', label: 'Allergy Blood Panel' },
    { value: 'AMYLASE', label: 'Amylase Test' },
    { value: 'ANA', label: 'Antinuclear Antibody (ANA)' },
    { value: 'B12_FOLATE', label: 'Vitamin B12 & Folate' },
    { value: 'BIOPSY', label: 'Tissue Biopsy' },
    { value: 'BLOOD_CULTURE', label: 'Blood Culture' },
    { value: 'BMP', label: 'Basic Metabolic Panel (BMP)' },
    { value: 'BNP', label: 'B-Type Natriuretic Peptide (BNP)' },
    { value: 'BONE_DENSITY', label: 'Bone Density Scan (DEXA)' },
    { value: 'BONE_MARROW', label: 'Bone Marrow Aspiration' },
    { value: 'BRONCHOSCOPY', label: 'Bronchoscopy' },
    { value: 'BUN', label: 'Blood Urea Nitrogen (BUN)' },
    { value: 'CALCIUM', label: 'Calcium Level Test' },
    { value: 'CBC', label: 'Complete Blood Count (CBC)' },
    { value: 'CMP', label: 'Comprehensive Metabolic Panel (CMP)' },
    { value: 'COLONOSCOPY', label: 'Colonoscopy' },
    { value: 'CREATININE', label: 'Creatinine Test' },
    { value: 'CRP', label: 'C-Reactive Protein (CRP)' },
    { value: 'CT_ABDOMEN', label: 'CT Scan: Abdomen/Pelvis' },
    { value: 'CT_BRAIN', label: 'CT Scan: Brain/Head' },
    { value: 'CT_CHEST', label: 'CT Scan: Chest' },
    { value: 'D_DIMER', label: 'D-Dimer Test' },
    { value: 'ECG', label: 'Electrocardiogram (ECG/EKG)' },
    { value: 'ECHO', label: 'Echocardiogram' },
    { value: 'EEG', label: 'Electroencephalogram (EEG)' },
    { value: 'EMG', label: 'Electromyography (EMG)' },
    { value: 'ENDOSCOPY', label: 'Upper GI Endoscopy' },
    { value: 'ESR', label: 'Erythrocyte Sedimentation Rate (ESR)' },
    { value: 'FASTING_GLUCOSE', label: 'Fasting Blood Glucose' },
    { value: 'FERRITIN', label: 'Ferritin Level' },
    { value: 'HBA1C', label: 'Hemoglobin A1c (HbA1c)' },
    { value: 'HEPATITIS_PANEL', label: 'Hepatitis Panel' },
    { value: 'LIPASE', label: 'Lipase Test' },
    { value: 'LIPID_PANEL', label: 'Lipid Panel (Cholesterol)' },
    { value: 'LIVER_PANEL', label: 'Liver Function Panel (LFT)' },
    { value: 'LUMBAR_PUNCTURE', label: 'Lumbar Puncture (Spinal Tap)' },
    { value: 'MAGNESIUM', label: 'Magnesium Level' },
    { value: 'MAMMOGRAM', label: 'Mammogram' },
    { value: 'MRI_BRAIN', label: 'MRI: Brain' },
    { value: 'MRI_SPINE', label: 'MRI: Spine' },
    { value: 'PAP_SMEAR', label: 'Pap Smear' },
    { value: 'POTASSIUM', label: 'Potassium Level' },
    { value: 'PSA', label: 'Prostate-Specific Antigen (PSA)' },
    { value: 'PT_INR', label: 'Prothrombin Time (PT/INR)' },
    { value: 'PULMONARY_FUNC', label: 'Pulmonary Function Test (PFT)' },
    { value: 'RENAL_PANEL', label: 'Renal Function Panel' },
    { value: 'SPIROMETRY', label: 'Spirometry' },
    { value: 'STOOL_CULTURE', label: 'Stool Culture' },
    { value: 'TESTOSTERONE', label: 'Testosterone Level' },
    { value: 'THYROID_PANEL', label: 'Thyroid Function Test (TSH/T3/T4)' },
    { value: 'TROPONIN', label: 'Troponin Test' },
    { value: 'URIC_ACID', label: 'Uric Acid Level' },
    { value: 'URINALYSIS', label: 'Urinalysis' },
    { value: 'URINE_CULTURE', label: 'Urine Culture' },
    { value: 'VITAMIN_D', label: 'Vitamin D, 25-Hydroxy' },
    { value: 'XRAY_CHEST', label: 'X-Ray: Chest' },
    { value: 'XRAY_SPINE', label: 'X-Ray: Spine' }
];

export const diagnosticTestMap: Record<string, string> = diagnosticTestsData.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

// 3. MEDICATION FREQUENCIES (Tần suất - Không viết tắt, giải nghĩa đầy đủ Latin)
export const medicationFrequencies = [
    { value: 'QD', label: 'Once a day (QD)' },
    { value: 'BID', label: 'Twice a day (BID)' },
    { value: 'TID', label: 'Three times a day (TID)' },
    { value: 'QID', label: 'Four times a day (QID)' },
    { value: 'QHS', label: 'Every night at bedtime (QHS)' },
    { value: 'QAM', label: 'Every morning (QAM)' },
    { value: 'QOD', label: 'Every other day (QOD)' },
    { value: 'PRN', label: 'As needed (PRN)' },
    { value: 'STAT', label: 'Immediately (STAT)' },
    { value: 'Q4H', label: 'Every 4 hours (Q4H)' },
    { value: 'Q6H', label: 'Every 6 hours (Q6H)' },
    { value: 'Q8H', label: 'Every 8 hours (Q8H)' },
    { value: 'Q12H', label: 'Every 12 hours (Q12H)' },
    { value: 'AC', label: 'Before meals (AC)' },
    { value: 'PC', label: 'After meals (PC)' },
    { value: 'WEEKLY', label: 'Once a week' },
    { value: 'MONTHLY', label: 'Once a month' }
];

export const frequencyMap: Record<string, string> = medicationFrequencies.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

// 4. MEDICATION ROUTES (Đường dùng thuốc - Đầy đủ)
export const medicationRoutes = [
    { value: 'ORAL', label: 'Oral (PO)' },
    { value: 'IV', label: 'Intravenous (IV)' },
    { value: 'IM', label: 'Intramuscular (IM)' },
    { value: 'SC', label: 'Subcutaneous (SQ/SC)' },
    { value: 'ID', label: 'Intradermal (ID)' },
    { value: 'SUBLINGUAL', label: 'Sublingual (SL)' },
    { value: 'BUCCAL', label: 'Buccal' },
    { value: 'TOPICAL', label: 'Topical' },
    { value: 'TRANSDERMAL', label: 'Transdermal' },
    { value: 'INHALATION', label: 'Inhalation' },
    { value: 'NASAL', label: 'Nasal (Intranasal)' },
    { value: 'OPHTHALMIC', label: 'Ophthalmic (Eye)' },
    { value: 'OTIC', label: 'Otic (Ear)' },
    { value: 'RECTAL', label: 'Rectal' },
    { value: 'VAGINAL', label: 'Vaginal' },
    { value: 'INTRAARTICULAR', label: 'Intra-articular (Joint)' },
    { value: 'INTRATHECAL', label: 'Intrathecal (Spinal)' },
    { value: 'EPIDURAL', label: 'Epidural' }
];

export const routeMap: Record<string, string> = medicationRoutes.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

// 5. MEDICATION TYPES (Dạng bào chế)
export const medicationTypes = [
    { value: 'TABLET', label: 'Tablet' },
    { value: 'CAPSULE', label: 'Capsule' },
    { value: 'CAPLET', label: 'Caplet' },
    { value: 'SYRUP', label: 'Syrup' },
    { value: 'SUSPENSION', label: 'Suspension' },
    { value: 'SOLUTION', label: 'Solution' },
    { value: 'ELIXIR', label: 'Elixir' },
    { value: 'INJECTION', label: 'Injection / Ampoule' },
    { value: 'INFUSION', label: 'IV Infusion' },
    { value: 'CREAM', label: 'Cream' },
    { value: 'OINTMENT', label: 'Ointment' },
    { value: 'GEL', label: 'Gel' },
    { value: 'LOTION', label: 'Lotion' },
    { value: 'SUPPOSITORY', label: 'Suppository' },
    { value: 'ENEMA', label: 'Enema' },
    { value: 'INHALER', label: 'Inhaler (MDI)' },
    { value: 'NEBULIZER', label: 'Nebulizer Solution' },
    { value: 'DROPS', label: 'Drops' },
    { value: 'SPRAY', label: 'Spray' },
    { value: 'PATCH', label: 'Transdermal Patch' },
    { value: 'LOZENGE', label: 'Lozenge / Troche' },
    { value: 'POWDER', label: 'Powder' }
];

export const typeMap: Record<string, string> = medicationTypes.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {});

// ==========================================
// EXISTING / PROVIDED DATASETS
// ==========================================

export const bloodGroups = [
    { value: 'A_POSITIVE', label: 'A+' },
    { value: 'A_NEGATIVE', label: 'A-' },
    { value: 'B_POSITIVE', label: 'B+' },
    { value: 'B_NEGATIVE', label: 'B-' },
    { value: 'AB_POSITIVE', label: 'AB+' },
    { value: 'AB_NEGATIVE', label: 'AB-' },
    { value: 'O_POSITIVE', label: 'O+' },
    { value: 'O_NEGATIVE', label: 'O-' },
];

export const bloodGroupMap: Record<string, string> = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-',
};

export const doctorSpecializations = [
    "Allergy and Immunology", "Anesthesiology", "Cardiology", "Cardiothoracic Surgery", 
    "Dermatology", "Emergency Medicine", "Endocrinology", "Family Medicine", 
    "Gastroenterology", "General Surgery", "Geriatrics", "Hematology", 
    "Infectious Diseases", "Internal Medicine", "Nephrology", "Neurology", 
    "Neurosurgery", "Obstetrics and Gynecology", "Oncology", "Ophthalmology", 
    "Orthopedics", "Otolaryngology (ENT)", "Pathology", "Pediatrics", 
    "Physical Medicine and Rehabilitation", "Plastic Surgery", "Psychiatry", 
    "Pulmonology", "Radiology", "Rheumatology", "Urology", "Vascular Surgery"
].sort();

export const doctorDepartments = [
    "Cardiology", "Dermatology", "Emergency", "Endocrinology", "Gastroenterology", 
    "General Surgery", "Hematology", "Intensive Care Unit (ICU)", "Internal Medicine", 
    "Nephrology", "Neurology", "Obstetrics and Gynecology", "Oncology", 
    "Ophthalmology", "Orthopedics", "Otolaryngology (ENT)", "Pediatrics", 
    "Psychiatry", "Pulmonology", "Radiology", "Rheumatology", "Urology"
].sort();

export const appointmentReasons = [
    "Annual Physical Exam", "Chronic Condition Management", "Emergency Care", 
    "Follow-up", "General Consultation", "Health Screening", "Lab Test Results", 
    "Mental Health Support", "New Symptom Evaluation", "Physical Therapy", 
    "Post-Operative Check", "Prescription Refill", "Preventive Care", 
    "Specialist Referral", "Surgical Consultation", "Vaccination"
].sort();