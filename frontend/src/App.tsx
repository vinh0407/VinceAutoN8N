import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { VinceCustomNode } from './components/canvas/VinceCustomNode';
import { StickyNoteNode } from './components/canvas/StickyNoteNode';
import {
  N8nSidebar,
  DEFAULT_CHAT_HISTORY,
  DEFAULT_AGENT_PROJECT_LOGS,
  IAIChatHistoryItem,
  IAIAgentProjectLog,
} from './components/sidebar/N8nSidebar';
import { N8nWorkflowHeader } from './components/header/N8nWorkflowHeader';
import { EmptyCanvasState } from './components/canvas/EmptyCanvasState';
import { RightCanvasToolbar } from './components/canvas/RightCanvasToolbar';
import { BottomLeftControls } from './components/canvas/BottomLeftControls';
import { BottomLogsBar } from './components/canvas/BottomLogsBar';
import { NodeDetailsView } from './components/ndv/NodeDetailsView';
import { NodeCreatorPanel } from './components/node-creator/NodeCreatorPanel';
import { AIWorkflowAssistant } from './components/ai-builder/AIWorkflowAssistant';
import { ExecutionMonitor } from './components/monitor/ExecutionMonitor';
import { CredentialsModal } from './components/credentials/CredentialsModal';
import { ExecutionsListModal } from './components/executions/ExecutionsListModal';
import { ProjectTemplatesModal } from './components/templates/ProjectTemplatesModal';
import { TasksManagerModal } from './components/tasks/TasksManagerModal';
import { WorkflowVersionModal } from './components/canvas/WorkflowVersionModal';
import { DataTablesModal } from './components/tables/DataTablesModal';
import { IWorkflow, INodeDescription, IExecutionSummary, IProject } from './types';

