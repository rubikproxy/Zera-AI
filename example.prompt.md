# Zera AI: Emergency Escalation Example

This document demonstrates the clinical triage logic used by Zera AI to identify life-threatening postpartum complications and trigger the non-dismissible Emergency Alert system.

---

### 🏥 Scenario: Potential Postpartum Hemorrhage
**User Input:** *"I'm bleeding really heavily, soaking through a pad in about 40 minutes, and I feel very lightheaded and shaky."*

---

### 🧠 The Internal AI Prompt (Template)
The following is the high-stakes clinical logic processed by the **Neural Safety Layer**:

```text
════════════════════════════════════════════════════════════════════
EMERGENCY TRIAGE ENGINE — CLINICAL ASSESSMENT
════════════════════════════════════════════════════════════════════
You are Zera's Emergency Triage Engine. Your objective is to 
analyze reported symptoms and determine if they require 
IMMEDIATE medical intervention.

SYMPTOMS REPORTED: 
"I'm bleeding really heavily, soaking through a pad in about 40 minutes, and I feel very lightheaded and shaky."

PATIENT CONTEXT:
Patient ID: USR_9921
Timestamp: 2025-05-20T14:30:00Z

════════════════════════════════════════════════════════════════════
CLINICAL TRIGGER CRITERIA (EMERGENCY_NOW)
════════════════════════════════════════════════════════════════════
Flag as isEmergency: true if ANY of the following are present:
- HEAVY BLEEDING: Soaking ≥1 pad/hour or golf-ball sized clots.
- SHOCK/CIRCULATORY: Fainting, extreme dizziness, rapid/irregular pulse.
- RESPIRATORY: Chest pain, severe shortness of breath, gasping.
- PREECLAMPSIA (SEVERE): BP ≥160/110, or severe headache + vision changes.
- MENTAL HEALTH: Suicidal intent, plan to harm baby, hallucinations.

════════════════════════════════════════════════════════════════════
OUTPUT PROTOCOL
════════════════════════════════════════════════════════════════════
Return only a JSON object.
```

---

### 🚀 Expected AI Output (JSON)
The AI identifies the "Heavy Bleeding" and "Shock/Circulatory" triggers and returns the following structure:

```json
{
  "isEmergency": true,
  "escalationMessage": "⚠️ EMERGENCY ALERT: Your symptoms of heavy bleeding (soaking a pad in <1 hour) combined with dizziness suggest a serious postpartum complication like a hemorrhage. This requires immediate medical intervention."
}
```

---

### 🚨 UI/UX Response
1. **Chat UI**: Conversation is immediately paused.
2. **Emergency Dialog**: A high-contrast "Bold Black" alert modal appears.
3. **Action Step**: A prominent red button appears: **"🚀 CALL EMERGENCY SERVICES (911) NOW"**.

---
*Note: This is a research prototype for educational demonstration in Multimodal Deep Learning.*
