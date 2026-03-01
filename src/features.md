# AI Zera: Feature Specification & Progress Report

AI Zera is a high-tech "Digital Twin" monitoring system for postpartum maternal health, designed with a focus on local data residency and empathetic AI interaction.

## 🛠️ Core Features

### 1. Identity Node (Personalized Profile)
- **Local Enrollment**: Users initialize their health identity locally before starting the monitoring journey.
- **Data Residency**: All personal identifiers (Name, DOB, Phone, Email) are stored exclusively in the user's browser.
- **Friendly UX**: Replaced clinical jargon with supportive language (e.g., "How did you give birth?" and "Days since baby was born").

### 2. Conversational Health Monitoring Engine
- **Zera AI Persona**: A specialized AI assistant trained for the "Fourth Trimester" (first 6–12 weeks postpartum).
- **Multimodal Inference**: Analyzes natural language input to predict physiological metrics and emotional states.
- **Contextual Memory**: Maintains a local session history to provide personalized, follow-up-aware guidance.

### 3. Smart Daily Check-in Portal
- **Signal Logging**: Users record daily health signals including Sleep (hrs), Heart Rate (bpm), Steps, and Blood Pressure.
- **Mood Tracking**: Captures emotional status (Happy, Stressed, Tired, Sad) for sentiment analysis.
- **Temporal Logic**: Intelligent form that allows users to modify "Today's" data while automatically resetting for a fresh start at midnight.

### 4. Health Status Dashboard (Monitoring Cockpit)
- **Interactive Biometric Cards**: Real-time visualization of vital signs and activity targets.
- **Stress Prediction Module**: AI-driven sentiment analysis that classifies the user's current state as "Stress" or "No Stress."
- **Recovery Radar Chart**: A 4-axis matrix visualizing recovery scores (1-10) across Physical, Nutrition, Exercise, and Mental domains.
- **7-Day History Tracker**: A longitudinal trend chart visualizing recovery progress over the past week.

### 5. Advanced Security & Privacy
- **Federated Simulation**: Implements a "local node" architecture where sensitive data never leaves the user's device.
- **Local Persistence**: Robust use of `localStorage` for all chat logs, profiles, and health histories.
- **Safety Triage**: Deterministic safety layer that detects high-risk symptoms and triggers non-dismissible emergency alerts.

### 6. Professional "2070" UI/UX
- **Glassmorphism Aesthetic**: Modern, light-themed clinical design with translucent panels and cyan accents.
- **Fixed Sidebar Navigation**: A stable, non-scrolling sidebar ensuring constant access to Home, Chat, Check-in, Status, and Profile.
- **Responsive Layout**: Optimized for high-density information display on desktop and accessibility on mobile.

## 🚀 Recent Updates
- **Restored History Tracker**: Re-implemented the 7-day trend visualization in the Health Status portal.
- **Daily Persistence Logic**: Fixed the bug where profile data was lost on refresh; now fully synchronized with Local Node storage.
- **Hydration Fixes**: Resolved Next.js hydration mismatches caused by browser extensions injecting code into interactive elements.
- **Terminology Refinement**: Simplified all user-facing strings to be more empathetic and less clinical.

---
*Zera AI is a Research Prototype developed to explore Multimodal Deep Learning in maternal healthcare.*