export function App() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<IWorkflow | null>(null);
  const [availableNodes, setAvailableNodes] = useState<INodeDescription[]>([]);

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeNdvNodeId, setActiveNdvNodeId] = useState<string | null>(null);

  // Layout & Navigation states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'executions' | 'evaluations'>('editor');

  // Modals & Panels
  const [showNodeCreator, setShowNodeCreator] = useState(false);
  const [nodeCreatorInitialView, setNodeCreatorInitialView] = useState<
    | 'root'
    | 'triggers'
    | 'other_triggers'
    | 'app_list'
    | 'ai'
    | 'transformation'
    | 'flow'
    | 'core'
    | 'human_review'
    | 'other_ai'
    | 'provider_actions'
    | 'app_detail'
  >('root');
  const [pendingSourceNodeId, setPendingSourceNodeId] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [chatHistory, setChatHistory] = useState<IAIChatHistoryItem[]>(DEFAULT_CHAT_HISTORY);
  const [agentProjectLogs, setAgentProjectLogs] = useState<IAIAgentProjectLog[]>(DEFAULT_AGENT_PROJECT_LOGS);
  const [selectedChatItem, setSelectedChatItem] = useState<IAIChatHistoryItem | null>(null);
  const [selectedAgentLog, setSelectedAgentLog] = useState<IAIAgentProjectLog | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showExecutionsList, setShowExecutionsList] = useState(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [clipboardNodes, setClipboardNodes] = useState<Node[]>([]);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [executionSummary, setExecutionSummary] = useState<IExecutionSummary | null>(null);

  const nodeTypes: any = useMemo(
    () => ({
      vinceNode: VinceCustomNode,
      stickyNote: StickyNoteNode,
    }),
    []
  );

  const refreshProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      if (res.data?.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to refresh projects', err);
    }
  };

  // Fetch initial data & connect WebSocket
  useEffect(() => {
    axios.get('/api/nodes').then((res) => {
      if (res.data?.success) setAvailableNodes(res.data.nodes);
    });

    const initProjects = async () => {
      try {
        const res = await axios.get('/api/projects');
        if (res.data?.success && res.data.projects?.length > 0) {
          const projs: IProject[] = res.data.projects;
          setProjects(projs);
          const firstProj = projs[0];
          setSelectedProjectId(firstProj.id);

          // Find first workflow across projects or in first project
          const firstWf = firstProj.workflows?.[0] || projs.find((p) => p.workflows?.length)?.workflows?.[0];
          if (firstWf) {
            loadWorkflow(firstWf);
          } else {
            handleNewWorkflowInProject(firstProj.id);
          }
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    };

    initProjects();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const defaultWsUrl = `${protocol}//${window.location.host}/ws`;
    const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
    const wsUrl =
      (import.meta as any).env?.VITE_WS_URL ||
      (apiBase ? apiBase.replace(/^http/, 'ws') + '/ws' : defaultWsUrl);
    const ws = new WebSocket(wsUrl);

    // Keyboard shortcut N to open nodes panel (Image 1)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'n' || e.key === 'N') && !['INPUT', 'TEXTAREA'].includes((e.target as any)?.tagName)) {
        setNodeCreatorInitialView('root');
        setShowNodeCreator((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'node_start') {
          updateNodeExecutionState(payload.nodeId, 'running');
        } else if (payload.type === 'node_finish') {
          updateNodeExecutionState(payload.nodeId, 'success', payload.data?.durationMs, payload.data?.itemsCount);
        } else if (payload.type === 'node_error') {
          updateNodeExecutionState(payload.nodeId, 'error');
        } else if (payload.type === 'workflow_finish') {
          setIsRunning(false);
          setExecutionSummary(payload.data);
        }
      } catch {
        // ignore
      }
    };

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      ws.close();
    };
  }, []);

  // Listen for custom node toolbar and trigger events
  useEffect(() => {
    const handleNodeExecute = async (e: any) => {
      const nodeId = e.detail?.nodeId;
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (!targetNode) return;

      const nodeType = (targetNode.data as any)?.type || '';
      if (nodeType.startsWith('trigger.')) {
        handleExecuteWorkflow();
      } else {
        updateNodeExecutionState(nodeId, 'running');
        try {
          const res = await axios.post('/api/nodes/execute-step', {
            nodeType,
            parameters: (targetNode.data as any).parameters || {},
            inputData: [{ json: { test: true, timestamp: Date.now() } }],
          });
          if (res.data?.success) {
            updateNodeExecutionState(nodeId, 'success', res.data.durationMs, res.data.outputData?.length);
          } else {
            updateNodeExecutionState(nodeId, 'error');
          }
        } catch {
          updateNodeExecutionState(nodeId, 'error');
        }
      }
    };

    const handleNodeToggleDisable = (e: any) => {
      const nodeId = e.detail?.nodeId;
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            const currentDisabled = Boolean((n.data as any).parameters?._disabled);
            return {
              ...n,
              data: {
                ...n.data,
                parameters: {
                  ...(n.data as any).parameters,
                  _disabled: !currentDisabled,
                },
              },
            };
          }
          return n;
        })
      );
    };

    const handleNodeDelete = (e: any) => {
      const nodeId = e.detail?.nodeId;
      if (nodeId) handleDeleteNode(nodeId);
    };

    const handleNodeDuplicate = (e: any) => {
      const nodeId = e.detail?.nodeId;
      const target = nodes.find((n) => n.id === nodeId);
      if (!target) return;
      const newId = `node_${Date.now()}`;
      const cloned: Node = {
        ...target,
        id: newId,
        position: { x: target.position.x + 50, y: target.position.y + 50 },
        data: {
          ...target.data,
          id: newId,
          name: `${(target.data as any).name} (copy)`,
          status: 'idle',
        },
      };
      setNodes((nds) => [...nds, cloned]);
      setSelectedNodeId(newId);
    };

    const handleNodeOpenCreator = (e: any) => {
      const sourceNodeId = e.detail?.sourceNodeId || null;
      setPendingSourceNodeId(sourceNodeId);
      setNodeCreatorInitialView('root');
      setShowNodeCreator(true);
    };

    const handleNodeAskAI = () => {
      setShowAIAssistant(true);
    };

    window.addEventListener('vince:execute-node', handleNodeExecute);
    window.addEventListener('vince:toggle-disable', handleNodeToggleDisable);
    window.addEventListener('vince:delete-node', handleNodeDelete);
    window.addEventListener('vince:duplicate-node', handleNodeDuplicate);
    window.addEventListener('vince:open-creator-from-node', handleNodeOpenCreator);
    window.addEventListener('vince:ask-ai-node', handleNodeAskAI);

    return () => {
      window.removeEventListener('vince:execute-node', handleNodeExecute);
      window.removeEventListener('vince:toggle-disable', handleNodeToggleDisable);
      window.removeEventListener('vince:delete-node', handleNodeDelete);
      window.removeEventListener('vince:duplicate-node', handleNodeDuplicate);
      window.removeEventListener('vince:open-creator-from-node', handleNodeOpenCreator);
      window.removeEventListener('vince:ask-ai-node', handleNodeAskAI);
    };
  }, [nodes, currentWorkflow, isRunning]);

  const updateNodeExecutionState = (
    nodeId: string,
    status: 'running' | 'success' | 'error',
    duration?: number,
    itemsCount?: number
  ) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              status,
              ...(duration !== undefined ? { executionDuration: duration } : {}),
              ...(itemsCount !== undefined ? { itemsCount } : {}),
            },
          };
        }
        return n;
      })
    );
  };

  const loadWorkflow = (wf: IWorkflow) => {
    setCurrentWorkflow(wf);
    const flowNodes: Node[] = (wf.nodes || []).map((n: any) => ({
      id: n.id,
      type: 'vinceNode',
      position: { x: n.position[0], y: n.position[1] },
      data: {
        id: n.id,
        name: n.name,
        type: n.type,
        parameters: n.parameters || {},
        status: 'idle',
      },
    }));

    const flowEdges: Edge[] = (wf.connections || []).map((c: any, index: number) => ({
      id: `edge_${c.source}_${c.target}_${index}`,
      source: c.source,
      target: c.target,
      animated: true,
      style: { stroke: '#383838', strokeWidth: 2 },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
    setExecutionSummary(null);
    setSelectedNodeId(null);
    setActiveNdvNodeId(null);
  };

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#383838', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleSaveWorkflow = async () => {
    if (!currentWorkflow) return;

    const updatedWorkflow: IWorkflow = {
      ...currentWorkflow,
      projectId: currentWorkflow.projectId || selectedProjectId || undefined,
      nodes: nodes.map((n) => ({
        id: n.id,
        name: (n.data as any).name,
        type: (n.data as any).type,
        position: [Math.round(n.position.x), Math.round(n.position.y)],
        parameters: (n.data as any).parameters || {},
      })),
      connections: edges.map((e) => ({
        source: e.source,
        target: e.target,
      })),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post('/api/workflows', updatedWorkflow);
      if (res.data?.success) {
        setCurrentWorkflow(res.data.workflow);
        await refreshProjects();
      }
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow || isRunning) return;
    setIsRunning(true);
    setExecutionSummary(null);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle', executionDuration: undefined },
      }))
    );

    const draftWorkflow: IWorkflow = {
      ...currentWorkflow,
      nodes: nodes.map((n) => ({
        id: n.id,
        name: (n.data as any).name,
        type: (n.data as any).type,
        position: [n.position.x, n.position.y],
        parameters: (n.data as any).parameters || {},
      })),
      connections: edges.map((e) => ({
        source: e.source,
        target: e.target,
      })),
    };

    try {
      const res = await axios.post('/api/workflows/execute-adhoc', draftWorkflow);
      if (res.data?.success && res.data?.summary) {
        setExecutionSummary(res.data.summary);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAddNode = (
    nodeDesc: INodeDescription,
    customPos?: { x: number; y: number }
  ) => {
    const newId = `node_${Date.now()}`;
    const defaultParams: Record<string, any> = {
      ...((nodeDesc as any).defaultParameters || {}),
    };
    for (const p of nodeDesc.properties || []) {
      if (p.default !== undefined && defaultParams[p.name] === undefined) {
        defaultParams[p.name] = p.default;
      }
    }

    let posX = customPos ? customPos.x : 380 + Math.random() * 60;
    let posY = customPos ? customPos.y : 220 + Math.random() * 60;

    if (!customPos && pendingSourceNodeId) {
      const src = nodes.find((n) => n.id === pendingSourceNodeId);
      if (src) {
        posX = src.position.x + 240;
        posY = src.position.y;
      }
    }

    const newNode: Node = {
      id: newId,
      type: 'vinceNode',
      position: { x: posX, y: posY },
      data: {
        id: newId,
        name: nodeDesc.displayName,
        type: nodeDesc.name,
        parameters: defaultParams,
        status: 'idle',
      },
    };

    setNodes((nds) => [...nds, newNode]);

    if (pendingSourceNodeId) {
      setEdges((eds) => [
        ...eds,
        {
          id: `edge_${pendingSourceNodeId}_${newId}_${Date.now()}`,
          source: pendingSourceNodeId,
          target: newId,
          animated: true,
          style: { stroke: '#383838', strokeWidth: 2 },
        },
      ]);
      setPendingSourceNodeId(null);
    }

    setSelectedNodeId(newId);
  };

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const rawData = e.dataTransfer.getData('application/vinceauto-node');
      if (!rawData) return;

      try {
        const parsed = JSON.parse(rawData);
        const { typeName, displayName, defaultParams } = parsed;
        const bounds = e.currentTarget.getBoundingClientRect();
        const dropX = Math.max(80, Math.round(e.clientX - bounds.left - 45));
        const dropY = Math.max(80, Math.round(e.clientY - bounds.top - 45));

        const found = availableNodes.find(
          (n) =>
            n.name === typeName ||
            n.name.toLowerCase().includes(typeName.toLowerCase()) ||
            n.displayName.toLowerCase().includes((displayName || typeName).toLowerCase())
        );

        const nodeDesc: INodeDescription = found
          ? ({
              ...found,
              displayName: displayName || found.displayName,
              defaultParameters: defaultParams,
            } as any)
          : ({
              name: typeName,
              displayName: displayName || typeName,
              icon: 'Layers',
              category: 'automation',
              description: displayName || typeName,
              version: 1,
              properties: [],
              inputs: ['main'],
              outputs: ['main'],
              defaultParameters: defaultParams,
            } as any);

        handleAddNode(nodeDesc, { x: dropX, y: dropY });
      } catch (err) {
        console.error('Drop node error:', err);
      }
    },
    [availableNodes, nodes, pendingSourceNodeId]
  );

  const handleUpdateNodeParameters = (nodeId: string, parameters: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, parameters } };
        }
        return n;
      })
    );
  };

  const handleUpdateNodeName = (nodeId: string, name: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, name } };
        }
        return n;
      })
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    if (activeNdvNodeId === nodeId) setActiveNdvNodeId(null);
  };

  const handleExportJson = () => {
    if (!currentWorkflow) return;
    const jsonStr = JSON.stringify(currentWorkflow, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentWorkflow.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleNewWorkflowInProject = async (projectId: string) => {
    setSelectedProjectId(projectId);
    const targetProj = projects.find((p) => p.id === projectId);
    const wfIndex = (targetProj?.workflows?.length || 0) + 1;
    const newWf: IWorkflow = {
      id: `wf_${Date.now()}`,
      name: `Bản vẽ ${wfIndex}`,
      projectId: projectId,
      nodes: [
        {
          id: 'manual_trigger_1',
          name: "When clicking 'Execute workflow'",
          type: 'trigger.manual',
          position: [140, 240],
          parameters: {},
        },
      ],
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post('/api/workflows', newWf);
      if (res.data?.success) {
        loadWorkflow(res.data.workflow);
        await refreshProjects();
      } else {
        loadWorkflow(newWf);
      }
    } catch {
      loadWorkflow(newWf);
    }
  };

  const handleAddStickyNote = () => {
    const newId = `note_${Date.now()}`;
    const newNoteNode: Node = {
      id: newId,
      type: 'stickyNote',
      position: { x: 320 + Math.random() * 40, y: 180 + Math.random() * 40 },
      data: {
        id: newId,
        content: 'Ghi chú quy trình VinceAuto...',
        color: '#fef08a',
      },
    };
    setNodes((nds) => [...nds, newNoteNode]);
  };

  const handleAutoLayout = () => {
    if (nodes.length === 0) return;

    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });
    edges.forEach((e) => {
      if (inDegree[e.target] !== undefined) inDegree[e.target]++;
      if (adj[e.source]) adj[e.source].push(e.target);
    });

    const queue: { id: string; rank: number }[] = [];
    nodes.forEach((n) => {
      if (inDegree[n.id] === 0) queue.push({ id: n.id, rank: 0 });
    });

    const ranks: Record<string, number> = {};
    while (queue.length > 0) {
      const { id, rank } = queue.shift()!;
      ranks[id] = Math.max(ranks[id] || 0, rank);
      for (const nextId of adj[id] || []) {
        inDegree[nextId]--;
        if (inDegree[nextId] === 0) {
          queue.push({ id: nextId, rank: rank + 1 });
        }
      }
    }

    const rankGroups: Record<number, string[]> = {};
    nodes.forEach((n) => {
      const r = ranks[n.id] || 0;
      if (!rankGroups[r]) rankGroups[r] = [];
      rankGroups[r].push(n.id);
    });

    const startX = 260;
    const startY = 180;
    const spacingX = 280;
    const spacingY = 160;

    setNodes((nds) =>
      nds.map((n) => {
        const r = ranks[n.id] || 0;
        const indexInRank = (rankGroups[r] || []).indexOf(n.id);
        const yOffset = indexInRank * spacingY;
        return {
          ...n,
          position: {
            x: startX + r * spacingX,
            y: startY + yOffset,
          },
        };
      })
    );
  };

  // Keyboard shortcuts: Ctrl+C, Ctrl+V, key 'd' to toggle disable
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedNodeId) {
          const selected = nodes.filter((n) => n.id === selectedNodeId);
          if (selected.length > 0) {
            setClipboardNodes(selected);
          }
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (clipboardNodes.length > 0) {
          const newNodes: Node[] = clipboardNodes.map((n) => {
            const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            return {
              ...n,
              id: newId,
              position: { x: n.position.x + 40, y: n.position.y + 40 },
              data: {
                ...n.data,
                id: newId,
                name: `${(n.data as any).name || 'Node'} (Copy)`,
              },
            };
          });
          setNodes((prev) => [...prev, ...newNodes]);
          setSelectedNodeId(newNodes[0].id);
        }
      }

      if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey) {
        if (selectedNodeId) {
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === selectedNodeId) {
                const currentDisabled = Boolean((n.data as any).disabled);
                return {
                  ...n,
                  data: { ...n.data, disabled: !currentDisabled },
                };
              }
              return n;
            })
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, nodes, clipboardNodes]);

  const handleCreateProject = async (name: string, description?: string) => {
    try {
      const colors = ['#f45e7e', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const res = await axios.post('/api/projects', {
        name,
        description: description || `Dự án ${name}`,
        color: randomColor,
      });
      if (res.data?.success) {
        await refreshProjects();
        setSelectedProjectId(res.data.project.id);
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await axios.delete(`/api/workflows/${workflowId}`);
      await refreshProjects();
      if (currentWorkflow?.id === workflowId) {
        const remainingWfs = projects.flatMap((p) => p.workflows || []).filter((w) => w.id !== workflowId);
        if (remainingWfs.length > 0) {
          loadWorkflow(remainingWfs[0]);
        } else {
          handleNewWorkflowInProject(selectedProjectId || projects[0]?.id || 'proj_ai');
        }
      }
    } catch (err) {
      console.error('Error deleting workflow:', err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await axios.delete(`/api/projects/${projectId}`);
      if (res.data?.success) {
        const resProjs = await axios.get('/api/projects');
        const updatedProjects: IProject[] = resProjs.data?.projects || [];
        setProjects(updatedProjects);

        if (selectedProjectId === projectId) {
          if (updatedProjects.length > 0) {
            const nextProj = updatedProjects[0];
            setSelectedProjectId(nextProj.id);
            if (nextProj.workflows && nextProj.workflows.length > 0) {
              loadWorkflow(nextProj.workflows[0]);
            } else {
              handleNewWorkflowInProject(nextProj.id);
            }
          } else {
            setSelectedProjectId(null);
            setCurrentWorkflow(null);
            setNodes([]);
            setEdges([]);
          }
        }
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleDeleteSampleProjects = async () => {
    try {
      const res = await axios.post('/api/projects/delete-samples');
      if (res.data?.success) {
        const resProjs = await axios.get('/api/projects');
        const updatedProjects: IProject[] = resProjs.data?.projects || [];
        setProjects(updatedProjects);

        if (updatedProjects.length > 0) {
          const nextProj = updatedProjects[0];
          setSelectedProjectId(nextProj.id);
          if (nextProj.workflows && nextProj.workflows.length > 0) {
            loadWorkflow(nextProj.workflows[0]);
          } else {
            handleNewWorkflowInProject(nextProj.id);
          }
        } else {
          setSelectedProjectId(null);
          setCurrentWorkflow(null);
          setNodes([]);
          setEdges([]);
        }
      }
    } catch (err) {
      console.error('Error deleting sample projects:', err);
    }
  };

  const handleNewWorkflow = () => {
    const targetProjId = selectedProjectId || projects[0]?.id || 'proj_ai';
    handleNewWorkflowInProject(targetProjId);
  };

  const currentProject = projects.find(
    (p) => p.id === (currentWorkflow?.projectId || selectedProjectId)
  );

  const activeNdvNode = nodes.find((n) => n.id === activeNdvNodeId);
  const activeNdvNodeDesc = availableNodes.find((d) => d.name === (activeNdvNode?.data as any)?.type);
  const activeNodeExecutionResult = activeNdvNodeId && executionSummary?.results ? executionSummary.results[activeNdvNodeId] : undefined;

  // Gather incoming upstream data from parent nodes for NDV INPUT panel
  const activeNodeInputData = useMemo(() => {
    if (!activeNdvNodeId || !executionSummary?.results) return [];
    const incomingSources = edges
      .filter((e) => e.target === activeNdvNodeId)
      .map((e) => e.source);
    const items: any[] = [];
    for (const srcId of incomingSources) {
      const res = executionSummary.results[srcId];
      if (res?.data && Array.isArray(res.data)) {
        items.push(...res.data);
      }
    }
    return items;
  }, [activeNdvNodeId, edges, executionSummary]);

  return (
    <div className="flex h-screen w-screen bg-[#121212] overflow-hidden select-none font-sans">
      {/* 1. Left Sidebar */}
      <N8nSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        projects={projects}
        currentProjectId={selectedProjectId}
        currentWorkflowId={currentWorkflow?.id || null}
        onSelectProject={(projId) => setSelectedProjectId(projId)}
        onSelectWorkflow={(wf) => {
          setSelectedProjectId(wf.projectId || selectedProjectId);
          loadWorkflow(wf);
        }}
        onNewWorkflowInProject={handleNewWorkflowInProject}
        onCreateProject={handleCreateProject}
        onDeleteWorkflow={handleDeleteWorkflow}
        onDeleteProject={handleDeleteProject}
        onDeleteSampleProjects={handleDeleteSampleProjects}
        onOpenAssistant={() => {
          setSelectedChatItem(null);
          setSelectedAgentLog(null);
          setShowAIAssistant(true);
        }}
        onOpenCredentials={() => setShowCredentials(true)}
        chatHistory={chatHistory}
        agentProjectLogs={agentProjectLogs}
        activeChatId={selectedChatItem?.id || null}
        onSelectChatHistory={(item) => {
          setSelectedChatItem(item);
          setSelectedAgentLog(null);
          setShowAIAssistant(true);
        }}
        onSelectAgentLog={(log) => {
          setSelectedAgentLog(log);
          setSelectedChatItem(null);
          setShowAIAssistant(true);
        }}
      />

      {/* 2. Main Center/Right Canvas Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Workflow Header Bar (Screenshot 3) */}
        <N8nWorkflowHeader
          workflow={currentWorkflow}
          projectName={currentProject?.name || 'Dự án'}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'executions') setShowExecutionsList(true);
          }}
          onUpdateWorkflowName={(name) => {
            if (currentWorkflow) setCurrentWorkflow({ ...currentWorkflow, name });
          }}
          onToggleActive={(active) => {
            if (currentWorkflow) setCurrentWorkflow({ ...currentWorkflow, active });
          }}
          onSave={handleSaveWorkflow}
          onExecute={handleExecuteWorkflow}
          onExportWorkflow={handleExportJson}
          onOpenTasks={() => setShowTasksModal(true)}
          onOpenVersions={() => setShowVersionsModal(true)}
          onOpenTables={() => setShowTablesModal(true)}
          isRunning={isRunning}
        />

        {/* 3. The Canvas Area (Screenshot 3) */}
        <div
          className="flex-1 relative bg-[#121212]"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onNodeDoubleClick={(_, node) => setActiveNdvNodeId(node.id)}
            fitView
            className="bg-[#121212]"
          >
            {/* Subtle Dotted Background (Screenshot 3) */}
            <Background
              variant={BackgroundVariant.Dots}
              gap={22}
              size={1.2}
              color="#222222"
            />
          </ReactFlow>

          {/* Empty Canvas State (Cards from Screenshot 3) */}
          {nodes.length === 0 && (
            <EmptyCanvasState
              onAddFirstStep={() => {
                setNodeCreatorInitialView('triggers');
                setShowNodeCreator(true);
              }}
              onBuildWithAI={() => setShowAIAssistant(true)}
            />
          )}

          {/* Right Floating Canvas Toolbar */}
          <RightCanvasToolbar
            onAddNode={() => {
              setNodeCreatorInitialView('root');
              setShowNodeCreator(true);
            }}
            onSearch={() => {
              setNodeCreatorInitialView('root');
              setShowNodeCreator(true);
            }}
            onToggleAssistant={() => setShowAIAssistant(!showAIAssistant)}
            onOpenTemplates={() => setShowTemplatesModal(true)}
            onAddStickyNote={handleAddStickyNote}
            onAutoLayout={handleAutoLayout}
          />

          {/* Bottom Left Floating Controls (Pill from Screenshot 3) */}
          <BottomLeftControls />

          {/* Running Status Pill */}
          {isRunning && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-[#e6e8ec]/60 shadow-2xl flex items-center space-x-2 z-20 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 text-[#e6e8ec] animate-spin" />
              <span className="text-xs font-medium text-[#e6e8ec]">Executing workflow...</span>
            </div>
          )}

          {/* Node Details View (NDV) Modal */}
          {activeNdvNode && (
            <NodeDetailsView
              node={activeNdvNode}
              nodeDescription={activeNdvNodeDesc}
              inputData={activeNodeInputData}
              outputData={activeNodeExecutionResult?.data || []}
              executionStatus={activeNodeExecutionResult?.status}
              executionDuration={activeNodeExecutionResult?.durationMs}
              errorMessage={activeNodeExecutionResult?.error?.message}
              workflow={currentWorkflow}
              onUpdateParameters={handleUpdateNodeParameters}
              onUpdateName={handleUpdateNodeName}
              onDeleteNode={handleDeleteNode}
              onClose={() => setActiveNdvNodeId(null)}
            />
          )}

          {/* Node Creator Sliding Panel */}
          {showNodeCreator && (
            <NodeCreatorPanel
              nodes={availableNodes}
              initialView={nodeCreatorInitialView}
              onSelectNode={handleAddNode}
              onClose={() => setShowNodeCreator(false)}
            />
          )}

          {/* AI Workflow Assistant Sidebar */}
          {showAIAssistant && currentWorkflow && (
            <AIWorkflowAssistant
              currentWorkflow={currentWorkflow}
              onApplyWorkflow={(wf) => {
                loadWorkflow(wf);
                handleSaveWorkflow();
              }}
              onClose={() => setShowAIAssistant(false)}
              selectedChatItem={selectedChatItem}
              selectedAgentLog={selectedAgentLog}
              chatHistory={chatHistory}
              agentProjectLogs={agentProjectLogs}
              onNewChatAdded={(newChat, newLog) => {
                setChatHistory((prev) => [newChat, ...prev]);
                setAgentProjectLogs((prev) => [newLog, ...prev]);
              }}
            />
          )}

          {/* Bottom Execution Monitor Drawer */}
          {showLogsDrawer && (
            <ExecutionMonitor
              summary={executionSummary}
              isRunning={isRunning}
              onClose={() => setShowLogsDrawer(false)}
              onReRun={handleExecuteWorkflow}
            />
          )}

          {/* Credentials Modal */}
          {showCredentials && (
            <CredentialsModal onClose={() => setShowCredentials(false)} />
          )}

          {/* Executions History Modal */}
          {showExecutionsList && (
            <ExecutionsListModal
              onSelectExecution={(exec) => {
                setExecutionSummary(exec);
                setShowLogsDrawer(true);
              }}
              onClose={() => {
                setShowExecutionsList(false);
                setActiveTab('editor');
              }}
            />
          )}

          {/* Project Templates Modal (369 Awesome n8n Templates in Vietnamese) */}
          {showTemplatesModal && (
            <ProjectTemplatesModal
              onSelectTemplate={async (newWf, tplItem) => {
                const targetProjId = selectedProjectId || projects[0]?.id || 'proj_ai';
                const wfWithProj: IWorkflow = {
                  ...newWf,
                  projectId: targetProjId,
                };
                try {
                  const res = await axios.post('/api/workflows', wfWithProj);
                  if (res.data?.success) {
                    loadWorkflow(res.data.workflow);
                    await refreshProjects();
                  } else {
                    loadWorkflow(wfWithProj);
                  }
                } catch {
                  loadWorkflow(wfWithProj);
                }

                // Ghi nhận vào lịch sử AI Agent làm dự án
                setAgentProjectLogs((prev) => [
                  {
                    id: `log_tpl_${Date.now()}`,
                    title: `Khởi tạo mẫu bản vẽ: ${tplItem.titleVi}`,
                    projectName: currentProject?.name || 'Dự án hiện tại',
                    agentName: 'Kho Mẫu n8n',
                    status: 'success',
                    duration: '120ms',
                    timeAgo: 'Vừa xong',
                    details: `Đã nạp thành công mẫu "${tplItem.titleVi}" (${tplItem.nodesCount} nodes) từ danh mục "${tplItem.categoryVi}".`,
                    steps: tplItem.nodeNames.map((n, i) => `Bước ${i + 1}: Cấu hình node ${n}`),
                  },
                  ...prev,
                ]);
              }}
              onClose={() => setShowTemplatesModal(false)}
            />
          )}

          {/* Tasks & Daily Recurring Scheduler Modal */}
          {showTasksModal && (
            <TasksManagerModal
              isOpen={showTasksModal}
              onClose={() => setShowTasksModal(false)}
              currentWorkflow={currentWorkflow}
            />
          )}

          {/* Workflow Version History & Rollback Modal */}
          {showVersionsModal && currentWorkflow && (
            <WorkflowVersionModal
              workflow={currentWorkflow}
              isOpen={showVersionsModal}
              onClose={() => setShowVersionsModal(false)}
              onRestoreWorkflow={(restoredWf) => {
                loadWorkflow(restoredWf);
              }}
            />
          )}

          {/* Built-in Data Tables Modal */}
          {showTablesModal && (
            <DataTablesModal
              isOpen={showTablesModal}
              onClose={() => setShowTablesModal(false)}
            />
          )}
        </div>

        {/* 4. Bottom Logs Bar (Screenshot 3) */}
        <BottomLogsBar
          isOpen={showLogsDrawer}
          onToggle={() => setShowLogsDrawer(!showLogsDrawer)}
        />
      </div>
    </div>
  );
}
