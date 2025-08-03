import { transformFlowToAPI, transformAPIToFlow } from '../utils/automation-transform';
import type { EditorNodeType } from '../libs/type';
import type { Edge } from 'reactflow';

// SAMPLE 1: Your existing flow data (from your original message)
const sampleFlowData = {
  nodes: [
    {
      id: "545af359-c868-4078-bdd7-123eef71697b",
      type: "Trigger" as const,
      position: { x: 17.77, y: 14.44 },
      data: {
        title: "Trigger",
        description: "Select the trigger that start the automation.",
        completed: false,
        current: true,
        metadata: {
          type: "Trigger" as const,
          triggerType: "appointment_scheduled"
        },
        type: "Trigger" as const
      }
    },
    {
      id: "42426ad1-8288-49d5-bf08-a56518a5d16e",
      type: "Condition" as const,
      position: { x: 17.77, y: 164.44 },
      data: {
        title: "Condition",
        description: "Select the condition that will be used to check the data.",
        completed: false,
        current: false,
        metadata: {
          type: "Condition" as const,
          condition: ["Category"],
          category: ["Dental Clinic", "Hospital"],
          dateTime: {},
          location: [],
          provider: [],
          service: [],
          appointmentStatus: []
        },
        type: "Condition" as const
      }
    },
    {
      id: "06162edd-1205-4f7d-ab98-002786a6eb76",
      type: "IF Match" as const,
      position: { x: -282.22, y: 314.44 },
      data: {
        title: "IF Match",
        description: "Select the action that will perform if the condition is met.",
        completed: false,
        current: false,
        metadata: {
          type: "IF Match" as const,
          action: ["send_email", "send_sms"]
        },
        type: "IF Match" as const
      }
    },
    {
      id: "570c2a36-acd3-4a0c-bfd1-acc7c18d5d3f",
      type: "Else Match" as const,
      position: { x: 317.77, y: 314.44 },
      data: {
        title: "Else Match",
        description: "Select the action that will perform if the condition is not met.",
        completed: false,
        current: false,
        metadata: {
          type: "Else Match" as const,
          action: ["send_reminder"]
        },
        type: "Else Match" as const
      }
    }
  ] as EditorNodeType[],
  edges: [
    {
      id: "reactflow__edge-545af359-c868-4078-bdd7-123eef71697b-42426ad1-8288-49d5-bf08-a56518a5d16e",
      source: "545af359-c868-4078-bdd7-123eef71697b",
      target: "42426ad1-8288-49d5-bf08-a56518a5d16e",
      type: "default"
    },
    {
      id: "reactflow__edge-42426ad1-8288-49d5-bf08-a56518a5d16e-06162edd-1205-4f7d-ab98-002786a6eb76",
      source: "42426ad1-8288-49d5-bf08-a56518a5d16e",
      target: "06162edd-1205-4f7d-ab98-002786a6eb76",
      type: "default"
    },
    {
      id: "reactflow__edge-42426ad1-8288-49d5-bf08-a56518a5d16e-570c2a36-acd3-4a0c-bfd1-acc7c18d5d3f",
      source: "42426ad1-8288-49d5-bf08-a56518a5d16e",
      target: "570c2a36-acd3-4a0c-bfd1-acc7c18d5d3f",
      type: "default"
    }
  ] as Edge[]
};

// DEMO FUNCTION: Transform flow to API
export function demoTransformFlowToAPI() {
  console.log("=== TRANSFORMING FLOW TO API ===");
  console.log("Original Flow Data:", JSON.stringify(sampleFlowData, null, 2));
  
  try {
    const apiPayload = transformFlowToAPI(sampleFlowData, {
      name: "Welcome Email Automation",
      description: "Sends welcome email to new patients based on category",
      isActive: true
    });
    
    console.log("\n=== TRANSFORMED API PAYLOAD ===");
    console.log(JSON.stringify(apiPayload, null, 2));
    
    return apiPayload;
  } catch (error) {
    console.error("Transformation error:", error);
    return null;
  }
}

// SAMPLE 2: What the API payload looks like
const sampleAPIResponse = {
  "name": "Welcome Email Automation",
  "description": "Sends welcome email to new patients based on category",
  "trigger_type": "appointment_scheduled",
  "start_date": "2024-01-15",
  "end_date": "2025-01-15",
  "is_active": true,
  "settings": {
    "ui_config": {
      "theme": "light",
      "flow_data": sampleFlowData
    },
    "display_options": {
      "show_timeline": true
    }
  },
  "actions": [
    {
      "name": "IF Match - send_email",
      "action_type": "send_email",
      "action_config": {
        "template": "welcome_email",
        "subject": "Welcome to our clinic!",
        "delay_minutes": 0
      },
      "execution_order": 1,
      "is_active": true,
      "conditions": [
        {
          "type": "category",
          "value": ["Dental Clinic", "Hospital"],
          "operator": "in"
        }
      ],
      "retry_config": {
        "max_retries": 3,
        "retry_delay": 300
      }
    },
    {
      "name": "IF Match - send_sms",
      "action_type": "send_sms",
      "action_config": {
        "message": "Welcome! Your appointment is confirmed.",
        "delay_minutes": 5
      },
      "execution_order": 2,
      "is_active": true,
      "conditions": [
        {
          "type": "category",
          "value": ["Dental Clinic", "Hospital"],
          "operator": "in"
        }
      ],
      "retry_config": {
        "max_retries": 2,
        "retry_delay": 180
      }
    },
    {
      "name": "Else Match - send_reminder",
      "action_type": "send_reminder",
      "action_config": {
        "reminder_type": "appointment_confirmation",
        "delay_hours": 24
      },
      "execution_order": 3,
      "is_active": true,
      "conditions": [
        {
          "type": "category",
          "value": ["Dental Clinic", "Hospital"],
          "operator": "not_in"
        }
      ],
      "retry_config": {
        "max_retries": 1,
        "retry_delay": 600
      }
    }
  ]
};

