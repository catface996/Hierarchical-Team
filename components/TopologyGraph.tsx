import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Topology } from '../types';

interface TopologyGraphProps {
  data: Topology;
  activeNodeIds: Set<string>; // Nodes currently involved in a task
  onNodeClick: (nodeId: string) => void;
}

const TopologyGraph: React.FC<TopologyGraphProps> = ({ data, activeNodeIds, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Keep refs to simulation and selection to update them without full re-render
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);
  const nodeSelectionRef = useRef<d3.Selection<SVGGElement, any, any, any> | null>(null);
  
  // Use a ref for the click handler to avoid re-running the effect when the function reference changes
  const onNodeClickRef = useRef(onNodeClick);
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // 1. Initialization Effect - Runs only when topology data structure changes
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous only on data change

    // --- Graph Logic ---
    
    // Calculate Levels (BFS)
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    data.nodes.forEach(n => {
      adj.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    const safeLinks = data.links.map(l => ({
        source: typeof l.source === 'object' ? (l.source as any).id : l.source,
        target: typeof l.target === 'object' ? (l.target as any).id : l.target
    }));

    safeLinks.forEach(l => {
      adj.get(l.source)?.push(l.target);
      inDegree.set(l.target, (inDegree.get(l.target) || 0) + 1);
    });

    const levels = new Map<string, number>();
    const queue: { id: string, lvl: number }[] = [];

    data.nodes.forEach(n => {
      if ((inDegree.get(n.id) || 0) === 0) {
        queue.push({ id: n.id, lvl: 0 });
        levels.set(n.id, 0);
      }
    });

    while (queue.length > 0) {
      const { id, lvl } = queue.shift()!;
      const neighbors = adj.get(id) || [];
      neighbors.forEach(targetId => {
        if (!levels.has(targetId)) {
          levels.set(targetId, lvl + 1);
          queue.push({ id: targetId, lvl: lvl + 1 });
        }
      });
    }

    data.nodes.forEach(n => {
      if (!levels.has(n.id)) levels.set(n.id, 0);
    });

    let maxLevel = 0;
    levels.forEach(l => { if (l > maxLevel) maxLevel = l; });

    // D3 Data
    const nodes = data.nodes.map(n => ({ ...n, level: levels.get(n.id) || 0 })) as (d3.SimulationNodeDatum & { id: string, type: string, label: string, level: number })[];
    const links = safeLinks.map(l => ({ ...l }));

    // Store tree geometry for resize calculations
    const levelHeight = 80;
    const treeHeight = maxLevel * levelHeight;
    (svgRef.current as any).__treeHeight = treeHeight; // Hacky storage on DOM node or use another ref, using ref below is better

    // Simulation Setup
    const topMargin = Math.max(50, (height - treeHeight) / 2);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide().radius(35))
      .force("y", d3.forceY((d: any) => topMargin + (d.level * levelHeight)).strength(2)) 
      .force("x", d3.forceX(width / 2).strength(0.3));

    simulationRef.current = simulation;

    // Drawing
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 24)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#64748b");

    const link = svg.append("g")
      .attr("stroke", "#334155")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("click", (event, d) => onNodeClickRef.current(d.id));
    
    // Fix: Explicitly cast the selection to match the ref type
    nodeSelectionRef.current = nodeGroup as unknown as d3.Selection<SVGGElement, any, any, any>;

    // Node Visuals
    nodeGroup.append("circle")
      .attr("r", 20)
      .attr("fill", (d) => {
        if (d.type === 'Database') return '#a855f7';
        if (d.type === 'Gateway') return '#ec4899';
        if (d.type === 'Cache') return '#f59e0b';
        return '#3b82f6';
      })
      .attr("class", "node-circle transition-all duration-300") // base class
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 2);

    nodeGroup.append("text")
      .text(d => d.type === 'Database' ? 'DB' : d.type === 'Gateway' ? 'GW' : d.type === 'Cache' ? 'CH' : 'SV')
      .attr("x", 0)
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .style("pointer-events", "none");

    nodeGroup.append("text")
      .text(d => d.label)
      .attr("x", 0)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .style("pointer-events", "none")
      .style("text-shadow", "0px 1px 2px #000");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
        simulation.stop();
    };
  }, [data]); // Only run when topology data changes

  // 2. Visual Update Effect - Runs when active status changes (lightweight)
  useEffect(() => {
      if (!nodeSelectionRef.current) return;
      
      nodeSelectionRef.current.select("circle")
        .attr("stroke", (d: any) => activeNodeIds.has(d.id) ? "#ffffff" : "#1e293b")
        .attr("stroke-width", (d: any) => activeNodeIds.has(d.id) ? 3 : 2)
        .attr("class", (d: any) => activeNodeIds.has(d.id) ? "node-circle animate-pulse cursor-pointer" : "node-circle cursor-pointer transition-colors hover:stroke-cyan-400");
  }, [activeNodeIds]);

  // 3. Resize Effect - Update simulation forces without destroying DOM
  useEffect(() => {
      if (!containerRef.current || !simulationRef.current || !svgRef.current) return;

      const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
              const { width, height } = entry.contentRect;
              
              const simulation = simulationRef.current;
              if (!simulation) return;

              // Recalculate forces based on new dimensions
              // We need treeHeight from the data scope. 
              // Since we don't want to store state causing re-renders, we can re-calculate or retrieve stored value.
              // Let's retrieve from the stash we did in init.
              const treeHeight = (svgRef.current as any).__treeHeight || 400;
              const levelHeight = 80;
              const topMargin = Math.max(50, (height - treeHeight) / 2);

              simulation.force("x", d3.forceX(width / 2).strength(0.3));
              simulation.force("y", d3.forceY((d: any) => topMargin + (d.level * levelHeight)).strength(2));
              
              // Gently reheat the simulation to drift to new center
              simulation.alpha(0.3).restart();
          }
      });

      resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-900 overflow-hidden relative">
       <div className="absolute top-2 left-2 z-10 pointer-events-none">
        <div className="flex flex-col gap-1 text-[9px] text-slate-400 opacity-70">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Service</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> DB</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Gateway</span>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default TopologyGraph;