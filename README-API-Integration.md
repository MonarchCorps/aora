# 🚀 Automation Builder API Integration

This integration allows your visual automation builder to save, load, update, and test automations through a REST API.

## 📁 Files Created

1. **`utils/automation-transform.ts`** - Transforms visual flow ↔ API format
2. **`hooks/useAutomation.ts`** - API hooks for CRUD operations
3. **`components/automation/EditorCanvasWithAPI.tsx`** - Updated component with API integration
4. **`examples/automation-api-demo.ts`** - Demo showing transformations
5. **`examples/visual-transformation-example.md`** - Visual guide

## 🔧 Quick Setup

### 1. Update API Endpoint
```typescript
// In hooks/useAutomation.ts, line 18
const API_BASE_URL = 'https://your-api-domain.com/api'; // Change this!
```

### 2. Add Authorization (if needed)
```typescript
// In hooks/useAutomation.ts, uncomment and update:
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${yourToken}`, // Add your auth token
},
```

### 3. Install Dependencies
```bash
npm install @tanstack/react-query
# or
yarn add @tanstack/react-query
```

### 4. Replace Your Component
Replace your existing `EditorCanvas` component with the new `EditorCanvasWithAPI.tsx`.

## 🎯 What It Does

### Your Visual Flow:
```
Trigger → Condition → IF Match / Else Match
```

### Becomes API Format:
```json
{
  "name": "My Automation",
  "trigger_type": "appointment_scheduled", 
  "actions": [
    {
      "action_type": "send_email",
      "conditions": [{"type": "category", "value": ["Hospital"]}],
      "execution_order": 1
    }
  ]
}
```

## 🚀 Features Added

- ✅ **Save** - Converts visual flow to API format and saves
- ✅ **Load** - Loads existing automation and rebuilds visual flow
- ✅ **Update** - Updates existing automations
- ✅ **Test** - Sends test requests to your API
- ✅ **Loading States** - Shows spinners during API calls
- ✅ **Error Handling** - Toast notifications for success/errors
- ✅ **Edit Mode** - URL parameter `?id=123` loads automation for editing

## 🔄 API Endpoints Expected

Your backend should implement these endpoints:

```
POST   /api/automations          - Create automation
GET    /api/automations/:id      - Get automation by ID
PUT    /api/automations/:id      - Update automation
DELETE /api/automations/:id      - Delete automation
PATCH  /api/automations/:id/toggle - Toggle active status
POST   /api/automations/:id/test - Test automation
GET    /api/automations          - List automations (with filters)
```

## 📝 API Response Format

```typescript
interface AutomationResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    description: string;
    trigger_type: string;
    is_active: boolean;
    actions: Action[];
    settings?: {
      ui_config?: {
        flow_data?: {
          nodes: EditorNodeType[];
          edges: Edge[];
        }
      }
    };
  };
  message?: string;
}
```

## 🧪 Testing

1. **Open browser console**
2. **Import the demo**: `import { runCompleteDemo } from './examples/automation-api-demo'`
3. **Run demo**: `runCompleteDemo()`
4. **See transformation** in console output

## 🎨 UI Changes

- **New Save Button** - In the right toolbar (disk icon)
- **Loading States** - Spinner when loading existing automations
- **Save States** - Button shows loading during save
- **Breadcrumbs** - Shows "Edit" vs "Create" mode
- **Auto-redirect** - After save, redirects to edit mode with ID

## 🔧 Customization

### Add More Action Types
```typescript
// In utils/automation-transform.ts
function extractActionConfig(metadata: EditorCanvasCardMetaType): Record<string, any> {
  return {
    // Add your specific action configurations here
    template_id: metadata.templateId,
    delay_minutes: metadata.delayMinutes,
    // etc...
  };
}
```

### Add More Condition Types
```typescript
// In utils/automation-transform.ts, extractConditionsFromMetadata function
if (metadata.customField && metadata.customField.length > 0) {
  conditions.push({
    type: 'custom_field',
    value: metadata.customField,
    operator: 'equals'
  });
}
```

## 🐛 Troubleshooting

### "Network Error"
- Check your `API_BASE_URL` is correct
- Ensure your API server is running
- Check CORS settings on your backend

### "Transformation Error"
- Ensure your flow has a Trigger node
- Check that node metadata matches the expected format
- Look at console for detailed error messages

### "Save Failed"
- Check API endpoint returns expected format
- Verify authentication headers if required
- Check network tab for detailed error response

## 🎯 Next Steps

1. **Set up your backend API** with the expected endpoints
2. **Test with your actual data** structure
3. **Customize the transformation logic** for your specific needs
4. **Add more action types** and condition types as needed
5. **Style the loading states** to match your design system

The integration is designed to be flexible and extensible! 🎉