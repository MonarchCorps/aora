import type { EditorNodeType, EditorCanvasCardMetaType } from '../libs/type';
import type { Edge } from 'reactflow';

export interface APIAutomationPayload {
  name: string;
  description: string;
  trigger_type: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  settings?: {
    ui_config?: {
      theme?: string;
      flow_data?: {
        nodes: EditorNodeType[];
        edges: Edge[];
      };
    };
    display_options?: {
      show_timeline?: boolean;
    };
  };
  actions: APIAction[];
}

export interface APIAction {
  name: string;
  action_type: string;
  action_config: Record<string, any>;
  execution_order: number;
  is_active: boolean;
  conditions?: APICondition[];
  retry_config?: Record<string, any>;
}

export interface APICondition {
  type: string;
  value: any;
  operator?: string;
}

/**
 * Transform visual flow data to API format
 */
export function transformFlowToAPI(
  flowData: { nodes: EditorNodeType[]; edges: Edge[] },
  automationDetails: { name: string; description: string; isActive?: boolean }
): APIAutomationPayload {
  const { nodes, edges } = flowData;
  const { name, description, isActive = true } = automationDetails;

  // Find the trigger node
  const triggerNode = nodes.find(node => node.type === 'Trigger');
  if (!triggerNode) {
    throw new Error('Trigger node is required');
  }

  const triggerType = triggerNode.data.metadata.triggerType || 'manual';

  // Build node tree to understand flow structure
  const nodeTree = buildNodeTree(nodes, edges);
  
  // Convert flow to actions
  const actions = convertFlowToActions(nodeTree, nodes, edges);

  return {
    name,
    description,
    trigger_type: triggerType,
    is_active: isActive,
    start_date: new Date().toISOString().split('T')[0],
    settings: {
      ui_config: {
        theme: 'light',
        flow_data: {
          nodes,
          edges
        }
      },
      display_options: {
        show_timeline: true
      }
    },
    actions
  };
}

/**
 * Build a tree structure from nodes and edges
 */
function buildNodeTree(nodes: EditorNodeType[], edges: Edge[]) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const childrenMap = new Map<string, string[]>();
  
  // Initialize children map
  nodes.forEach(node => {
    childrenMap.set(node.id, []);
  });

  // Build parent-child relationships
  edges.forEach(edge => {
    const children = childrenMap.get(edge.source);
    if (children) {
      children.push(edge.target);
    }
  });

  // Find root nodes (nodes with no incoming edges)
  const rootNodes = nodes.filter(node =>
    !edges.some(edge => edge.target === node.id)
  );

  return { nodeMap, childrenMap, rootNodes };
}

/**
 * Convert flow structure to API actions
 */
function convertFlowToActions(
  tree: ReturnType<typeof buildNodeTree>,
  nodes: EditorNodeType[],
  edges: Edge[]
): APIAction[] {
  const actions: APIAction[] = [];
  let executionOrder = 1;

  const { nodeMap, childrenMap, rootNodes } = tree;

  // Process each branch of the flow
  function processNode(nodeId: string, parentConditions: APICondition[] = []): void {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const children = childrenMap.get(nodeId) || [];

    switch (node.type) {
      case 'Trigger':
        // Trigger doesn't create an action, just process children
        children.forEach(childId => processNode(childId, parentConditions));
        break;

      case 'Condition':
        // Process condition and its branches
        const conditionMetadata = node.data.metadata;
        const conditions = extractConditionsFromMetadata(conditionMetadata);
        
        children.forEach(childId => {
          const childNode = nodeMap.get(childId);
          if (childNode?.type === 'IF Match') {
            // Process IF branch with conditions
            processNode(childId, [...parentConditions, ...conditions]);
          } else if (childNode?.type === 'Else Match') {
            // Process ELSE branch with negated conditions
            const negatedConditions = conditions.map(cond => ({
              ...cond,
              operator: negateOperator(cond.operator || 'equals')
            }));
            processNode(childId, [...parentConditions, ...negatedConditions]);
          } else {
            // Direct child, pass conditions
            processNode(childId, [...parentConditions, ...conditions]);
          }
        });
        break;

      case 'IF Match':
      case 'Else Match':
        // Process action nodes
        const actionMetadata = node.data.metadata;
        if (actionMetadata.action && actionMetadata.action.length > 0) {
          actionMetadata.action.forEach((actionType: string) => {
            actions.push({
              name: `${node.type} - ${actionType}`,
              action_type: actionType,
              action_config: extractActionConfig(actionMetadata),
              execution_order: executionOrder++,
              is_active: true,
              conditions: parentConditions.length > 0 ? parentConditions : undefined,
              retry_config: {}
            });
          });
        }
        
        // Process children
        children.forEach(childId => processNode(childId, parentConditions));
        break;

      case 'Check':
        // Process check as a special action
        const checkMetadata = node.data.metadata;
        actions.push({
          name: `Check - ${checkMetadata.checkItem}`,
          action_type: 'check',
          action_config: {
            check_item: checkMetadata.checkItem,
            select_action: checkMetadata.selectAction,
            form_name: checkMetadata.formName,
            period_type: checkMetadata.periodType,
            number_of_checks: checkMetadata.numberOfChecks,
            interval_unit: checkMetadata.intervalUnit,
            check_interval: checkMetadata.checkInterval,
            if_match: checkMetadata.ifMatch,
            else_match: checkMetadata.elseMatch
          },
          execution_order: executionOrder++,
          is_active: true,
          conditions: parentConditions.length > 0 ? parentConditions : undefined,
          retry_config: {}
        });
        
        // Process children
        children.forEach(childId => processNode(childId, parentConditions));
        break;
    }
  }

  // Start processing from root nodes
  rootNodes.forEach(rootNode => {
    processNode(rootNode.id);
  });

  return actions;
}