// DEMO FUNCTION: Transform API back to flow
export function demoTransformAPIToFlow() {
  console.log("\n=== TRANSFORMING API BACK TO FLOW ===");
  console.log("API Response:", JSON.stringify(sampleAPIResponse, null, 2));
  
  try {
    const flowData = transformAPIToFlow(sampleAPIResponse);
    
    console.log("\n=== RECONSTRUCTED FLOW DATA ===");
    console.log(JSON.stringify(flowData, null, 2));
    
    return flowData;
  } catch (error) {
    console.error("Reconstruction error:", error);
    return null;
  }
}

// DEMO FUNCTION: Show how to use the API hooks
export function demoAPIUsage() {
  console.log("\n=== HOW TO USE THE API HOOKS ===");
  
  const usageExample = `
// 1. SAVING A NEW AUTOMATION
const saveAutomation = useSaveAutomation();

const handleSave = async () => {
  try {
    const flowData = { nodes: editorNodes, edges: editorEdges };
    const apiPayload = transformFlowToAPI(flowData, {
      name: "My Automation",
      description: "Description here",
      isActive: true
    });
    
    const result = await saveAutomation.mutateAsync(apiPayload);
    console.log('Saved automation:', result.data);
  } catch (error) {
    console.error('Save failed:', error);
  }
};

// 2. LOADING AN EXISTING AUTOMATION
const { data: automation, isLoading } = useGetAutomation(automationId);

useEffect(() => {
  if (automation?.data) {
    const flowData = transformAPIToFlow(automation.data);
    // Load into your editor
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        elements: flowData.nodes,
        edges: flowData.edges
      }
    });
  }
}, [automation]);

// 3. UPDATING AN AUTOMATION
const updateAutomation = useUpdateAutomation();

const handleUpdate = async () => {
  const flowData = { nodes: editorNodes, edges: editorEdges };
  const apiPayload = transformFlowToAPI(flowData, {
    name: "Updated Automation",
    description: "Updated description",
    isActive: true
  });
  
  await updateAutomation.mutateAsync({
    id: automationId,
    automationData: apiPayload
  });
};

// 4. TESTING AN AUTOMATION
const testAutomation = useTestAutomation();

const handleTest = async () => {
  await testAutomation.mutateAsync({
    id: automationId,
    testData: { patientId: '123', appointmentType: 'dental' }
  });
};
  `;
  
  console.log(usageExample);
}

// DEMO FUNCTION: Show the complete flow
export function runCompleteDemo() {
  console.log("🚀 AUTOMATION API INTEGRATION DEMO 🚀\n");
  
  // Step 1: Transform your visual flow to API format
  const apiPayload = demoTransformFlowToAPI();
  
  // Step 2: Show what the API response might look like
  console.log("\n📡 This is what gets sent to your API:");
  console.log(JSON.stringify(apiPayload, null, 2));
  
  // Step 3: Show how to transform API data back to visual format
  demoTransformAPIToFlow();
  
  // Step 4: Show usage examples
  demoAPIUsage();
  
  // Step 5: Show the visual representation
  console.log("\n🎨 VISUAL FLOW STRUCTURE:");
  console.log(`
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
  `);
  
  console.log("\n✅ Demo completed! Check the console output above.");
}

// SAMPLE USAGE IN YOUR COMPONENT
export const componentIntegrationExample = `
// In your EditorCanvas component:

export default function EditorCanvas() {
  const saveAutomation = useSaveAutomation();
  const updateAutomation = useUpdateAutomation();
  const { data: existingAutomation } = useGetAutomation(automationId);
  
  // Save handler
  const handleSave = useCallback(async () => {
    const formData = addAutomationForm.getValues();
    const flowData = {
      nodes: state.editor.elements,
      edges: state.editor.edges
    };
    
    const apiPayload = transformFlowToAPI(flowData, {
      name: formData.title,
      description: formData.description,
      isActive: isActive
    });
    
    if (isEditMode) {
      await updateAutomation.mutateAsync({ id: automationId, automationData: apiPayload });
    } else {
      const result = await saveAutomation.mutateAsync(apiPayload);
      router.push(\`/automation/edit?id=\${result.data.id}\`);
    }
  }, [/* dependencies */]);
  
  // Load existing automation
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
  
  // Rest of your component...
}
`;

// Run the demo if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - you can call runCompleteDemo() from console
  (window as any).runAutomationDemo = runCompleteDemo;
  console.log("💡 Run 'runAutomationDemo()' in the console to see the demo!");
} else {
  // Node environment - run immediately
  runCompleteDemo();
}