import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { Trash2 } from "lucide-react";

export default function DefaultEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 15,
  });

  const onEdgeClick = () => {
    console.log("onEdgeClick", id);
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <svg>
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 16"
            refX="12"
            refY="8"
            markerWidth="4"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 8 L 0 16 z" fill="gray" />
          </marker>
        </defs>
      </svg>

      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd="url(#arrowhead)"
      />

      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: "all",
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            <button
              className="rounded-full bg-white p-1 shadow-md"
              onClick={onEdgeClick}
            >
              <Trash2 className="text-red-500" size={16} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
