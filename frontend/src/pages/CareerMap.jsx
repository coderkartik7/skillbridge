import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sparkles, Maximize2, ArrowRight } from 'lucide-react';
import RoleNode from '../components/RoleNode';
import RiskGauge from '../components/RiskGauge';
import SkillChips from '../components/SkillChips';
import EmptyState from '../components/EmptyState';
import { calculateRadialPositions } from '../lib/layout';
import { getRoleOptionMeta } from '../lib/format';

// Custom node types registered outside components to prevent re-renders
const nodeTypes = {
  roleNode: RoleNode,
};

function CareerMapContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const reactFlowInstance = useReactFlow();

  // Redirect to "/" if opened without router state
  useEffect(() => {
    if (!location.state?.analyzeData) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const analyzeData = location.state?.analyzeData;
  const currentRole = analyzeData?.current_role || { title: 'Current Role', code: '' };
  const riskScore = analyzeData?.risk_score ?? 50;
  const riskLabel = analyzeData?.risk_label || 'Medium';
  const skills = analyzeData?.skills || [];
  const options = analyzeData?.options || [];

  // Selected target role option state
  const [selectedOptionCode, setSelectedOptionCode] = useState(
    options.length > 0 ? options[0].code : null
  );

  const selectedOption = useMemo(
    () => options.find((opt) => opt.code === selectedOptionCode) || null,
    [options, selectedOptionCode]
  );

  // Calculate layout nodes & edges
  const { nodes, edges } = useMemo(() => {
    if (!options || options.length === 0) {
      return { nodes: [], edges: [] };
    }

    const CENTER_X = 450;
    const CENTER_Y = 280;

    // Center Node: Current Role
    const centerNode = {
      id: 'current-role',
      type: 'roleNode',
      position: { x: CENTER_X - 140, y: CENTER_Y - 70 },
      data: {
        isCurrent: true,
        title: currentRole.title,
        code: currentRole.code,
      },
      draggable: false,
    };

    // Radial layout for target options
    const positionedOptions = calculateRadialPositions(options, CENTER_X, CENTER_Y, 320);

    const optionNodes = positionedOptions.map((opt) => {
      const isSelected = opt.code === selectedOptionCode;
      return {
        id: opt.code,
        type: 'roleNode',
        position: opt.position,
        data: {
          isCurrent: false,
          code: opt.code,
          title: opt.title,
          label: opt.label,
          score: opt.score,
          is_trending: opt.is_trending,
          isSelected,
          onClick: () => setSelectedOptionCode(opt.code),
        },
        draggable: false,
      };
    });

    // Edges with arrowheads pointing FROM current role TO option
    const edgeList = options.map((opt) => {
      const isSelected = opt.code === selectedOptionCode;
      const meta = getRoleOptionMeta(opt.label);

      return {
        id: `edge-${opt.code}`,
        source: 'current-role',
        target: opt.code,
        animated: true,
        type: 'smoothstep',
        label: meta.text,
        labelStyle: {
          fill: '#1F1B16',
          fontWeight: 600,
          fontSize: 11,
          fontFamily: 'Inter, sans-serif',
        },
        labelBgStyle: {
          fill: '#FFFDF7',
          fillOpacity: 0.95,
          stroke: '#F1E7CC',
          strokeWidth: 1,
          rx: 6,
          ry: 6,
        },
        labelBgPadding: [6, 4],
        style: {
          stroke: isSelected ? '#1F1B16' : '#FFA259',
          strokeWidth: isSelected ? 2.5 : 1.75,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSelected ? '#1F1B16' : '#FFA259',
          width: 16,
          height: 16,
        },
      };
    });

    return {
      nodes: [centerNode, ...optionNodes],
      edges: edgeList,
    };
  }, [options, currentRole, selectedOptionCode]);

  // Fit view on initial load or node changes
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
    }
  }, [reactFlowInstance, nodes.length]);

  const handleBuildRoadmap = () => {
    if (!selectedOption) return;
    navigate('/roadmap', {
      state: {
        role: {
          code: selectedOption.code,
          title: selectedOption.title,
        },
        skills: skills,
      },
    });
  };

  if (!analyzeData) return null;

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Top summary strip (above map) */}
      <div className="bg-surface rounded-2xl border border-surface-border p-5 md:p-6 mb-6 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Current role & verified skills */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
                Verified Profile
              </span>
            </div>
            <h1 className="text-2xl font-bold text-ink mb-3">{currentRole.title}</h1>

            {/* Skill chips */}
            <div>
              <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                Your extracted skills ({skills.length}):
              </div>
              <SkillChips skills={skills} />
            </div>
          </div>

          {/* Semicircular risk gauge */}
          <div className="flex-shrink-0">
            <RiskGauge score={riskScore} label={riskLabel} />
          </div>
        </div>
      </div>

      {/* Empty State if options array is empty */}
      {options.length === 0 ? (
        <EmptyState
          title="No close matches yet"
          description="We couldn't identify direct pivot roles with high confidence. Try adding more skills or project details to your resume."
          actionText="Try with another resume"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="flex flex-col flex-1">
          {/* Desktop/Tablet React Flow Visualizer */}
          <div className="hidden md:block relative w-full h-[520px] rounded-2xl border border-surface-border bg-surface-warm shadow-soft overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
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

            {/* Minimal fit-view control in top-right */}
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={() => reactFlowInstance.fitView({ padding: 0.2, duration: 300 })}
                aria-label="Fit view to show all career paths"
                title="Fit View"
                className="p-2 rounded-xl bg-surface/90 hover:bg-cream border border-surface-border text-ink shadow-soft-sm transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Fallback: Vertical Stack */}
          <div className="md:hidden space-y-4">
            <div className="p-4 rounded-2xl bg-surface border-2 border-surface-border text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
                Current Role
              </span>
              <h3 className="text-base font-bold text-ink mt-2">{currentRole.title}</h3>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted px-1">
              Select a target role option:
            </div>

            <div className="space-y-3">
              {options.map((opt) => {
                const isSelected = opt.code === selectedOptionCode;
                return (
                  <div
                    key={opt.code}
                    onClick={() => setSelectedOptionCode(opt.code)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cream ring-2 ring-ink shadow-soft'
                        : 'bg-surface border border-surface-border hover:border-amber'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface border">
                        {opt.label.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-ink">{opt.score}% match</span>
                    </div>
                    <h4 className="font-bold text-sm text-ink mb-2">{opt.title}</h4>
                    <div className="w-full h-1.5 bg-surface-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber rounded-full"
                        style={{ width: `${opt.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Bar when an option is selected */}
          {selectedOption && (
            <div className="sticky bottom-4 mt-6 z-30 p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border shadow-soft-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Selected Pivot
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-ink">{selectedOption.title}</h3>
                <p className="text-xs sm:text-sm text-ink-muted">
                  You already have <strong className="text-ink">{selectedOption.score}%</strong> of the skills required for this role.
                </p>
              </div>

              <button
                type="button"
                onClick={handleBuildRoadmap}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber hover:bg-amber/90 text-ink font-bold text-sm shadow-soft transition-all focus:ring-2 focus:ring-amber focus:ring-offset-2 flex-shrink-0"
              >
                <span>Build my roadmap</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CareerMap() {
  return (
    <ReactFlowProvider>
      <CareerMapContent />
    </ReactFlowProvider>
  );
}
