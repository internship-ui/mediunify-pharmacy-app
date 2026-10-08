// MediUnify Lab Master Data
// Source of Truth: Client Diagnostic & Pathology Master Excel (Popular Checkup & Curated Checkup Sheets)

export const LAB_CATEGORIES = [
  "Routine & Hematology",
  "Biochemistry & Diabetes",
  "Lipid & Cardiac Markers",
  "Liver Function",
  "Renal & Kidney Function",
  "Thyroid & Hormones",
  "Vitamins & Micronutrients",
  "Iron & Anemia",
  "Infectious & Serology",
  "Urine & Clinical Pathology",
  "Diagnostic & Imaging"
];

export const SAMPLE_CONTAINER_TYPES = [
  { type: "Blood (EDTA)", tube: "EDTA Tube (Purple / Lavender Top)", color: "#8B5CF6" },
  { type: "Blood (Fluoride)", tube: "Sodium Fluoride Tube (Grey Top)", color: "#64748B" },
  { type: "Blood (SST / Gel)", tube: "Serum Separator Tube / Gel (Yellow / Gold Top)", color: "#EAB308" },
  { type: "Blood (Plain / Clot)", tube: "Plain Clot Activator Tube (Red Top)", color: "#EF4444" },
  { type: "Blood (Sodium Citrate)", tube: "Sodium Citrate 3.2% Tube (Light Blue Top)", color: "#06B6D4" },
  { type: "Blood (Heparin)", tube: "Sodium / Lithium Heparin (Green Top)", color: "#10B981" },
  { type: "Urine", tube: "Sterile Urine Container (Yellow Cap 50ml)", color: "#F59E0B" },
  { type: "Stool", tube: "Sterile Stool Container with Spoon (30ml)", color: "#84CC16" },
  { type: "Diagnostic Trace", tube: "Electrocardiogram / Imaging Sensor", color: "#3B82F6" }
];

