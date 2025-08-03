// Please collapse all functions for better view 
import { Button } from "@/components/ui/Button/Button";
import { cn } from "@/lib/utils";
import { FiPlusCircle } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import { PiGitForkBold } from "react-icons/pi";
import { LuMousePointerClick } from "react-icons/lu";
import { LuSearchCheck } from "react-icons/lu";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import HeaderContent from "../../components/header-content";
import { useEditor } from "../../provider/editor";
import type { EditorCanvasCardMetaType, EditorCanvasCardType, EditorCanvasTypes, EditorNodeType } from "../../libs/type";
import { v4 } from "uuid";
import { toast } from "sonner";
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    MiniMap,
    ReactFlowProvider,
    useNodeId,
    useReactFlow,
    type Connection,
    type Edge,
    type EdgeChange,
    type NodeChange,
    type ReactFlowInstance,
} from "reactflow";
import 'reactflow/dist/style.css'
import { Maximize, Minus, Plus, Save, Upload } from "lucide-react";
import EditorCanvasCardSingle from "../../components/editor-canvas-card-single";
// import AddActionCard from "../../actions/add-action-card";
import { CiGrid42 } from "react-icons/ci";
import AddTrigger from "../../actions/add-trigger";
import { AddTriggerSchema, type AddTriggerSchemaType } from "../../schema/add-trigger";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import AddCondition from "../../actions/add-condition";
import DefineCheck from "../../actions/define-check";
import Testing from "../../actions/testing";
import { AddAutomationSchema, type AddAutomationSchemaType } from "../../schema/add-automation";
import AddAutomation from "../../actions/add-automation";
import DefineAction from "../../actions/define-action";
import { useGetTriggers } from "@/features/automation/hooks/useTriggers";
import { useGetAppointmentStatus, useGetConditions } from "@/features/automation/hooks/useConditions";
import { useGetCheckTypes } from "@/features/automation/hooks/useCheck";
import { useGetClientsStatus } from "@/features/automation/hooks/useClient";

// NEW IMPORTS FOR API INTEGRATION
import { useSaveAutomation, useUpdateAutomation, useGetAutomation, useTestAutomation } from "../../hooks/useAutomation";
import { transformFlowToAPI, transformAPIToFlow } from "../../utils/automation-transform";
import { useRouter, useSearchParams } from "next/navigation";

// styles for tooltip
const defaultStyles = {
    backgroundColor: "white",
    opacity: 1,
    color: "#27272A",
    boxShadow: "2px 2px 10px 0px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
}

type OpenPanel = "add" | "condition" | "action" | "check" | "trigger" | "testing";

const description = {
    'Trigger': 'Select the trigger that start the automation.',
    'Condition': 'Select the condition that will be used to check the data.',
    'IF Match': 'Select the action that will perform if the condition is met.',
    'Else Match': 'Select the action that will perform if the condition is not met.',
    'Check': 'Select the action that will perform if the condition is not met.',
}

const Controls = () => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <div className="flex flex-col items-center justify-between gap-y-4">
            <div>
                <Button
                    variant='outline'
                    data-tooltip-id="zoom-in"
                    data-tooltip-content="Zoom In"
                    className='!px-0 w-11 h-10.5 rounded-lg cursor-pointer'
                    onClick={() => zoomIn()}
                >
                    <Plus size={16} color='#27272A' />
                </Button>
                <Tooltip id="zoom-in" style={defaultStyles} />
            </div>
            <div>
                <Button
                    variant='outline'
                    data-tooltip-id="zoom-out"
                    data-tooltip-content="Zoom Out"
                    className='!px-0 w-11 h-10.5 rounded-lg cursor-pointer'
                    onClick={() => zoomOut()}
                >
                    <Minus size={16} color='#27272A' />
                </Button>
                <Tooltip id="zoom-out" style={defaultStyles} />
            </div>
            <div>
                <Button
                    variant='outline'
                    data-tooltip-id="fit-view"
                    data-tooltip-content="Fit View"
                    className='!px-0 w-11 h-10.5 rounded-lg cursor-pointer'
                    onClick={() => fitView()}
                >
                    <Maximize size={16} color='#27272A' />
                </Button>
                <Tooltip id="fit-view" style={defaultStyles} />
            </div>
        </div>
    )
}

