import { ArrowUpLeft, ChevronDown, ChevronUp, Maximize2 } from "lucide-react";

export function FloatingRingPip({
  visible,
  collapsed,
  onCollapse,
  onExpand,
  onStory,
}: {
  visible: boolean;
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  onStory: () => void;
}) {
  return (
    <aside
      className="ring-pip-card"
      data-visible={visible}
      data-collapsed={collapsed}
      inert={!visible}
      aria-label="Your live 3D ring studio"
    >
      <div className="pip-heading">
        <span className="eyebrow">Your ring, your way</span>
        <button
          aria-label={collapsed ? "Show 3D mini studio" : "Collapse 3D mini studio"}
          aria-expanded={!collapsed}
          onClick={onCollapse}
        >
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      <div className="pip-canvas-space" aria-hidden="true" />
      <div className="pip-actions">
        <small>Drag to rotate · arrows when focused</small>
        <button onClick={onExpand}>
          Open your studio <Maximize2 size={14} />
        </button>
        <button className="pip-back" onClick={onStory}>
          <ArrowUpLeft size={13} /> Back to the 3D story
        </button>
      </div>
    </aside>
  );
}
