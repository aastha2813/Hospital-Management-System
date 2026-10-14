// =====================================================
// HOSPITAL MANAGEMENT SYSTEM - MONGODB SAMPLE DATA
// Database: hospital_management
// Collections: doctor_notes, iot_vitals
//
// Safe to rerun:
// - Creates collections only when they do not exist.
// - Uses stable sample_record_id values to avoid duplicate
//   sample documents on repeated executions.
// - Does not delete existing records.
// =====================================================

use hospital_management

// =====================================================
// Ensure collections exist
// =====================================================

if (!db.getCollectionNames().includes("doctor_notes")) {
  db.createCollection("doctor_notes")
}

if (!db.getCollectionNames().includes("iot_vitals")) {
  db.createCollection("iot_vitals")
}

// Unique keys make each sample record idempotent.
db.doctor_notes.createIndex(
  { sample_record_id: 1 },
  { unique: true, sparse: true }
)

db.iot_vitals.createIndex(
  { sample_record_id: 1 },
  { unique: true, sparse: true }
)

// =====================================================
// doctor_notes
// =====================================================

const doctorNotes = [
  {
    sample_record_id: "doctor-note-patient-1",
    patient_id: 1,
    doctor_id: 1,
    appointment_id: 1,
    note_date: new Date(),
    diagnosis: "Hypertension",
    symptoms: ["Headache", "Dizziness"],
    observations: "Blood pressure slightly elevated.",
    treatment_plan: "Monitor BP regularly and continue prescribed medication.",
    follow_up_required: true
  },
  {
    sample_record_id: "doctor-note-patient-2",
    patient_id: 2,
    doctor_id: 1,
    appointment_id: 2,
    note_date: new Date(),
    diagnosis: "Migraine",
    symptoms: ["Severe headache", "Nausea", "Sensitivity to light"],
    observations: "Patient reports recurring headaches for the past two weeks.",
    treatment_plan: "Prescribed medication and advised adequate hydration and rest.",
    follow_up_required: true
  },
  {
    sample_record_id: "doctor-note-patient-5",
    patient_id: 5,
    doctor_id: 3,
    appointment_id: 6,
    note_date: new Date(),
    diagnosis: "Knee Pain",
    symptoms: ["Joint pain", "Swelling", "Difficulty walking"],
    observations: "Mild swelling observed around the right knee.",
    treatment_plan: "Rest, physiotherapy and prescribed anti-inflammatory medication.",
    follow_up_required: true
  },
  {
    sample_record_id: "doctor-note-patient-8",
    patient_id: 8,
    doctor_id: 6,
    appointment_id: 15,
    note_date: new Date(),
    diagnosis: "Chest Discomfort",
    symptoms: ["Chest discomfort", "Fatigue"],
    observations: "Patient is stable. ECG monitoring advised.",
    treatment_plan: "Continue cardiac observation and follow prescribed medication.",
    follow_up_required: true
  },
  {
    sample_record_id: "doctor-note-patient-10",
    patient_id: 10,
    doctor_id: 3,
    appointment_id: 7,
    note_date: new Date(),
    diagnosis: "Back Pain",
    symptoms: ["Lower back pain", "Muscle stiffness"],
    observations: "Pain reported after prolonged physical activity.",
    treatment_plan: "Physiotherapy recommended along with regular stretching exercises.",
    follow_up_required: false
  },
  {
    sample_record_id: "doctor-note-patient-14",
    patient_id: 14,
    doctor_id: 6,
    appointment_id: 16,
    note_date: new Date(),
    diagnosis: "Respiratory Infection",
    symptoms: ["Cough", "Fever", "Shortness of breath"],
    observations: "Mild respiratory distress observed during examination.",
    treatment_plan: "Medication prescribed and respiratory monitoring recommended.",
    follow_up_required: true
  }
]

doctorNotes.forEach((note) => {
  db.doctor_notes.updateOne(
    { sample_record_id: note.sample_record_id },
    { $setOnInsert: note },
    { upsert: true }
  )
})

// =====================================================
// iot_vitals
// =====================================================

const iotVitals = [
  {
    sample_record_id: "iot-patient-1-reading-1",
    patient_id: 1,
    recorded_at: new Date(),
    heart_rate: 82,
    spo2: 98,
    temperature: 98.6,
    blood_pressure: { systolic: 122, diastolic: 80 },
    source: "Patient Monitoring Device"
  },
  {
    sample_record_id: "iot-patient-1-reading-2",
    patient_id: 1,
    recorded_at: new Date(),
    heart_rate: 79,
    spo2: 97,
    temperature: 98.4,
    blood_pressure: { systolic: 120, diastolic: 78 },
    source: "Patient Monitoring Device"
  },
  {
    sample_record_id: "iot-patient-2-reading-1",
    patient_id: 2,
    recorded_at: new Date(),
    heart_rate: 88,
    spo2: 96,
    temperature: 99.1,
    blood_pressure: { systolic: 128, diastolic: 82 },
    source: "Patient Monitoring Device"
  },
  {
    sample_record_id: "iot-patient-2-reading-2",
    patient_id: 2,
    recorded_at: new Date(),
    heart_rate: 84,
    spo2: 97,
    temperature: 98.7,
    blood_pressure: { systolic: 124, diastolic: 80 },
    source: "Patient Monitoring Device"
  },
  {
    sample_record_id: "iot-patient-5-reading-1",
    patient_id: 5,
    recorded_at: new Date(),
    heart_rate: 92,
    spo2: 97,
    temperature: 98.9,
    blood_pressure: { systolic: 126, diastolic: 84 },
    source: "Patient Monitoring Device"
  },
  {
    sample_record_id: "iot-patient-5-reading-2",
    patient_id: 5,
    recorded_at: new Date(),
    heart_rate: 89,
    spo2: 98,
    temperature: 98.5,
    blood_pressure: { systolic: 122, diastolic: 80 },
    source: "Patient Monitoring Device"
  },
  {
    sample_record_id: "iot-patient-8-reading-1",
    patient_id: 8,
    recorded_at: new Date(),
    heart_rate: 86,
    spo2: 95,
    temperature: 99.0,
    blood_pressure: { systolic: 130, diastolic: 85 },
    source: "Patient Monitoring Device"
  },
  {
    sample_record_id: "iot-patient-14-reading-1",
    patient_id: 14,
    recorded_at: new Date(),
    heart_rate: 94,
    spo2: 93,
    temperature: 100.2,
    blood_pressure: { systolic: 135, diastolic: 88 },
    source: "Patient Monitoring Device"
  }
]

iotVitals.forEach((vital) => {
  db.iot_vitals.updateOne(
    { sample_record_id: vital.sample_record_id },
    { $setOnInsert: vital },
    { upsert: true }
  )
})

// =====================================================
// Verify sample records
// =====================================================

print("doctor_notes sample records:")
printjson(db.doctor_notes.find(
  { sample_record_id: { $exists: true } },
  { _id: 0, sample_record_id: 1, patient_id: 1, diagnosis: 1 }
).toArray())

print("iot_vitals sample records:")
printjson(db.iot_vitals.find(
  { sample_record_id: { $exists: true } },
  { _id: 0, sample_record_id: 1, patient_id: 1, heart_rate: 1, spo2: 1 }
).toArray())