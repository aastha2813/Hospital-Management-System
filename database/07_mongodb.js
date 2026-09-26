// Hospital Management System - MongoDB
// Database: hospital_management
// Collections: doctor_notes, iot_vitals

use hospital_management

// =====================================================
// doctor_notes
// =====================================================

db.createCollection("doctor_notes")

// Patient 1
db.doctor_notes.insertOne({
  patient_id: 1,
  doctor_id: 1,
  appointment_id: 1,
  note_date: new Date(),
  diagnosis: "Hypertension",
  symptoms: ["Headache", "Dizziness"],
  observations: "Blood pressure slightly elevated.",
  treatment_plan: "Monitor BP regularly and continue prescribed medication.",
  follow_up_required: true
})

// Patient 2
db.doctor_notes.insertOne({
  patient_id: 2,
  doctor_id: 1,
  appointment_id: 2,
  note_date: new Date(),
  diagnosis: "Migraine",
  symptoms: ["Severe headache", "Nausea", "Sensitivity to light"],
  observations: "Patient reports recurring headaches for the past two weeks.",
  treatment_plan: "Prescribed medication and advised adequate hydration and rest.",
  follow_up_required: true
})

// Patient 5
db.doctor_notes.insertOne({
  patient_id: 5,
  doctor_id: 3,
  appointment_id: 6,
  note_date: new Date(),
  diagnosis: "Knee Pain",
  symptoms: ["Joint pain", "Swelling", "Difficulty walking"],
  observations: "Mild swelling observed around the right knee.",
  treatment_plan: "Rest, physiotherapy and prescribed anti-inflammatory medication.",
  follow_up_required: true
})

// Patient 8
db.doctor_notes.insertOne({
  patient_id: 8,
  doctor_id: 6,
  appointment_id: 15,
  note_date: new Date(),
  diagnosis: "Chest Discomfort",
  symptoms: ["Chest discomfort", "Fatigue"],
  observations: "Patient is stable. ECG monitoring advised.",
  treatment_plan: "Continue cardiac observation and follow prescribed medication.",
  follow_up_required: true
})

// Patient 10
db.doctor_notes.insertOne({
  patient_id: 10,
  doctor_id: 3,
  appointment_id: 7,
  note_date: new Date(),
  diagnosis: "Back Pain",
  symptoms: ["Lower back pain", "Muscle stiffness"],
  observations: "Pain reported after prolonged physical activity.",
  treatment_plan: "Physiotherapy recommended along with regular stretching exercises.",
  follow_up_required: false
})

// Patient 14
db.doctor_notes.insertOne({
  patient_id: 14,
  doctor_id: 6,
  appointment_id: 16,
  note_date: new Date(),
  diagnosis: "Respiratory Infection",
  symptoms: ["Cough", "Fever", "Shortness of breath"],
  observations: "Mild respiratory distress observed during examination.",
  treatment_plan: "Medication prescribed and respiratory monitoring recommended.",
  follow_up_required: true
})

// Verify doctor notes
db.doctor_notes.find().pretty()


// =====================================================
// iot_vitals
// =====================================================

db.createCollection("iot_vitals")

// Patient 1 - Reading 1
db.iot_vitals.insertOne({
  patient_id: 1,
  recorded_at: new Date(),
  heart_rate: 82,
  spo2: 98,
  temperature: 98.6,
  blood_pressure: {
    systolic: 122,
    diastolic: 80
  },
  source: "Patient Monitoring Device"
})

// Patient 1 - Reading 2
db.iot_vitals.insertOne({
  patient_id: 1,
  recorded_at: new Date(),
  heart_rate: 79,
  spo2: 97,
  temperature: 98.4,
  blood_pressure: {
    systolic: 120,
    diastolic: 78
  },
  source: "Patient Monitoring Device"
})

// Patient 2 - Reading 1
db.iot_vitals.insertOne({
  patient_id: 2,
  recorded_at: new Date(),
  heart_rate: 88,
  spo2: 96,
  temperature: 99.1,
  blood_pressure: {
    systolic: 128,
    diastolic: 82
  },
  source: "Patient Monitoring Device"
})

// Patient 2 - Reading 2
db.iot_vitals.insertOne({
  patient_id: 2,
  recorded_at: new Date(),
  heart_rate: 84,
  spo2: 97,
  temperature: 98.7,
  blood_pressure: {
    systolic: 124,
    diastolic: 80
  },
  source: "Patient Monitoring Device"
})

// Patient 5 - Reading 1
db.iot_vitals.insertOne({
  patient_id: 5,
  recorded_at: new Date(),
  heart_rate: 92,
  spo2: 97,
  temperature: 98.9,
  blood_pressure: {
    systolic: 126,
    diastolic: 84
  },
  source: "Patient Monitoring Device"
})

// Patient 5 - Reading 2
db.iot_vitals.insertOne({
  patient_id: 5,
  recorded_at: new Date(),
  heart_rate: 89,
  spo2: 98,
  temperature: 98.5,
  blood_pressure: {
    systolic: 122,
    diastolic: 80
  },
  source: "Patient Monitoring Device"
})

// Patient 8
db.iot_vitals.insertOne({
  patient_id: 8,
  recorded_at: new Date(),
  heart_rate: 86,
  spo2: 95,
  temperature: 99.0,
  blood_pressure: {
    systolic: 130,
    diastolic: 85
  },
  source: "Patient Monitoring Device"
})

// Patient 14
db.iot_vitals.insertOne({
  patient_id: 14,
  recorded_at: new Date(),
  heart_rate: 94,
  spo2: 93,
  temperature: 100.2,
  blood_pressure: {
    systolic: 135,
    diastolic: 88
  },
  source: "Patient Monitoring Device"
})

// Verify IoT vitals
db.iot_vitals.find().pretty()