export const INITIAL_TESTS = [
  {
    id: "TEST-CBC",
    testCode: "HEM-001",
    testName: "Complete Blood Count (CBC) with ESR & Automated Differential",
    category: "Routine & Hematology",
    panelType: "Panel",
    sampleRequired: "Blood (EDTA)",
    tubeContainer: "EDTA Tube (Purple Top - 3ml)",
    preparation: "No fasting required. Avoid heavy physical exertion 2 hours prior to sample collection.",
    tat: "4-6 Hours",
    cpt: 150,
    suggestedMysuruPrice: 280,
    status: "Active",
    clinicalNotes: "Essential baseline test for anemia, infection, inflammation, leukemia, and thrombocytopenia.",
    includedParameters: [
      { name: "Hemoglobin (Hb)", range: "13.0 - 17.0 g/dL (Male) / 12.0 - 15.0 g/dL (Female)", unit: "g/dL" },
      { name: "Total Leucocyte Count (WBC)", range: "4,000 - 11,000", unit: "/cumm" },
      { name: "Red Blood Cell Count (RBC)", range: "4.5 - 5.5", unit: "mill/cumm" },
      { name: "Packed Cell Volume (PCV / Hematocrit)", range: "40 - 50", unit: "%" },
      { name: "Mean Corpuscular Volume (MCV)", range: "80 - 100", unit: "fL" },
      { name: "Mean Corpuscular Hemoglobin (MCH)", range: "27 - 32", unit: "pg" },
      { name: "Mean Corpuscular Hb Concentration (MCHC)", range: "32 - 36", unit: "g/dL" },
      { name: "Red Cell Distribution Width (RDW-CV)", range: "11.5 - 14.5", unit: "%" },
      { name: "Platelet Count", range: "150,000 - 450,000", unit: "/cumm" },
      { name: "Neutrophils", range: "40 - 75", unit: "%" },
      { name: "Lymphocytes", range: "20 - 45", unit: "%" },
      { name: "Monocytes", range: "2 - 10", unit: "%" },
      { name: "Eosinophils", range: "1 - 6", unit: "%" },
      { name: "Basophils", range: "0 - 1", unit: "%" },
      { name: "Absolute Neutrophil Count (ANC)", range: "2.0 - 7.0", unit: "10^3/uL" },
      { name: "Erythrocyte Sedimentation Rate (ESR)", range: "0 - 15 mm/1st hr", unit: "mm/hr" }
    ]
  },
  {
    id: "TEST-FBS",
    testCode: "BIO-001",
    testName: "Fasting Blood Sugar (Glucose Fasting)",
    category: "Biochemistry & Diabetes",
    panelType: "Individual",
    sampleRequired: "Blood (Fluoride)",
    tubeContainer: "Sodium Fluoride Tube (Grey Top - 2ml)",
    preparation: "8-10 hours strict overnight fasting required. Water is permitted.",
    tat: "3-4 Hours",
    cpt: 50,
    suggestedMysuruPrice: 90,
    status: "Active",
    clinicalNotes: "Evaluates baseline carbohydrate metabolism and screens for impaired fasting glucose / Diabetes Mellitus.",
    includedParameters: [
      { name: "Fasting Blood Glucose", range: "70 - 99 (Normal), 100 - 125 (Impaired), >= 126 (Diabetic)", unit: "mg/dL" }
    ]
  },
  {
    id: "TEST-PPBS",
    testCode: "BIO-002",
    testName: "Post Prandial Blood Sugar (PPBS)",
    category: "Biochemistry & Diabetes",
    panelType: "Individual",
    sampleRequired: "Blood (Fluoride)",
    tubeContainer: "Sodium Fluoride Tube (Grey Top - 2ml)",
    preparation: "Sample must be drawn exactly 2 hours after commencing a regular meal or 75g glucose load.",
    tat: "3-4 Hours",
    cpt: 50,
    suggestedMysuruPrice: 90,
    status: "Active",
    clinicalNotes: "Measures body's insulin response to carbohydrate consumption.",
    includedParameters: [
      { name: "Post Prandial Blood Glucose", range: "< 140 (Normal), 140 - 199 (Impaired), >= 200 (Diabetic)", unit: "mg/dL" }
    ]
  },
  {
    id: "TEST-HBA1C",
    testCode: "BIO-003",
    testName: "Glycosylated Hemoglobin (HbA1c) with Estimated Average Glucose (eAG)",
    category: "Biochemistry & Diabetes",
    panelType: "Panel",
    sampleRequired: "Blood (EDTA)",
    tubeContainer: "EDTA Tube (Purple Top - 3ml)",
    preparation: "No fasting required. Can be done at any time of day.",
    tat: "4-6 Hours",
    cpt: 200,
    suggestedMysuruPrice: 450,
    status: "Active",
    clinicalNotes: "Gold standard HPLC assay reflecting 3-month average glycemic control.",
    includedParameters: [
      { name: "HbA1c", range: "< 5.7% (Normal), 5.7 - 6.4% (Prediabetic), >= 6.5% (Diabetic)", unit: "%" },
      { name: "Estimated Average Glucose (eAG)", range: "90 - 120", unit: "mg/dL" }
    ]
  },
  {
    id: "TEST-LIPID",
    testCode: "CAR-001",
    testName: "Complete Lipid Profile (Total Cholesterol, Triglycerides, HDL, LDL, VLDL)",
    category: "Lipid & Cardiac Markers",
    panelType: "Panel",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "10-12 hours overnight fasting mandatory. Avoid alcohol and fatty meal 24 hours prior.",
    tat: "6-8 Hours",
    cpt: 300,
    suggestedMysuruPrice: 650,
    status: "Active",
    clinicalNotes: "Assesses atherogenic cardiovascular risk, dyslipidemia, and metabolic syndrome.",
    includedParameters: [
      { name: "Total Cholesterol", range: "< 200 (Desirable), 200 - 239 (Borderline), >= 240 (High)", unit: "mg/dL" },
      { name: "Triglycerides", range: "< 150 (Normal), 150 - 199 (Borderline), 200 - 499 (High)", unit: "mg/dL" },
      { name: "HDL Cholesterol (Good)", range: "> 50 (Optimal), 40 - 50 (Moderate), < 40 (Low)", unit: "mg/dL" },
      { name: "LDL Cholesterol (Bad)", range: "< 100 (Optimal), 100 - 129 (Near Optimal), 130 - 159 (Borderline)", unit: "mg/dL" },
      { name: "VLDL Cholesterol", range: "5 - 30", unit: "mg/dL" },
      { name: "Non-HDL Cholesterol", range: "< 130", unit: "mg/dL" },
      { name: "Total Cholesterol / HDL Ratio", range: "3.3 - 4.4 (Average Risk)", unit: "ratio" },
      { name: "LDL / HDL Ratio", range: "0.5 - 3.0", unit: "ratio" }
    ]
  },
  {
    id: "TEST-LFT",
    testCode: "LIV-001",
    testName: "Liver Function Test (LFT) Comprehensive",
    category: "Liver Function",
    panelType: "Panel",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "Overnight fasting of 8-10 hours preferred. Inform if on hepatotoxic or lipid-lowering medications.",
    tat: "6-8 Hours",
    cpt: 350,
    suggestedMysuruPrice: 750,
    status: "Active",
    clinicalNotes: "Assesses hepatic synthetic function, cholestasis, hepatocellular injury, and biliary tree health.",
    includedParameters: [
      { name: "Bilirubin Total", range: "0.2 - 1.2", unit: "mg/dL" },
      { name: "Bilirubin Direct (Conjugated)", range: "0.0 - 0.3", unit: "mg/dL" },
      { name: "Bilirubin Indirect (Unconjugated)", range: "0.2 - 0.9", unit: "mg/dL" },
      { name: "SGOT / AST (Aspartate Aminotransferase)", range: "10 - 40", unit: "U/L" },
      { name: "SGPT / ALT (Alanine Aminotransferase)", range: "10 - 45", unit: "U/L" },
      { name: "SGOT / SGPT Ratio", range: "0.8 - 1.5", unit: "ratio" },
      { name: "Alkaline Phosphatase (ALP)", range: "44 - 147", unit: "U/L" },
      { name: "Gamma GT (GGT)", range: "9 - 48", unit: "U/L" },
      { name: "Total Protein", range: "6.4 - 8.3", unit: "g/dL" },
      { name: "Serum Albumin", range: "3.5 - 5.2", unit: "g/dL" },
      { name: "Serum Globulin", range: "2.3 - 3.5", unit: "g/dL" },
      { name: "Albumin / Globulin (A/G) Ratio", range: "1.2 - 2.2", unit: "ratio" }
    ]
  },
  {
    id: "TEST-KFT",
    testCode: "REN-001",
    testName: "Kidney Function Test (KFT / RFT) with Serum Electrolytes",
    category: "Renal & Kidney Function",
    panelType: "Panel",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "No strict fasting required. Maintain normal hydration. Avoid heavy meat intake 12 hours prior.",
    tat: "6-8 Hours",
    cpt: 350,
    suggestedMysuruPrice: 750,
    status: "Active",
    clinicalNotes: "Evaluates glomerular filtration, renal clearance, nitrogenous waste elimination, and electrolyte balance.",
    includedParameters: [
      { name: "Blood Urea Nitrogen (BUN)", range: "7 - 20", unit: "mg/dL" },
      { name: "Blood Urea", range: "15 - 40", unit: "mg/dL" },
      { name: "Serum Creatinine", range: "0.7 - 1.3 (Male) / 0.6 - 1.1 (Female)", unit: "mg/dL" },
      { name: "eGFR (CKD-EPI)", range: "> 90", unit: "mL/min/1.73m2" },
      { name: "BUN / Creatinine Ratio", range: "10:1 - 20:1", unit: "ratio" },
      { name: "Serum Uric Acid", range: "3.5 - 7.2 (Male) / 2.6 - 6.0 (Female)", unit: "mg/dL" },
      { name: "Serum Calcium", range: "8.8 - 10.2", unit: "mg/dL" },
      { name: "Serum Phosphorus", range: "2.5 - 4.5", unit: "mg/dL" },
      { name: "Sodium (Na+)", range: "136 - 145", unit: "mmol/L" },
      { name: "Potassium (K+)", range: "3.5 - 5.1", unit: "mmol/L" },
      { name: "Chloride (Cl-)", range: "98 - 107", unit: "mmol/L" }
    ]
  },
  {
    id: "TEST-TFT",
    testCode: "THY-001",
    testName: "Thyroid Function Test (TFT) Total (T3, T4, TSH)",
    category: "Thyroid & Hormones",
    panelType: "Panel",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "Morning sample between 7:00 AM - 10:00 AM preferred. If taking thyroxine medications, draw sample before morning dose.",
    tat: "6-8 Hours",
    cpt: 250,
    suggestedMysuruPrice: 500,
    status: "Active",
    clinicalNotes: "Comprehensive screening for primary, secondary, and subclinical hypothyroidism / hyperthyroidism.",
    includedParameters: [
      { name: "Total Triiodothyronine (T3)", range: "0.80 - 2.00", unit: "ng/mL" },
      { name: "Total Thyroxine (T4)", range: "5.1 - 14.1", unit: "ug/dL" },
      { name: "Thyroid Stimulating Hormone (TSH Ultrasensitive)", range: "0.35 - 4.94", unit: "uIU/mL" }
    ]
  },
  {
    id: "TEST-URINE-RM",
    testCode: "URN-001",
    testName: "Urine Routine & Microscopic Examination (Complete Urinalysis)",
    category: "Urine & Clinical Pathology",
    panelType: "Panel",
    sampleRequired: "Urine",
    tubeContainer: "Sterile Urine Container (Yellow Cap 50ml)",
    preparation: "Clean-catch midstream early morning urine sample preferred. Wash genital area prior to voiding.",
    tat: "3-4 Hours",
    cpt: 80,
    suggestedMysuruPrice: 180,
    status: "Active",
    clinicalNotes: "Screens for renal parenchymal disease, UTI, proteinuria, hematuria, glucosuria, and crystal deposition.",
    includedParameters: [
      { name: "Colour & Appearance", range: "Pale Yellow, Clear", unit: "" },
      { name: "Specific Gravity", range: "1.005 - 1.030", unit: "" },
      { name: "pH", range: "5.0 - 7.5", unit: "" },
      { name: "Urine Protein (Albumin)", range: "Nil / Negative", unit: "" },
      { name: "Urine Glucose", range: "Nil / Negative", unit: "" },
      { name: "Ketone Bodies", range: "Negative", unit: "" },
      { name: "Bile Salts & Bile Pigments", range: "Negative", unit: "" },
      { name: "Urobilinogen", range: "Normal (0.1 - 1.0 EU/dL)", unit: "" },
      { name: "Nitrite", range: "Negative", unit: "" },
      { name: "Pus Cells (Leucocytes)", range: "0 - 5 / HPF", unit: "/HPF" },
      { name: "Red Blood Cells (RBCs)", range: "0 - 2 / HPF", unit: "/HPF" },
      { name: "Epithelial Cells", range: "Few / LPF", unit: "" },
      { name: "Casts", range: "Nil", unit: "" },
      { name: "Crystals (Calcium Oxalate/Urates)", range: "Nil", unit: "" },
      { name: "Bacteria / Yeasts", range: "Nil", unit: "" }
    ]
  },
  {
    id: "TEST-VIT-D",
    testCode: "VIT-001",
    testName: "Vitamin D – 25 Hydroxy (25-OH Cholecalciferol)",
    category: "Vitamins & Micronutrients",
    panelType: "Individual",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "No fasting required. Can be drawn anytime.",
    tat: "12-24 Hours",
    cpt: 600,
    suggestedMysuruPrice: 1200,
    status: "Active",
    clinicalNotes: "Essential for bone mineralization, calcium absorption, muscle function, and immunological competence.",
    includedParameters: [
      { name: "25-OH Vitamin D Total", range: "< 20 (Deficient), 20 - 30 (Insufficient), 30 - 100 (Sufficient)", unit: "ng/mL" }
    ]
  },
  {
    id: "TEST-VIT-B12",
    testCode: "VIT-002",
    testName: "Vitamin B12 (Cyanocobalamin)",
    category: "Vitamins & Micronutrients",
    panelType: "Individual",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "Overnight fasting of 8-10 hours preferred. Avoid B-complex supplements 48 hours prior.",
    tat: "12-24 Hours",
    cpt: 500,
    suggestedMysuruPrice: 1000,
    status: "Active",
    clinicalNotes: "Crucial for nerve myelin sheath integrity, erythropoiesis, DNA synthesis, and cognitive function.",
    includedParameters: [
      { name: "Vitamin B12", range: "< 200 (Deficient), 200 - 900 (Normal), > 900 (Elevated)", unit: "pg/mL" }
    ]
  },
  {
    id: "TEST-FERRITIN",
    testCode: "IRN-001",
    testName: "Serum Ferritin (Iron Storage Protein)",
    category: "Iron & Anemia",
    panelType: "Individual",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "Morning fasting sample preferred. Avoid oral iron supplements 24 hours prior.",
    tat: "8-12 Hours",
    cpt: 300,
    suggestedMysuruPrice: 650,
    status: "Active",
    clinicalNotes: "Most accurate biomarker for total cellular iron stores. Also functions as an acute phase reactant.",
    includedParameters: [
      { name: "Serum Ferritin", range: "30 - 400 (Male) / 15 - 150 (Female)", unit: "ng/mL" }
    ]
  },
  {
    id: "TEST-IRON-PROFILE",
    testCode: "IRN-002",
    testName: "Iron Profile Comprehensive (Serum Iron, TIBC, UIBC, % Transferrin Saturation)",
    category: "Iron & Anemia",
    panelType: "Panel",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "10-12 hours overnight fasting mandatory. Morning sample between 7:00 AM - 10:00 AM due to diurnal iron variation.",
    tat: "8-12 Hours",
    cpt: 400,
    suggestedMysuruPrice: 850,
    status: "Active",
    clinicalNotes: "Evaluates microcytic hypochromic anemias, iron deficiency, hemochromatosis, and iron transport capacity.",
    includedParameters: [
      { name: "Serum Iron", range: "65 - 175 (Male) / 50 - 170 (Female)", unit: "ug/dL" },
      { name: "Total Iron Binding Capacity (TIBC)", range: "250 - 450", unit: "ug/dL" },
      { name: "Unsaturated Iron Binding Capacity (UIBC)", range: "155 - 355", unit: "ug/dL" },
      { name: "Transferrin Saturation (% Sat)", range: "20 - 50", unit: "%" }
    ]
  },
  {
    id: "TEST-CALCIUM",
    testCode: "BIO-004",
    testName: "Serum Total Calcium & Corrected Calcium",
    category: "Biochemistry & Diabetes",
    panelType: "Individual",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "No strict fasting required. Avoid calcium supplements on the morning of test.",
    tat: "4-6 Hours",
    cpt: 100,
    suggestedMysuruPrice: 220,
    status: "Active",
    clinicalNotes: "Assesses parathyroid disorders, bone disease, renal osteodystrophy, and neuromuscular irritability.",
    includedParameters: [
      { name: "Serum Calcium Total", range: "8.6 - 10.2", unit: "mg/dL" }
    ]
  },
  {
    id: "TEST-MAGNESIUM",
    testCode: "BIO-005",
    testName: "Serum Magnesium",
    category: "Biochemistry & Diabetes",
    panelType: "Individual",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "Fasting sample preferred. Avoid antacids/laxatives containing magnesium 24 hours prior.",
    tat: "6-8 Hours",
    cpt: 150,
    suggestedMysuruPrice: 320,
    status: "Active",
    clinicalNotes: "Evaluates cardiac arrhythmia risk, chronic muscle cramps, hypokalemia refractoriness, and malabsorption.",
    includedParameters: [
      { name: "Serum Magnesium", range: "1.7 - 2.6", unit: "mg/dL" }
    ]
  },
  {
    id: "TEST-ECG-12",
    testCode: "DIA-001",
    testName: "12-Lead Electrocardiogram (ECG) with Computerized Analysis",
    category: "Diagnostic & Imaging",
    panelType: "Individual",
    sampleRequired: "Diagnostic Trace",
    tubeContainer: "12-Lead ECG Electrodes & Thermal Trace",
    preparation: "Rest comfortably 10 minutes prior to trace. Wear easily removable upper clothing. No heavy exercise.",
    tat: "1-2 Hours",
    cpt: 150,
    suggestedMysuruPrice: 350,
    status: "Active",
    clinicalNotes: "Detects cardiac arrhythmias, conduction blocks, myocardial ischemia, left ventricular hypertrophy, and infarction.",
    includedParameters: [
      { name: "Heart Rate", range: "60 - 100", unit: "bpm" },
      { name: "Rhythm & PR Interval", range: "Sinus Rhythm (0.12 - 0.20s)", unit: "sec" },
      { name: "QRS Duration", range: "0.06 - 0.10", unit: "sec" },
      { name: "QTc Interval", range: "< 440 (Male) / < 460 (Female)", unit: "ms" },
      { name: "Cardiologist Interpretation", range: "Normal 12-Lead Trace", unit: "" }
    ]
  },
  {
    id: "TEST-USG-ABD-PELVIS",
    testCode: "DIA-002",
    testName: "Ultrasound Abdomen & Pelvis (USG Complete)",
    category: "Diagnostic & Imaging",
    panelType: "Panel",
    sampleRequired: "Diagnostic Trace",
    tubeContainer: "High-Resolution Ultrasound Scan Protocol",
    preparation: "6-8 hours fasting for upper abdomen. Full urinary bladder required for pelvis (drink 4-5 glasses of water 1 hr prior; do not void).",
    tat: "2-4 Hours",
    cpt: 600,
    suggestedMysuruPrice: 1400,
    status: "Active",
    clinicalNotes: "Non-invasive sonographic examination of liver, gallbladder, pancreas, spleen, kidneys, urinary bladder, and pelvic organs.",
    includedParameters: [
      { name: "Liver Size & Echotexture", range: "Normal size (< 15cm), Normal parenchymal echogenicity", unit: "" },
      { name: "Gallbladder & CBD", range: "Thin walled, lumen clear, no calculi/sludge. CBD normal caliber.", unit: "" },
      { name: "Pancreas & Spleen", range: "Normal caliber and homogeneous texture.", unit: "" },
      { name: "Kidneys (Bilateral)", range: "Normal size, preserved Cortico-Medullary Differentiation, no hydronephrosis/calculi.", unit: "" },
      { name: "Urinary Bladder & Pelvic Organs", range: "Normal wall thickness, pre/post void normal. Normal prostate (male) / uterus & adnexa (female).", unit: "" }
    ]
  },
  {
    id: "TEST-HS-CRP",
    testCode: "CAR-002",
    testName: "High Sensitivity C-Reactive Protein (hs-CRP Quantitative)",
    category: "Lipid & Cardiac Markers",
    panelType: "Individual",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "No fasting required. Should not be performed during active systemic infection or fever.",
    tat: "4-6 Hours",
    cpt: 200,
    suggestedMysuruPrice: 450,
    status: "Active",
    clinicalNotes: "Sensitive inflammatory biomarker assessing baseline vascular endothelial inflammation and 10-year cardiac event risk.",
    includedParameters: [
      { name: "hs-CRP", range: "< 1.0 (Low Risk), 1.0 - 3.0 (Average Risk), > 3.0 (High Cardiovascular Risk)", unit: "mg/L" }
    ]
  },
  {
    id: "TEST-DENGUE-COMBO",
    testCode: "INF-001",
    testName: "Dengue Duo Combo (NS1 Antigen, IgM & IgG Antibodies)",
    category: "Infectious & Serology",
    panelType: "Panel",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "No fasting required. Stat processing available for emergency acute febrile cases.",
    tat: "3-4 Hours",
    cpt: 400,
    suggestedMysuruPrice: 850,
    status: "Active",
    clinicalNotes: "Rapid differential detection of primary vs secondary Dengue virus infection in acute fevers.",
    includedParameters: [
      { name: "Dengue NS1 Antigen (Day 1-5)", range: "Negative", unit: "" },
      { name: "Dengue IgM Antibodies (Day 4+)", range: "Negative", unit: "" },
      { name: "Dengue IgG Antibodies (Past / Secondary)", range: "Negative", unit: "" }
    ]
  },
  {
    id: "TEST-WIDAL",
    testCode: "INF-002",
    testName: "Widal Slide & Tube Agglutination Test (Typhoid Serology)",
    category: "Infectious & Serology",
    panelType: "Panel",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "No fasting required.",
    tat: "3-4 Hours",
    cpt: 120,
    suggestedMysuruPrice: 260,
    status: "Active",
    clinicalNotes: "Detects diagnostic titers of Salmonella enterica serovars Typhi (O & H) and Paratyphi (AH & BH).",
    includedParameters: [
      { name: "S. Typhi 'O' Titer", range: "< 1:80 (Negative)", unit: "titer" },
      { name: "S. Typhi 'H' Titer", range: "< 1:160 (Negative)", unit: "titer" },
      { name: "S. Paratyphi 'AH' Titer", range: "< 1:80 (Negative)", unit: "titer" },
      { name: "S. Paratyphi 'BH' Titer", range: "< 1:80 (Negative)", unit: "titer" }
    ]
  },
  {
    id: "TEST-IGE-TOTAL",
    testCode: "SER-001",
    testName: "Total Immunoglobulin E (Total IgE - Allergy Screening)",
    category: "Infectious & Serology",
    panelType: "Individual",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "No fasting required.",
    tat: "12-24 Hours",
    cpt: 450,
    suggestedMysuruPrice: 950,
    status: "Active",
    clinicalNotes: "Screens for atopic predisposition, allergic asthma, rhinitis, eczema, and parasitic infections.",
    includedParameters: [
      { name: "Total Serum IgE", range: "< 100 (Normal Non-Atopic)", unit: "IU/mL" }
    ]
  },
  {
    id: "TEST-TESTOSTERONE",
    testCode: "HOR-001",
    testName: "Testosterone Total (Chemiluminescent Immunoassay)",
    category: "Thyroid & Hormones",
    panelType: "Individual",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "Morning sample between 7:00 AM - 10:00 AM strictly required due to peak circadian secretion.",
    tat: "12-24 Hours",
    cpt: 350,
    suggestedMysuruPrice: 750,
    status: "Active",
    clinicalNotes: "Evaluates hypogonadism, libido loss, erectile dysfunction, infertility, hirsutism, and PCOS.",
    includedParameters: [
      { name: "Testosterone Total", range: "240 - 870 (Male) / 15 - 70 (Female)", unit: "ng/dL" }
    ]
  }
];

