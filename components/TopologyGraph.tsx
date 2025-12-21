
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Topology } from '../types';

interface TopologyGraphProps {
  data: Topology;
  activeNodeIds: Set<string>; 
  onNodeClick: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

const TopologyGraph: React.FC<TopologyGraphProps> = ({ data, activeNodeIds, onNodeClick, onNodeDoubleClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);
  const nodeSelectionRef = useRef<d3.Selection<SVGGElement, any, any, any> | null>(null);
  
  const onNodeClickRef = useRef(onNodeClick);
  const onNodeDoubleClickRef = useRef(onNodeDoubleClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
    onNodeDoubleClickRef.current = onNodeDoubleClick;
  }, [onNodeClick, onNodeDoubleClick]);

  const getTypeColor = (type: string, isShadow?: boolean) => {
    if (isShadow) return '#a855f7'; // Purple for discovery
    if (type === 'Database') return '#a855f7'; 
    if (type === 'Gateway') return '#ec4899'; 
    if (type === 'Cache') return '#f59e0b'; 
    if (type === 'Infrastructure') return '#94a3b8'; 
    return '#3b82f6'; 
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = data.nodes.map(n => ({ ...n })) as any[];
    const links = data.links.map(l => ({
        source: typeof l.source === 'object' ? (l.source as any).id : l.source,
        target: typeof l.target === 'object' ? (l.target as any).id : l.target,
        type: l.type || 'call',
        confidence: l.confidence,
        id: `link-${Math.random().toString(36).substr(2, 9)}`
    }));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(180)) 
      .force("charge", d3.forceManyBody().strength(-1500)) 
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(100));

    simulationRef.current = simulation;

    const linkGroup = svg.append("g")
      .selectAll("g")
      .data(links)
      .join("g");

    linkGroup.append("path")
      .attr("id", d => d.id) 
      .attr("fill", "none")
      .attr("class", "base-link")
      .attr("stroke-width", 2)
      .attr("stroke", d => d.type === 'inferred' ? '#c084fc' : d.type === 'deployment' ? '#334155' : '#0891b2')
      .attr("stroke-dasharray", d => (d.type === 'dependency' || d.type === 'inferred') ? "6,4" : "none")
      .attr("opacity", d => d.type === 'inferred' ? 0.6 : 1);

    // Inferred Flow Animation
    linkGroup.filter(d => d.type === 'inferred')
      .append("circle")
      .attr("r", 3)
      .attr("fill", "#c084fc")
      .append("animateMotion")
      .attr("dur", "1.5s")
      .attr("repeatCount", "indefinite")
      .append("mpath")
      .attr("href", d => `#${d.id}`);

    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on("click", (e, d) => onNodeClickRef.current(d.id))
      .on("dblclick", (e, d) => onNodeDoubleClickRef.current?.(d.id));
    
    nodeSelectionRef.current = nodeGroup as any;

    const rectWidth = 140;
    const rectHeight = 50;

    nodeGroup.append("rect")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("x", -rectWidth / 2)
      .attr("y", -rectHeight / 2)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", d => d.isShadow ? "rgba(88, 28, 135, 0.2)" : "#0f172a")
      .attr("stroke", d => getTypeColor(d.type, d.isShadow))
      .attr("stroke-width", d => d.isShadow ? 1.5 : 2)
      .attr("stroke-dasharray", d => d.isShadow ? "5,5" : "none")
      .attr("class", "node-rect transition-all duration-300");

    nodeGroup.append("text")
      .text(d => d.label)
      .attr("x", 0)
      .attr("y", -6)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.isShadow ? "#a78bfa" : "#e2e8f0")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .style("pointer-events", "none");

    nodeGroup.append("text")
      .text(d => d.isShadow ? "INFERRED" : "ONLINE")
      .attr("x", 0)
      .attr("y", 13)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("font-family", "monospace")
      .attr("fill", d => d.isShadow ? "#c084fc" : "#4ade80")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      linkGroup.select("path.base-link").attr("d", (d: any) => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-900 overflow-hidden relative">
      <div className="absolute top-2 left-2 z-10 pointer-events-none p-3 bg-slate-950/40 backdrop-blur rounded-lg border border-slate-800">
        <div className="flex flex-col gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-blue-500"></div> System Node</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded border border-purple-500 border-dashed"></div> Ghost Node (AI Discovered)</div>
          <div className="mt-2 pt-2 border-t border-slate-800">
             <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-cyan-600"></div> Static Link</div>
             <div className="flex items-center gap-2"><div className="w-3 h-0.5 border-t border-dashed border-purple-400"></div> Inferred Traffic</div>
          </div>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default TopologyGraph;
