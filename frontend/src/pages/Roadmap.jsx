import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft,
  Sparkles,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { getRoadmap } from '../api/client';
import StepNode from '../components/StepNode';
import TopicDrawer from '../components/TopicDrawer';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

// Register custom node types outside components
const nodeTypes = {
  stepNode: StepNode,
};

function RoadmapContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const reactFlow = useReactFlow();

  // Redirect to "/" if opened without router state
  useEffect(() => {
    if (!location.state?.role) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const targetRole = location.state?.role;
  const userSkills = location.state?.skills || [];

  // Data fetching states
  const [roadmapData, setRoadmapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Controlled sequential reveal index
  const [revealedCount, setRevealedCount] = useState(0);

  // Active step selected for Topic Drawer
  const [activeDrawerStep, setActiveDrawerStep] = useState(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const intervalRef = useRef(null);

  // Load roadmap data
  const fetchRoadmap = async () => {
    if (!targetRole) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await getRoadmap({
        role_code: targetRole.code,
        skills: userSkills,
      });
      setRoadmapData(data);

      if (prefersReducedMotion) {
        // Skip sequential animation if reduced motion preferred
        setRevealedCount(data.steps?.length || 0);
      } else {
        // Start sequential reveal
        setRevealedCount(0);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate roadmap.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [targetRole?.code]);

  // Sequential reveal animation effect
  useEffect(() => {
    if (isLoading || !roadmapData?.steps || roadmapData.steps.length === 0) return;

    if (prefersReducedMotion) {
      setRevealedCount(roadmapData.steps.length);
      return;
    }

    const totalSteps = roadmapData.steps.length;

    // Reset and start stepping every ~900ms
    if (revealedCount < totalSteps) {
      intervalRef.current = setTimeout(() => {
        setRevealedCount((prev) => prev + 1);
      }, 900);
    } else if (revealedCount === totalSteps && totalSteps > 0) {
      // Ease to fitView after final card revealed
      const timeout = setTimeout(() => {
        if (reactFlow) {
          reactFlow.fitView({ padding: 0.25, duration: 800 });
        }
      }, 700);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [revealedCount, isLoading, roadmapData?.steps, prefersReducedMotion, reactFlow]);

  const steps = roadmapData?.steps || [];
  const readiness = roadmapData?.readiness ?? 0;

  // Build visible React Flow nodes and edges
  const { nodes, edges } = useMemo(() => {
    const visibleSteps = steps.slice(0, revealedCount);
    const CARD_WIDTH = 320;
    const NODE_GAP_Y = 140;
    const START_Y = 40;
    const CENTER_X = 280;

    const currentNodes = visibleSteps.map((step, idx) => ({
      id: `step-${step.order}`,
      type: 'stepNode',
      position: { x: CENTER_X - CARD_WIDTH / 2, y: START_Y + idx * NODE_GAP_Y },
      data: {
        ...step,
        onClick: () => setActiveDrawerStep(step),
      },
      draggable: false,
    }));

    const currentEdges = [];
    for (let i = 0; i < visibleSteps.length - 1; i++) {
      const source = `step-${visibleSteps[i].order}`;
      const target = `step-${visibleSteps[i + 1].order}`;
      currentEdges.push({
        id: `edge-${source}-${target}`,
        source,
        target,
        animated: true,
        type: 'smoothstep',
        style: { stroke: '#FFCB56', strokeWidth: 2.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#FFCB56',
          width: 16,
          height: 16,
        },
      });
    }

    return { nodes: currentNodes, edges: currentEdges };
  }, [steps, revealedCount]);

  // Smoothly center the newest node as it appears
  useEffect(() => {
    if (!reactFlow || revealedCount === 0 || prefersReducedMotion) return;

    const latestStep = steps[revealedCount - 1];
    if (latestStep) {
      const CARD_WIDTH = 320;
      const NODE_GAP_Y = 140;
      const START_Y = 40;
      const targetY = START_Y + (revealedCount - 1) * NODE_GAP_Y + 40;

      reactFlow.setCenter(280, targetY, { duration: 600, zoom: 1 });
    }
  }, [revealedCount, reactFlow, steps, prefersReducedMotion]);

  if (!targetRole) return null;

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Top Header Controls & Progress */}
      <div className="bg-surface rounded-2xl border border-surface-border p-5 md:p-6 mb-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Target Role & Breadcrumb */}
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink mb-2 focus:outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to career map</span>
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
                Learning Roadmap
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-ink">{targetRole.title}</h1>
          </div>

          {/* Readiness Ring & Step Count */}
          <div className="flex items-center gap-6">
            {/* Readiness progress figure */}
            <div className="flex items-center gap-3 bg-surface-warm p-3 px-4 rounded-xl border border-surface-border shadow-soft-sm">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#F1E7CC"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#FFCB56"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (readiness / 100) * 125.6}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-ink">{readiness}%</span>
              </div>
              <div>
                <div className="text-xs font-bold text-ink">Role Readiness</div>
                <div className="text-[11px] text-ink-muted">You're {readiness}% there</div>
              </div>
            </div>

            {/* Step Counter */}
            <div className="flex flex-col items-end">
              <div className="text-xs font-semibold text-ink">
                Step {Math.min(revealedCount, steps.length)} of {steps.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="w-full h-[520px] rounded-2xl border border-surface-border bg-surface p-8 shadow-soft flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <div className="text-center">
            <h3 className="text-base font-bold text-ink mb-1">Synthesizing Learning Roadmap</h3>
            <p className="text-xs text-ink-muted">
              Matching your existing profile against requirements for {targetRole.title}&hellip;
            </p>
          </div>
          <div className="w-64 h-2 bg-surface-border rounded-full overflow-hidden mt-2">
            <div className="h-full bg-amber rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {!isLoading && errorMessage && (
        <div className="max-w-xl mx-auto my-8 w-full">
          <ErrorAlert message={errorMessage} onRetry={fetchRoadmap} />
        </div>
      )}

      {/* Empty State if 0 steps */}
      {!isLoading && !errorMessage && steps.length === 0 && (
        <EmptyState
          title="You already have the key skills for this role."
          description="Congratulations! Your verified skills already meet the baseline requirements for this role. You are ready to apply."
          actionText="Pick another target role"
          onAction={() => navigate('/map', { replace: true })}
        />
      )}

      {/* React Flow Sequential Flowchart Canvas */}
      {!isLoading && !errorMessage && steps.length > 0 && (
        <div className="relative w-full h-[560px] rounded-2xl border border-surface-border bg-surface-warm shadow-soft overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_event, node) => {
              if (node?.data) {
                setActiveDrawerStep(node.data);
              }
            }}
            fitView={false}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={true}
            preventScrolling={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#F1E7CC" gap={24} size={1} />
          </ReactFlow>

          {/* Minimal fit view button in bottom corner */}
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={() => reactFlow.fitView({ padding: 0.25, duration: 400 })}
              aria-label="View entire roadmap"
              title="Fit View"
              className="p-2 rounded-xl bg-surface/90 hover:bg-cream border border-surface-border text-ink shadow-soft-sm transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Overlay tip */}
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-surface/90 backdrop-blur-sm border border-surface-border text-[11px] text-ink-muted">
            Click any step to inspect curated free and paid courses
          </div>
        </div>
      )}

      {/* Side Topic Drawer / Bottom sheet */}
      <TopicDrawer
        isOpen={!!activeDrawerStep}
        step={activeDrawerStep}
        onClose={() => setActiveDrawerStep(null)}
      />
    </div>
  );
}

export default function Roadmap() {
  return (
    <ReactFlowProvider>
      <RoadmapContent />
    </ReactFlowProvider>
  );
}