export const INITIAL_POPULAR_PACKAGES = [
  {
    id: "PKG-POP-EXE-01",
    packageCode: "POP-EXE-01",
    packageName: "Novus Executive Essentials",
    category: "Executive Health Checkup",
    suggestedMysuruPrice: 2999,
    referenceOriginalPrice: 5800,
    tat: "12-24 Hours",
    sampleRequired: "Blood (EDTA, Fluoride, SST), Urine, ECG & USG Protocol",
    preparation: "10-12 hours strict overnight fasting. Drink water for full bladder prior to USG. Rest 10 mins before ECG.",
    clinicalPricingNote: "Premier corporate & executive screening bundle. Covers 75+ clinical parameters spanning cardiovascular, hepatic, renal, glycemic, metabolic, and pelvic health.",
    status: "Active",
    isPopular: true,
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-HBA1C",
      "TEST-LIPID",
      "TEST-LFT",
      "TEST-KFT",
      "TEST-TFT",
      "TEST-URINE-RM",
      "TEST-ECG-12",
      "TEST-USG-ABD-PELVIS"
    ]
  },
  {
    id: "PKG-POP-BAS-01",
    packageCode: "POP-BAS-01",
    packageName: "Novus Essential Full Body Health",
    category: "Full Body Wellness",
    suggestedMysuruPrice: 1499,
    referenceOriginalPrice: 3200,
    tat: "8-12 Hours",
    sampleRequired: "Blood (EDTA, Fluoride, SST), Urine",
    preparation: "8-10 hours overnight fasting required. Clean-catch morning urine sample.",
    clinicalPricingNote: "Everyday preventive checkup for young professionals & families. Checks vital organs, blood counts, liver, kidneys, lipids, and sugar.",
    status: "Active",
    isPopular: true,
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-LIPID",
      "TEST-LFT",
      "TEST-KFT",
      "TEST-URINE-RM"
    ]
  },
  {
    id: "PKG-POP-SNR-01",
    packageCode: "POP-SNR-01",
    packageName: "Novus Senior Citizen Comprehensive",
    category: "Senior Citizen Care",
    suggestedMysuruPrice: 3499,
    referenceOriginalPrice: 6900,
    tat: "12-24 Hours",
    sampleRequired: "Blood (EDTA, Fluoride, SST), Urine, ECG",
    preparation: "10-12 hours fasting. Carry current medications list. Rest before ECG.",
    clinicalPricingNote: "Tailored for adults aged 55+. Includes comprehensive vitamins (D3, B12), bone calcium, cardiac trace, glycemic index, and kidney electrolyte monitoring.",
    status: "Active",
    isPopular: true,
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-HBA1C",
      "TEST-LIPID",
      "TEST-LFT",
      "TEST-KFT",
      "TEST-TFT",
      "TEST-URINE-RM",
      "TEST-VIT-D",
      "TEST-VIT-B12",
      "TEST-CALCIUM",
      "TEST-ECG-12"
    ]
  },
  {
    id: "PKG-POP-WMN-01",
    packageCode: "POP-WMN-01",
    packageName: "Novus Women's Comprehensive Wellness",
    category: "Women's Wellness",
    suggestedMysuruPrice: 3299,
    referenceOriginalPrice: 6400,
    tat: "12-24 Hours",
    sampleRequired: "Blood (EDTA, SST), Urine, USG Pelvis",
    preparation: "Overnight fasting 8-10h. Full bladder required for sonography. Morning thyroid sample.",
    clinicalPricingNote: "Holistic women's profile targeting iron store depletion, thyroid disorders, bone calcium, vitamin D & B12 deficiencies, and pelvic sonography.",
    status: "Active",
    isPopular: true,
    testIds: [
      "TEST-CBC",
      "TEST-TFT",
      "TEST-IRON-PROFILE",
      "TEST-FERRITIN",
      "TEST-CALCIUM",
      "TEST-VIT-D",
      "TEST-VIT-B12",
      "TEST-URINE-RM",
      "TEST-USG-ABD-PELVIS"
    ]
  },
  {
    id: "PKG-POP-DIA-01",
    packageCode: "POP-DIA-01",
    packageName: "Novus Diabetes Master Care & Organ Impact",
    category: "Diabetic Master Care",
    suggestedMysuruPrice: 1799,
    referenceOriginalPrice: 3600,
    tat: "8-12 Hours",
    sampleRequired: "Blood (EDTA, Fluoride, SST), Urine",
    preparation: "Fasting sample first (8-10h). Take regular breakfast/insulin and give PP sample exactly 2 hours after.",
    clinicalPricingNote: "Dedicated diabetes monitoring package measuring 3-month glycemic control (HbA1c), fasting & postprandial glucose, diabetic kidney risk (KFT), and atherogenic lipids.",
    status: "Active",
    isPopular: true,
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-PPBS",
      "TEST-HBA1C",
      "TEST-LIPID",
      "TEST-KFT",
      "TEST-URINE-RM"
    ]
  },
  {
    id: "PKG-POP-CRD-01",
    packageCode: "POP-CRD-01",
    packageName: "Novus Cardio-Metabolic Wellness",
    category: "Cardiac Wellness",
    suggestedMysuruPrice: 2199,
    referenceOriginalPrice: 4200,
    tat: "8-12 Hours",
    sampleRequired: "Blood (EDTA, Fluoride, SST), ECG",
    preparation: "10-12 hours strict fasting. Avoid heavy exercise 24h prior. Rest 10 mins before ECG.",
    clinicalPricingNote: "Designed for individuals with family history of cardiac disease or sedentary lifestyles. Includes high-sensitivity CRP inflammation marker, 12-lead ECG, lipids, and HbA1c.",
    status: "Active",
    isPopular: true,
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-HBA1C",
      "TEST-LIPID",
      "TEST-HS-CRP",
      "TEST-KFT",
      "TEST-ECG-12"
    ]
  }
];

