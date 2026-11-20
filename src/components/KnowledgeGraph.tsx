import React, { useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { vault } from '../lib/vault-engine';

const KnowledgeGraph: React.FC = () => {
  const graphRef = useRef<any>(null);
  const [data, setData] = useState(() => vault.getGraphData());

  useEffect(() => {
    const updateData = () => {
      setData(vault.getGraphData());
    };
    const unsub = vault.subscribe(updateData);
    return unsub;
  }, []);

  return (
    <div className="h-full relative overflow-hidden glass-card border border-white/10 rounded-2xl">
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1 pointer-events-none">
        <h2 className="font-heading text-xl md:text-2xl font-black text-white/90">
          CODEBASE <span className="text-[#00fff2]">GRAPH</span>
        </h2>
        <p className="text-[11px] text-[#9ca3af] uppercase tracking-widest font-mono">
          Interactive Topology Map ({data.nodes.length} nodes · {data.links.length} links)
        </p>
      </div>

      {/* Graph Toolbar */}
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <ControlButton
          icon={<ZoomIn size={16} />}
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.25, 300)}
          title="확대"
        />
        <ControlButton
          icon={<ZoomOut size={16} />}
          onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 0.8, 300)}
          title="축소"
        />
        <ControlButton
          icon={<Maximize size={16} />}
          onClick={() => graphRef.current?.zoomToFit(400, 40)}
          title="전체 화면 맞춤"
        />
      </div>

      <div className="w-full h-full bg-[#02040a]">
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeLabel="id"
          nodeColor={(node: any) => {
            if (node.id.endsWith('.tsx')) return '#00fff2';
            if (node.id.endsWith('.ts')) return '#b026ff';
            if (node.id.endsWith('.css') || node.id.endsWith('.json')) return '#ffffff';
            return '#3b82f6';
          }}
          nodeRelSize={6}
          linkColor={() => 'rgba(255, 255, 255, 0.15)'}
          linkWidth={1.2}
          backgroundColor="#02040a"
          nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
            const label = node.id;
            const fontSize = Math.max(10 / globalScale, 3);
            ctx.font = `${fontSize}px Inter, sans-serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth + 4, fontSize + 4];

            ctx.fillStyle = 'rgba(2, 4, 10, 0.85)';
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              bckgDimensions[0],
              bckgDimensions[1]
            );

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color || '#00fff2';
            ctx.fillText(label, node.x, node.y);

            node.__bckgDimensions = bckgDimensions;
          }}
        />
      </div>

      {/* Graph Legend */}
      <div className="absolute bottom-6 left-6 z-10 glass-card p-3 flex flex-wrap gap-4 border border-white/5">
        <LegendItem color="#00fff2" label="React Components (.tsx)" />
        <LegendItem color="#b026ff" label="Core Logic / Engine (.ts)" />
        <LegendItem color="#3b82f6" label="Modules / Libraries" />
      </div>
    </div>
  );
};

const ControlButton = ({ icon, onClick, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className="p-2.5 rounded-xl glass-card hover:bg-white/10 hover:text-[#00fff2] text-gray-300 transition-colors"
  >
    {icon}
  </button>
);

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-[10px] font-semibold text-gray-300">{label}</span>
  </div>
);

export default KnowledgeGraph;