/**
 * Extract conditions from condition metadata
 */
function extractConditionsFromMetadata(metadata: EditorCanvasCardMetaType): APICondition[] {
  const conditions: APICondition[] = [];

  if (metadata.type === 'Condition') {
    // Extract different types of conditions based on metadata
    if (metadata.category && metadata.category.length > 0) {
      conditions.push({
        type: 'category',
        value: metadata.category,
        operator: 'in'
      });
    }

    if (metadata.appointmentStatus && metadata.appointmentStatus.length > 0) {
      conditions.push({
        type: 'appointment_status',
        value: metadata.appointmentStatus,
        operator: 'in'
      });
    }

    if (metadata.service && metadata.service.length > 0) {
      conditions.push({
        type: 'service',
        value: metadata.service,
        operator: 'in'
      });
    }

    if (metadata.provider && metadata.provider.length > 0) {
      conditions.push({
        type: 'provider',
        value: metadata.provider,
        operator: 'in'
      });
    }

    if (metadata.location && metadata.location.length > 0) {
      conditions.push({
        type: 'location',
        value: metadata.location,
        operator: 'in'
      });
    }

    if (metadata.dateTime && Object.keys(metadata.dateTime).length > 0) {
      conditions.push({
        type: 'date_time',
        value: metadata.dateTime,
        operator: 'range'
      });
    }
  }

  return conditions;
}

/**
 * Extract action configuration from metadata
 */
function extractActionConfig(metadata: EditorCanvasCardMetaType): Record<string, any> {
  return {
    // Add specific action configuration based on action type
    // This can be expanded based on your action types
  };
}

/**
 * Negate an operator for else conditions
 */
function negateOperator(operator: string): string {
  const negationMap: Record<string, string> = {
    'equals': 'not_equals',
    'not_equals': 'equals',
    'in': 'not_in',
    'not_in': 'in',
    'greater_than': 'less_than_or_equal',
    'less_than': 'greater_than_or_equal',
    'greater_than_or_equal': 'less_than',
    'less_than_or_equal': 'greater_than'
  };

  return negationMap[operator] || 'not_equals';
}

/**
 * Transform API data back to flow format for editing
 */
export function transformAPIToFlow(apiData: APIAutomationPayload): {
  nodes: EditorNodeType[];
  edges: Edge[];
} {
  // If flow_data exists in settings, use it
  if (apiData.settings?.ui_config?.flow_data) {
    return {
      nodes: apiData.settings.ui_config.flow_data.nodes,
      edges: apiData.settings.ui_config.flow_data.edges
    };
  }

  // Otherwise, reconstruct from actions (basic implementation)
  // This is a simplified version - you might want to expand this
  const nodes: EditorNodeType[] = [];
  const edges: Edge[] = [];

  // Create trigger node
  const triggerId = 'trigger-' + Date.now();
  nodes.push({
    id: triggerId,
    type: 'Trigger',
    position: { x: 400, y: 100 },
    data: {
      title: 'Trigger',
      description: 'Select the trigger that start the automation.',
      completed: true,
      current: false,
      metadata: {
        type: 'Trigger',
        triggerType: apiData.trigger_type
      },
      type: 'Trigger'
    }
  });

  // Create action nodes from API actions
  apiData.actions.forEach((action, index) => {
    const actionId = 'action-' + index;
    nodes.push({
      id: actionId,
      type: 'IF Match',
      position: { x: 400, y: 200 + (index * 150) },
      data: {
        title: 'IF Match',
        description: action.name,
        completed: true,
        current: false,
        metadata: {
          type: 'IF Match',
          action: [action.action_type]
        },
        type: 'IF Match'
      }
    });

    // Connect to previous node
    const sourceId = index === 0 ? triggerId : 'action-' + (index - 1);
    edges.push({
      id: `edge-${sourceId}-${actionId}`,
      source: sourceId,
      target: actionId,
      type: 'default'
    });
  });

  return { nodes, edges };
}