export default function EditorCanvas() {
    // NEW: Get automation ID from URL params for editing
    const router = useRouter();
    const searchParams = useSearchParams();
    const automationId = searchParams.get('id');
    const isEditMode = !!automationId;

    // hooks for editor
    const { dispatch, state } = useEditor()
    const [reactFlowInstance, setReactFlowInstance] =
        useState<ReactFlowInstance>()

    const [isActive, setIsActive] = useState(false);
    
    // NEW: API hooks
    const saveAutomationMutation = useSaveAutomation();
    const updateAutomationMutation = useUpdateAutomation();
    const testAutomationMutation = useTestAutomation();
    const { data: existingAutomation, isLoading: loadingAutomation } = useGetAutomation(automationId);

    // hooks for react flow
    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            const updatedNodes = applyNodeChanges(changes, state.editor.elements as EditorNodeType[]).map(node => ({
                ...node,
                type: node.type as EditorCanvasTypes,
            })) as EditorNodeType[];
            dispatch({
                type: 'LOAD_DATA',
                payload: {
                    elements: updatedNodes,
                    edges: state.editor.edges,
                },
            });
        },
        [state.editor.elements, state.editor.edges, dispatch]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            const updatedEdges = applyEdgeChanges(changes, state.editor.edges);
            dispatch({
                type: 'LOAD_DATA',
                payload: {
                    elements: state.editor.elements,
                    edges: updatedEdges,
                },
            });
        },
        [state.editor.elements, state.editor.edges, dispatch]
    );

    function addChildNode({
        parentId,
        type = "Condition",
        direction = "bottom",
        dispatch,
        state,
        descriptionMap,
    }: {
        parentId: string;
        type?: EditorCanvasCardType["type"];
        direction?: "bottom" | "left" | "right";
        dispatch: any;
        state: any;
        descriptionMap: Record<string, string>;
    }) {
        const parentNode = state.editor.elements.find((node: EditorNodeType) => node.id === parentId);
        const defaultPosition = { x: 100, y: 100 };

        // Helper function to create a node
        const createNode = (nodeType: EditorCanvasCardType["type"], position: { x: number, y: number }) => {
            let metadata: EditorCanvasCardMetaType;
            if (nodeType === "Trigger") {
                metadata = { type: nodeType, triggerType: "" };
            } else if (nodeType === "Condition") {
                metadata = { type: nodeType, condition: [] };
            } else if (nodeType === "IF Match" || nodeType === "Else Match") {
                metadata = { type: nodeType, action: [] };
            } else if (nodeType === "Check") {
                metadata = {
                    type: nodeType,
                    checkItem: "",
                    selectAction: "",
                    formName: "",
                    periodType: "dynamic",
                    numberOfChecks: 1,
                    ifMatch: [""],
                    elseMatch: [""],
                    intervalUnit: "hours",
                    checkInterval: 1,
                };
            } else {
                return null;
            }

            return {
                id: v4(),
                type: nodeType,
                position,
                data: {
                    title: nodeType,
                    description: descriptionMap[nodeType],
                    completed: false,
                    current: false,
                    metadata,
                    type: nodeType,
                },
            };
        };

        let newNodes: EditorNodeType[] = [];
        let newEdges: Edge[] = [];

        if (type === "Condition") {
            const position = parentNode
                ? {
                    x: direction === "left" ? parentNode.position.x - 300 : direction === "right" ? parentNode.position.x + 300 : parentNode.position.x,
                    y: direction === "bottom" ? parentNode.position.y + 150 : parentNode.position.y,
                }
                : defaultPosition;

            const newNode = createNode(type, position);
            if (newNode) {
                newNodes.push(newNode);
                newEdges.push({
                    id: `reactflow__edge-${parentId}-${newNode.id}`,
                    source: parentId,
                    target: newNode.id,
                    type: "default",
                });
            }
        } else if (type === "Check" || type === "Trigger") {
            const position = parentNode
                ? {
                    x: direction === "left" ? parentNode.position.x - 300 : direction === "right" ? parentNode.position.x + 300 : parentNode.position.x,
                    y: direction === "bottom" ? parentNode.position.y + 150 : parentNode.position.y,
                }
                : defaultPosition;

            const newNode = createNode(type, position);
            if (newNode) {
                newNodes.push(newNode);
                newEdges.push({
                    id: `reactflow__edge-${parentId}-${newNode.id}`,
                    source: parentId,
                    target: newNode.id,
                    type: "default",
                });
            }
        } else {
            // For action types, create both IF Match and Else Match nodes
            const ifPosition = parentNode
                ? {
                    x: parentNode.position.x - 300,
                    y: parentNode.position.y + 150,
                }
                : { x: defaultPosition.x - 300, y: defaultPosition.y };

            const elsePosition = parentNode
                ? {
                    x: parentNode.position.x + 300,
                    y: parentNode.position.y + 150,
                }
                : { x: defaultPosition.x + 300, y: defaultPosition.y };

            const ifNode = createNode("IF Match", ifPosition);
            const elseNode = createNode("Else Match", elsePosition);

            if (ifNode && elseNode) {
                newNodes.push(ifNode, elseNode);
                newEdges.push(
                    {
                        id: `reactflow__edge-${parentId}-${ifNode.id}`,
                        source: parentId,
                        target: ifNode.id,
                        type: "default",
                    },
                    {
                        id: `reactflow__edge-${parentId}-${elseNode.id}`,
                        source: parentId,
                        target: elseNode.id,
                        type: "default",
                    }
                );
            }
        }

        dispatch({
            type: "LOAD_DATA",
            payload: {
                elements: [...state.editor.elements, ...newNodes],
                edges: [...state.editor.edges, ...newEdges],
            },
        });
    }

    const nodeTypes = useMemo(
        () => ({
            Trigger: ({ data }: { data: EditorCanvasCardType }) => {
                return <EditorCanvasCardSingle data={data} addChildNode={addChildNode} />
            },
            Condition: ({ data }: { data: EditorCanvasCardType }) => {
                return <EditorCanvasCardSingle data={data} addChildNode={addChildNode} />
            },
            'IF Match': ({ data }: { data: EditorCanvasCardType }) => {
                return <EditorCanvasCardSingle data={data} addChildNode={addChildNode} />
            },
            'Else Match': ({ data }: { data: EditorCanvasCardType }) => {
                return <EditorCanvasCardSingle data={data} addChildNode={addChildNode} />
            },
            Check: ({ data }: { data: EditorCanvasCardType }) => {
                return <EditorCanvasCardSingle data={data} addChildNode={addChildNode} />
            },
        }),
        []
    )

    const onConnect = useCallback(
        (params: Edge | Connection) => {
            const newEdges = addEdge(params, state.editor.edges);
            dispatch({
                type: 'LOAD_DATA',
                payload: {
                    elements: state.editor.elements,
                    edges: newEdges,
                },
            });
        },
        [state.editor.elements, state.editor.edges, dispatch]
    );

    const onDrop = useCallback(
        (event: any) => {
            event.preventDefault()

            const type: EditorCanvasCardType['type'] = event.dataTransfer.getData(
                'application/reactflow'
            )

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return
            }

            const triggerAlreadyExists = state.editor.elements.find(
                (node) => node.type === 'Trigger'
            )

            if (type === 'Trigger' && triggerAlreadyExists) {
                toast('Only one trigger can be added to automations at the moment')
                return
            }

            // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
            // and you don't need to subtract the reactFlowBounds.left/top anymore
            // details: https://reactflow.dev/whats-new/2023-11-10
            if (!reactFlowInstance) return
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            })

            let metadata: EditorCanvasCardMetaType;
            if (type === 'Trigger') {
                metadata = { type, triggerType: '' };
            } else if (type === 'Condition') {
                metadata = {
                    type,
                    condition: [], // Required field
                };
            } else if (type === 'IF Match' || type === 'Else Match') {
                metadata = {
                    type,
                    action: [], // Required field
                };
            } else if (type === 'Check') {
                metadata = {
                    type,
                    checkItem: '',
                    selectAction: '',
                    formName: '',
                    periodType: 'dynamic',
                    numberOfChecks: 1,
                    ifMatch: [''],
                    elseMatch: [''],
                    intervalUnit: 'hours',
                    checkInterval: 1,
                };
            } else {
                return; // Invalid type
            }

            const newNode: EditorNodeType = {
                id: v4(),
                type,
                position,
                data: {
                    title: type,
                    description: description[type],
                    completed: false,
                    current: false,
                    metadata,
                    type,
                },
            };

            dispatch({
                type: 'LOAD_DATA',
                payload: {
                    elements: [...state.editor.elements, newNode],
                    edges: state.editor.edges,
                },
            });
        },
        [reactFlowInstance, state]
    )

    const onDragOver = useCallback((event: any) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const handleClickCanvas = () => {
        dispatch({
            type: 'SELECTED_ELEMENT',
            payload: {
                element: {
                    data: {
                        description: 'Select the trigger that start the automation.',
                        completed: false,
                        current: false,
                        metadata: {
                            type: 'Trigger',
                            triggerType: description['Trigger'],
                        },
                        title: '',
                        type: 'Trigger',
                    },
                    id: '',
                    position: { x: 0, y: 0 },
                    type: 'Trigger',
                },
            },
        })
    }

    // hooks for ui
    const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
    const setPhContent = useUIStore(
        (state) => state.setPageHeaderContent
    );

    // hooks for panels
    const panelKeys = ["add", "condition", "action", "check"];
    const [open, setOpen] = useState<OpenPanel | null>(null);

    // Function to update node metadata
    const updateNodeMetadata = useCallback(
        (metadata: EditorCanvasCardMetaType) => {
            dispatch({
                type: 'UPDATE_NODE_METADATA',
                payload: {
                    nodeId: state.editor.selectedNode.id,
                    metadata,
                },
            });
        },
        [state.editor.selectedNode.id, dispatch]
    );

    const handlePanelClick = (key: OpenPanel) => {
        if (open === key) {
            setOpen(null);
        } else {
            setOpen(key);
        }
    }

    // hooks for form
    const triggerForm = useForm<AddTriggerSchemaType>({
        resolver: zodResolver(AddTriggerSchema),
        defaultValues: {
            triggerType: ''
        }
    })

    const addAutomationForm = useForm<AddAutomationSchemaType>({
        resolver: zodResolver(AddAutomationSchema),
        defaultValues: {
            title: '',
            description: '',
        }
    })

    // NEW: API Integration Functions
    const handleSaveAutomation = useCallback(async () => {
        const formData = addAutomationForm.getValues();
        
        if (!formData.title.trim()) {
            toast.error('Please provide a title for your automation');
            setOpen("add");
            return;
        }

        if (state.editor.elements.length === 0) {
            toast.error('Please add at least one node to your automation');
            return;
        }

        try {
            const flowData = {
                nodes: state.editor.elements,
                edges: state.editor.edges
            };

            const apiPayload = transformFlowToAPI(flowData, {
                name: formData.title,
                description: formData.description || '',
                isActive: isActive
            });

            if (isEditMode && automationId) {
                await updateAutomationMutation.mutateAsync({
                    id: automationId,
                    automationData: apiPayload
                });
            } else {
                const result = await saveAutomationMutation.mutateAsync(apiPayload);
                // Redirect to edit mode with the new ID
                router.push(`/automation/create?id=${result.data.id}`);
            }
        } catch (error) {
            console.error('Failed to save automation:', error);
        }
    }, [
        addAutomationForm, 
        state.editor.elements, 
        state.editor.edges, 
        isActive, 
        isEditMode, 
        automationId, 
        updateAutomationMutation, 
        saveAutomationMutation, 
        router
    ]);

    const handleTestAutomation = useCallback(async () => {
        if (isEditMode && automationId) {
            try {
                await testAutomationMutation.mutateAsync({
                    id: automationId,
                    testData: {
                        // Add any test data you want to pass
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.error('Failed to test automation:', error);
            }
        } else {
            toast.info('Please save the automation first before testing');
        }
    }, [isEditMode, automationId, testAutomationMutation]);

    // NEW: Load existing automation data
    useEffect(() => {
        if (existingAutomation?.data && !loadingAutomation) {
            const flowData = transformAPIToFlow(existingAutomation.data);
            
            // Load the flow data into the editor
            dispatch({
                type: 'LOAD_DATA',
                payload: {
                    elements: flowData.nodes,
                    edges: flowData.edges,
                },
            });

            // Load form data
            addAutomationForm.setValue('title', existingAutomation.data.name);
            addAutomationForm.setValue('description', existingAutomation.data.description || '');
            setIsActive(existingAutomation.data.is_active);
        }
    }, [existingAutomation, loadingAutomation, dispatch, addAutomationForm]);

    useEffect(() => {
        setBreadcrumbs([
            {
                label: "Automation",
                href: "/dashboard/automation",
                isCurrentPage: false,
            },
            {
                label: isEditMode ? "Edit Automation" : "Create Automation",
                href: "/dashboard/automation/create",
                isCurrentPage: true,
            },
        ]);
        return () => {
            setBreadcrumbs([]);
        };
    }, [setBreadcrumbs, isEditMode]);

    useEffect(() => {
        const headerContent = (
            <HeaderContent
                onTest={handleTestAutomation}
                canUndo={state.history.currentIndex > 0}
                canRedo={state.history.currentIndex < state.history.history.length - 1}
                dispatch={dispatch}
                title={addAutomationForm.watch('title') || "Untitled Automation"}
                focusTitleInput={() => {
                    setOpen("add")
                    setTimeout(() => {
                        addAutomationForm.setFocus("title")
                    }, 100)
                }}
                isActive={isActive}
                setIsActive={() => setIsActive(!isActive)}
                // NEW: Add save functionality to header
                onSave={handleSaveAutomation}
                isSaving={saveAutomationMutation.isPending || updateAutomationMutation.isPending}
                isEditMode={isEditMode}
            />
        );

        setPhContent(headerContent);

        return () => {
            setPhContent(null);
        };
    }, [
        setPhContent, 
        state.editor.elements, 
        dispatch, 
        addAutomationForm.watch('title'), 
        isActive, 
        handleSaveAutomation, 
        handleTestAutomation,
        saveAutomationMutation.isPending,
        updateAutomationMutation.isPending,
        isEditMode
    ]);

    useEffect(() => {
        // Only create default trigger if not loading existing automation and no elements exist
        if (state.editor.elements.length === 0 && !loadingAutomation && !existingAutomation) {
            const defaultTrigger: EditorNodeType = {
                id: v4(),
                type: 'Trigger',
                position: { x: 400, y: 300 },
                data: {
                    title: 'Trigger',
                    description: description['Trigger'],
                    completed: false,
                    current: true,
                    metadata: {
                        type: 'Trigger',
                        triggerType: "",
                    },
                    type: 'Trigger',
                },
            };
            dispatch({
                type: 'LOAD_DATA',
                payload: {
                    elements: [defaultTrigger],
                    edges: [],
                },
            });
        }
    }, [state.editor.elements, dispatch, loadingAutomation, existingAutomation]);

    // don't remove function 
    const onAutomateFlow = async () => {
        // Use reducer state for nodes and edges
        const nodes = state.editor.elements;
        const edges = state.editor.edges;

        // Create a map for quick node lookup
        const nodeMap = new Map(nodes.map(node => [node.id, node]))

        // Build parent-child relationships
        const childrenMap = new Map()
        nodes.forEach(node => {
            childrenMap.set(node.id, [])
        })

        edges.forEach(edge => {
            const parent = childrenMap.get(edge.source)
            if (parent) {
                parent.push({
                    targetId: edge.target,
                    edgeId: edge.id
                })
            }
        })

        // Find root nodes (nodes with no incoming edges)
        const rootNodes = nodes.filter(node =>
            !edges.some(edge => edge.target === node.id)
        )

        // Build complete tree structure
        const buildNodeTree = (nodeId: string, depth = 0): any => {
            const node = nodeMap.get(nodeId)
            if (!node) return null

            const children = childrenMap.get(nodeId) || []

            return {
                id: node.id,
                type: node.type,
                title: node.data.title,
                description: node.data.description,
                position: {
                    x: node.position.x,
                    y: node.position.y
                },
                metadata: node.data.metadata,
                completed: node.data.completed,
                current: node.data.current,
                depth: depth,
                children: children.map((child: any) => {
                    const childNode = buildNodeTree(child.targetId, depth + 1)
                    return {
                        ...childNode,
                        connection: {
                            edgeId: child.edgeId,
                            sourceId: nodeId,
                            targetId: child.targetId
                        }
                    }
                }).filter(Boolean)
            }
        }

        // Build the complete tree
        const completeTree = rootNodes.map(node => buildNodeTree(node.id))

        // NEW: Show API transformation preview
        try {
            const formData = addAutomationForm.getValues();
            const flowData = { nodes, edges };
            const apiPayload = transformFlowToAPI(flowData, {
                name: formData.title || 'Preview Automation',
                description: formData.description || '',
                isActive: isActive
            });

            console.log('Flow Tree:', completeTree);
            console.log('API Payload:', apiPayload);
            
            toast.success('Check console for flow tree and API payload preview');
        } catch (error) {
            console.error('Transformation error:', error);
            toast.error('Failed to transform flow to API format');
        }

        return completeTree
    }

    useEffect(() => {
        if (state.editor.selectedNode.id) {
            if (state.editor.selectedNode.type === "Trigger") {
                setOpen("trigger")
            }

            if (state.editor.selectedNode.type === "Condition") {
                setOpen("condition")
            }

            if (state.editor.selectedNode.type === "IF Match" || state.editor.selectedNode.type === "Else Match") {
                setOpen("action")
            }

            if (state.editor.selectedNode.type === "Check") {
                setOpen("check")
            }
        }
    }, [state.editor.selectedNode])

    const { data: triggerData, isLoading: loadingTrigger } = useGetTriggers({
        business_id: "1",
        active: true,
        is_system: true,
        enabled: open === "trigger"
    });

    const { data: conditionData, isLoading: conditionLoading } = useGetConditions({
        business_id: "1",
        enabled: open === "condition"
    })

    // Show loading state while loading existing automation
    if (loadingAutomation) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading automation...</p>
                </div>
            </div>
        );
    }

    return (
        <ReactFlowProvider>
            <div className="flex">
                <div className='relative' style={{ height: '100vh', width: '100%' }}>
                    {/* actions button for opening panels */}
                    <div
                        className={cn(
                            'absolute min-h-[70vh] top-5 right-[-2%] w-[5rem] h-[15rem] z-[10000] flex flex-col items-center justify-between gap-y-5 transition-transform duration-300',
                            (panelKeys.some(key => open === key) || open === "trigger" || open === "testing") && 'translate-x-[-32rem]'
                        )}
                    >
                        <div className="flex flex-col items-center justify-between gap-y-5">
                            <span data-tooltip-id="add" data-tooltip-content="Add">
                                <Button
                                    variant='outline'
                                    className='!px-0 w-11 h-10.5 rounded-lg cursor-pointer'
                                    onClick={() => handlePanelClick("add")}
                                >
                                    <FiPlusCircle className='text-base' color='#27272A' />
                                </Button>
                                <Tooltip id="add" style={defaultStyles} />
                            </span>
                            <span data-tooltip-id="condition" data-tooltip-content="Add Condition">
                                <Button
                                    variant='outline'
                                    className='!px-0 w-11 h-10.5 rounded-lg cursor-pointer'
                                    onClick={() => handlePanelClick("condition")}
                                    disabled={state.editor.selectedNode.type !== "Condition"}
                                    tabIndex={-1}
                                >
                                    <PiGitForkBold className='text-base' color='#27272A' />
                                </Button>
                                <Tooltip id="condition" style={defaultStyles} />
                            </span>
                            {/* NEW: Save button */}
                            <span data-tooltip-id="save" data-tooltip-content="Save Automation">
                                <Button 
                                    variant='outline'
                                    className='!px-0 w-11 h-10.5 rounded-lg cursor-pointer'
                                    onClick={handleSaveAutomation}
                                    disabled={saveAutomationMutation.isPending || updateAutomationMutation.isPending}
                                    tabIndex={-1}
                                >
                                    <Save className='text-base' color='#27272A' />
                                </Button>
                                <Tooltip id="save" style={defaultStyles} />
                            </span>
                            <span data-tooltip-id="action" data-tooltip-content="Preview API">
                                <Button variant='outline'
                                    className='!px-0 w-11 h-10.5 rounded-lg cursor-pointer'
                                    onClick={async () => {
                                        const res = await onAutomateFlow();
                                        console.log(res)
                                    }}
                                    tabIndex={-1}
                                >
                                    <LuMousePointerClick className='text-base' color='#27272A' />
                                </Button>
                                <Tooltip id="action" style={defaultStyles} />
                            </span>
                            <span data-tooltip-id="check" data-tooltip-content="Check">
                                <Button
                                    variant='outline'
                                    className='!px-0 w-11 h-10.5 rounded-lg cursor-pointer'
                                    onClick={() => handlePanelClick("check")}
                                    disabled={state.editor.selectedNode.type !== "Check"}
                                    tabIndex={-1}
                                >
                                    <LuSearchCheck className='text-base' color='#27272A' />
                                </Button>
                                <Tooltip id="check" style={defaultStyles} />
                            </span>
                        </div>
                        <Controls />
                    </div>

                    {/* actions  */}

                    {open === "add" && (
                        <AddAutomation
                            open={open === "add"}
                            onClose={() => setOpen(null)}
                            addAutomationForm={addAutomationForm}
                        />
                    )}

                    {open === "trigger" && (
                        <AddTrigger
                            open={open === "trigger"}
                            onClose={() => setOpen(null)}
                            onNext={() => { }}
                            onUpdateMetadata={updateNodeMetadata}
                            triggerForm={triggerForm}
                            isLoading={loadingTrigger}
                            triggers={triggerData?.data || []}
                        />
                    )}

                    {open === "condition" && (
                        <AddCondition
                            open={open === "condition"}
                            onClose={() => setOpen(null)}
                            onNext={() => { }}
                            onUpdateMetadata={updateNodeMetadata}
                            selectedNode={state.editor.selectedNode}
                            isLoading={conditionLoading}
                            conditionTypes={conditionData?.data || []}
                        />
                    )}

                    {open === "check" && (
                        <DefineCheck
                            selectedNode={state.editor.selectedNode}
                            open={open === "check"}
                            onClose={() => setOpen(null)}
                            onNext={() => { }}
                            onUpdateMetadata={updateNodeMetadata}
                        />
                    )}

                    {open === "testing" && (
                        <Testing
                            open={open === "testing"}
                            onClose={() => setOpen(null)}
                        />
                    )}

                    {open === "action" && (
                        <DefineAction
                            open={open === "action"}
                            onClose={() => setOpen(null)}
                            selectedNode={state.editor.selectedNode}
                            onNext={() => { }}
                            onUpdateMetadata={updateNodeMetadata}
                        />
                    )}

                    {/* editor canvas */}
                    <ReactFlow
                        className="w-[300px]"
                        onDrop={isActive ? onDrop : () => { }}
                        onDragOver={isActive ? onDragOver : () => { }}
                        nodes={state.editor.elements}
                        onNodesChange={onNodesChange}
                        edges={state.editor.edges}
                        onEdgesChange={onEdgesChange}
                        onConnect={isActive ? onConnect : () => { }}
                        onInit={setReactFlowInstance}
                        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
                        onClick={handleClickCanvas}
                        nodeTypes={nodeTypes}
                    >
                        <MiniMap
                            position="bottom-left"
                            className="!bg-background"
                            zoomable
                            pannable
                        />
                        <Background
                            //@ts-ignore
                            variant="dots"
                            gap={12}
                            size={1}
                        />
                    </ReactFlow>
                </div>
            </div>
        </ReactFlowProvider>
    );
}