export const INITIAL_CURATED_PACKAGES = [
  {
    id: "PKG-CUR-LSW-01",
    packageCode: "CUR-LSW-01",
    packageName: "Novus Vitamin & Nutrition Profile",
    category: "Lifestyle & Wellness",
    suggestedMysuruPrice: 2199,
    referenceOriginalPrice: 4220,
    tat: "12-24 Hours",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml x 2)",
    preparation: "8-10 hours overnight fasting preferred. Avoid vitamin/mineral supplements 48 hours prior.",
    clinicalPricingNote: "Targeted nutritional deficiency workup evaluating active D3, neuro-active B12, serum calcium, intracellular magnesium, ferritin stores, and transferrin iron.",
    status: "Active",
    isCurated: true,
    testIds: [
      "TEST-VIT-D",
      "TEST-VIT-B12",
      "TEST-CALCIUM",
      "TEST-MAGNESIUM",
      "TEST-FERRITIN",
      "TEST-IRON-PROFILE"
    ]
  },
  {
    id: "PKG-CUR-LSW-02",
    packageCode: "CUR-LSW-02",
    packageName: "Novus Hair Fall & Scalp Health Assessment",
    category: "Lifestyle & Wellness",
    suggestedMysuruPrice: 2499,
    referenceOriginalPrice: 4850,
    tat: "12-24 Hours",
    sampleRequired: "Blood (EDTA, SST)",
    tubeContainer: "EDTA (Purple Top) + SST (Yellow Top)",
    preparation: "Morning fasting sample preferred between 7:00 AM - 10:00 AM. Stop biotin supplements 72h prior.",
    clinicalPricingNote: "Evaluates the top biochemical triggers of telogen effluvium and diffuse alopecia: iron depletion (ferritin), thyroid imbalance, vitamin D3, B12, and systemic hemogram.",
    status: "Active",
    isCurated: true,
    testIds: [
      "TEST-CBC",
      "TEST-FERRITIN",
      "TEST-IRON-PROFILE",
      "TEST-TFT",
      "TEST-VIT-D",
      "TEST-VIT-B12"
    ]
  },
  {
    id: "PKG-CUR-ORG-01",
    packageCode: "CUR-ORG-01",
    packageName: "Novus Hepato-Renal Vitality Panel",
    category: "Organ Vitality",
    suggestedMysuruPrice: 1350,
    referenceOriginalPrice: 2800,
    tat: "6-8 Hours",
    sampleRequired: "Blood (SST / Gel), Urine",
    tubeContainer: "SST (Yellow Top) + Sterile Urine Container",
    preparation: "8-10 hours overnight fasting. Maintain hydration.",
    clinicalPricingNote: "Deep evaluation of major metabolic detoxifying organs: complete Liver Function (enzymes, proteins, bilirubin) and Kidney Function (urea, creatinine, uric acid, electrolytes, urine analysis).",
    status: "Active",
    isCurated: true,
    testIds: [
      "TEST-LFT",
      "TEST-KFT",
      "TEST-URINE-RM"
    ]
  },
  {
    id: "PKG-CUR-FEV-01",
    packageCode: "CUR-FEV-01",
    packageName: "Novus Acute Fever & Monsoon Panel",
    category: "Infectious & Serology",
    suggestedMysuruPrice: 1299,
    referenceOriginalPrice: 2600,
    tat: "3-4 Hours",
    sampleRequired: "Blood (EDTA, SST), Urine",
    tubeContainer: "EDTA (Purple Top) + SST (Yellow Top) + Urine Cup",
    preparation: "No fasting required. Urgent processing protocol.",
    clinicalPricingNote: "Stat acute fever panel covering Dengue NS1/IgM/IgG, Typhoid Widal agglutination, complete CBC with platelet count, and urine routine for acute febrile illness.",
    status: "Active",
    isCurated: true,
    testIds: [
      "TEST-CBC",
      "TEST-DENGUE-COMBO",
      "TEST-WIDAL",
      "TEST-URINE-RM"
    ]
  },
  {
    id: "PKG-CUR-IMM-01",
    packageCode: "CUR-IMM-01",
    packageName: "Novus Full Body Immunity & Allergy Screening",
    category: "Lifestyle & Wellness",
    suggestedMysuruPrice: 1999,
    referenceOriginalPrice: 3880,
    tat: "12-24 Hours",
    sampleRequired: "Blood (EDTA, SST)",
    tubeContainer: "EDTA (Purple Top) + SST (Yellow Top)",
    preparation: "No fasting required. Avoid anti-histamine medications 24 hours prior if allergy testing is planned.",
    clinicalPricingNote: "Assesses immunodeficiency vs hypersensitivity triggers: Total IgE, automated absolute eosinophil count, vitamin D3, ferritin, and full hematology.",
    status: "Active",
    isCurated: true,
    testIds: [
      "TEST-CBC",
      "TEST-IGE-TOTAL",
      "TEST-VIT-D",
      "TEST-FERRITIN"
    ]
  },
  {
    id: "PKG-CUR-IRN-01",
    packageCode: "CUR-IRN-01",
    packageName: "Novus Complete Anemia & Iron Stores Workup",
    category: "Iron & Anemia",
    suggestedMysuruPrice: 1599,
    referenceOriginalPrice: 3100,
    tat: "8-12 Hours",
    sampleRequired: "Blood (EDTA, SST)",
    tubeContainer: "EDTA (Purple Top) + SST (Yellow Top)",
    preparation: "10-12 hours overnight fasting. Morning sample. Avoid oral iron pills 24h prior.",
    clinicalPricingNote: "Differential diagnosis of microcytic hypochromic vs macrocytic nutritional anemias (CBC with red cell indices, serum iron, TIBC, transferrin saturation, ferritin, and B12).",
    status: "Active",
    isCurated: true,
    testIds: [
      "TEST-CBC",
      "TEST-IRON-PROFILE",
      "TEST-FERRITIN",
      "TEST-VIT-B12"
    ]
  }
];
