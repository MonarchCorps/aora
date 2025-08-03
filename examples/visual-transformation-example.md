# 🔄 Automation API Integration - Visual Example

## Your Current Flow Data
```json
{
  "nodes": [
    {
      "id": "545af359-c868-4078-bdd7-123eef71697b",
      "type": "Trigger",
      "metadata": {
        "type": "Trigger",
        "triggerType": "appointment_scheduled"
      }
    },
    {
      "id": "42426ad1-8288-49d5-bf08-a56518a5d16e", 
      "type": "Condition",
      "metadata": {
        "type": "Condition",
        "condition": ["Category"],
        "category": ["Dental Clinic", "Hospital"]
      }
    },
    {
      "id": "06162edd-1205-4f7d-ab98-002786a6eb76",
      "type": "IF Match", 
      "metadata": {
        "type": "IF Match",
        "action": ["send_email", "send_sms"]
      }
    },
    {
      "id": "570c2a36-acd3-4a0c-bfd1-acc7c18d5d3f",
      "type": "Else Match",
      "metadata": {
        "type": "Else Match", 
        "action": ["send_reminder"]
      }
    }
  ],
  "edges": [
    // Connects Trigger → Condition → IF/Else Match
  ]
}
```

## ⬇️ TRANSFORMS TO ⬇️

## API Payload (What gets sent to your backend)
```json
{
  "name": "Welcome Email Automation",
  "description": "Sends welcome email to new patients based on category",
  "trigger_type": "appointment_scheduled",
  "start_date": "2024-01-15",
  "is_active": true,
  "settings": {
    "ui_config": {
      "theme": "light",
      "flow_data": {
        // Your original nodes and edges are preserved here
        // so you can reconstruct the visual flow later
      }
    },
    "display_options": {
      "show_timeline": true
    }
  },
  "actions": [
    {
      "name": "IF Match - send_email",
      "action_type": "send_email",
      "action_config": {},
      "execution_order": 1,
      "is_active": true,
      "conditions": [
        {
          "type": "category",
          "value": ["Dental Clinic", "Hospital"],
          "operator": "in"
        }
      ],
      "retry_config": {}
    },
    {
      "name": "IF Match - send_sms", 
      "action_type": "send_sms",
      "action_config": {},
      "execution_order": 2,
      "is_active": true,
      "conditions": [
        {
          "type": "category",
          "value": ["Dental Clinic", "Hospital"],
          "operator": "in"
        }
      ],
      "retry_config": {}
    },
    {
      "name": "Else Match - send_reminder",
      "action_type": "send_reminder", 
      "action_config": {},
      "execution_order": 3,
      "is_active": true,
      "conditions": [
        {
          "type": "category",
          "value": ["Dental Clinic", "Hospital"],
          "operator": "not_in"
        }
      ],
      "retry_config": {}
    }
  ]
}
```

## 🎯 How It Works

### 1. **Visual Flow** → **API Actions**
- Your `IF Match` node with `["send_email", "send_sms"]` becomes **2 separate API actions**
- Your `Else Match` node with `["send_reminder"]` becomes **1 API action**
- Each action gets the conditions from its parent `Condition` node

### 2. **Condition Logic**
- `IF Match` actions get conditions as-is: `category IN ["Dental Clinic", "Hospital"]`
- `Else Match` actions get **negated** conditions: `category NOT IN ["Dental Clinic", "Hospital"]`

### 3. **Execution Order**
- Actions are automatically numbered in sequence (1, 2, 3...)
- Your backend can execute them in this order

## 🔧 How to Use in Your Component

```typescript
// 1. Import the functions
import { transformFlowToAPI, transformAPIToFlow } from '../utils/automation-transform';
import { useSaveAutomation, useUpdateAutomation, useGetAutomation } from '../hooks/useAutomation';

// 2. In your component
export default function EditorCanvas() {
  const saveAutomation = useSaveAutomation();
  const { data: existingAutomation } = useGetAutomation(automationId);

  // 3. Save your flow
  const handleSave = async () => {
    const flowData = {
      nodes: state.editor.elements,
      edges: state.editor.edges
    };

    const apiPayload = transformFlowToAPI(flowData, {
      name: addAutomationForm.getValues().title,
      description: addAutomationForm.getValues().description,
      isActive: isActive
    });

    await saveAutomation.mutateAsync(apiPayload);
  };

  // 4. Load existing automation
  useEffect(() => {
    if (existingAutomation?.data) {
      const flowData = transformAPIToFlow(existingAutomation.data);
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          elements: flowData.nodes,
          edges: flowData.edges
        }
      });
    }
  }, [existingAutomation]);
}
```

## 🚀 What You Get

### ✅ **Save Functionality**
- Click save → Your visual flow becomes API format → Sent to backend
- Success toast notifications
- Automatic redirect to edit mode with new ID

### ✅ **Load Functionality** 
- Load existing automation → API data becomes visual flow → Displayed in editor
- Form fields auto-populated
- Visual nodes and connections restored

### ✅ **Update Functionality**
- Edit existing automation → Save updates existing record
- Preserves original flow data in `settings.ui_config.flow_data`

### ✅ **Test Functionality**
- Test button → Sends test request to backend
- Can include sample data for testing

## 🎨 Visual Flow Structure

```
┌─────────────┐
│   TRIGGER   │ ← appointment_scheduled
│             │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  CONDITION  │ ← Category in [Dental Clinic, Hospital]  
│             │
└──────┬──────┘
       │
    ┌──▼──┐
    │     │
    ▼     ▼
┌────────┐ ┌──────────┐
│IF Match│ │Else Match│
│        │ │          │  
│• Email │ │• Reminder│
│• SMS   │ │          │
└────────┘ └──────────┘
```

## 🔄 Becomes These API Actions

1. **Action 1**: Send Email (when category matches)
2. **Action 2**: Send SMS (when category matches) 
3. **Action 3**: Send Reminder (when category doesn't match)

## 🛠️ Next Steps

1. **Replace your existing EditorCanvas** with the new `EditorCanvasWithAPI.tsx`
2. **Update your API endpoint** in `hooks/useAutomation.ts` (change `API_BASE_URL`)
3. **Add authorization headers** if needed
4. **Test the save/load functionality**
5. **Customize the transformation logic** for your specific action types

The integration preserves your visual flow while making it API-ready! 🎉