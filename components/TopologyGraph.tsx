
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
  const nodeSelectionRef = useRef<d3.Selection<SVGGElement, any, any, any> | null>(null);

  const onNodeClickRef = useRef(onNodeClick);
  const onNodeDoubleClickRef = useRef(onNodeDoubleClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
    onNodeDoubleClickRef.current = onNodeDoubleClick;
  }, [onNodeClick, onNodeDoubleClick]);

  // 高亮活跃节点
  useEffect(() => {
    if (!nodeSelectionRef.current) return;

    nodeSelectionRef.current.select("rect.node-rect")
      .attr("stroke-width", (d: any) => activeNodeIds.has(d.data?.id || d.id) ? 3 : (d.data?.isShadow || d.isShadow ? 1.5 : 2))
      .attr("filter", (d: any) => activeNodeIds.has(d.data?.id || d.id) ? "drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))" : "none")
      .attr("stroke", (d: any) => {
        const nodeData = d.data || d;
        if (activeNodeIds.has(nodeData.id)) return "#22d3ee"; // cyan-400 高亮色
        return getTypeColor(nodeData.type, nodeData.isShadow);
      });

    // 添加/移除脉冲动画类
    nodeSelectionRef.current.classed("node-active", (d: any) => activeNodeIds.has(d.data?.id || d.id));
  }, [activeNodeIds]);

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

    // 构建树形层级结构
    // 1. 只处理 call 类型的链接来构建流量树
    const callLinks = data.links.filter(l => l.type === 'call' || !l.type);

    // 2. 找出入度为0的节点作为根节点候选
    const nodeMap = new Map(data.nodes.map(n => [n.id, { ...n }]));
    const inDegree = new Map<string, number>();
    const outDegree = new Map<string, number>();
    const childrenMap = new Map<string, string[]>();

    data.nodes.forEach(n => {
      inDegree.set(n.id, 0);
      outDegree.set(n.id, 0);
      childrenMap.set(n.id, []);
    });

    callLinks.forEach(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1);
      outDegree.set(sourceId, (outDegree.get(sourceId) || 0) + 1);
      childrenMap.get(sourceId)?.push(targetId);
    });

    // 3. 找出参与流量的节点（有call类型入度或出度的节点）
    const nodesInCallFlow = new Set<string>();
    callLinks.forEach(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      nodesInCallFlow.add(sourceId);
      nodesInCallFlow.add(targetId);
    });

    // 4. 找出所有根节点（入度为0且参与流量的节点）
    const rootNodes = data.nodes.filter(n =>
      (inDegree.get(n.id) || 0) === 0 && nodesInCallFlow.has(n.id)
    );

    // 5. 构建层级数据结构（使用BFS避免循环）
    const visited = new Set<string>();
    const buildHierarchy = (nodeId: string): any => {
      if (visited.has(nodeId)) return null;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const children = (childrenMap.get(nodeId) || [])
        .map(childId => buildHierarchy(childId))
        .filter(Boolean);

      return {
        ...node,
        children: children.length > 0 ? children : undefined
      };
    };

    const hierarchyData = {
      id: '__virtual_root__',
      label: 'Root',
      type: 'virtual',
      children: rootNodes.map(n => {
        visited.clear();
        return buildHierarchy(n.id);
      }).filter(Boolean)
    };

    // 6. 使用 d3.hierarchy 和 d3.tree 创建布局
    const root = d3.hierarchy(hierarchyData);

    // 使用 nodeSize 确保节点不重叠
    const treeLayout = d3.tree<any>()
      .nodeSize([180, 100]) // [水平间距, 垂直间距]
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5));

    treeLayout(root);

    // 7. 过滤掉虚拟根节点，获取实际节点
    const treeNodes = root.descendants().filter(d => d.data.id !== '__virtual_root__');
    const treeLinks = root.links().filter(d => d.source.data.id !== '__virtual_root__');

    // 计算实际边界
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    treeNodes.forEach((d: any) => {
      minX = Math.min(minX, d.x);
      maxX = Math.max(maxX, d.x);
      minY = Math.min(minY, d.y);
      maxY = Math.max(maxY, d.y);
    });

    const nodeRectWidth = 140;
    const nodeRectHeight = 50;
    const contentWidth = maxX - minX + nodeRectWidth;
    const contentHeight = maxY - minY + nodeRectHeight;

    // 计算缩放以适应视口（留出边距）
    const margin = 40;
    const scaleX = (width - margin * 2) / contentWidth;
    const scaleY = (height - margin * 2) / contentHeight;
    const initialScale = Math.min(scaleX, scaleY, 1);

    // 计算内容的中心点
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // 居中偏移：使内容中心与画布中心对齐
    const offsetX = width / 2 - centerX * initialScale;
    const offsetY = height / 2 - centerY * initialScale;

    // 创建主容器
    const g = svg.append("g");

    // 添加缩放和平移支持
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // 设置初始变换 - 居中显示
    svg.call(zoom.transform, d3.zoomIdentity.translate(offsetX, offsetY).scale(initialScale));

    // 定义 defs
    const defs = svg.append("defs");

    // 流量粒子箭头
    defs.append("marker")
      .attr("id", "flow-arrow")
      .attr("viewBox", "0 -3 6 6")
      .attr("refX", 3)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-3L6,0L0,3")
      .attr("fill", "#22d3ee");

    // 绘制连接线
    const linkGroup = g.append("g")
      .selectAll("g")
      .data(treeLinks)
      .join("g");

    // 使用曲线路径
    const linkPath = linkGroup.append("path")
      .attr("id", (d, i) => `link-${i}`)
      .attr("fill", "none")
      .attr("class", "base-link")
      .attr("stroke-width", 2)
      .attr("stroke", "#0891b2")
      .attr("opacity", 0.7)
      .attr("d", (d: any) => {
        // 使用垂直曲线
        const sx = d.source.x;
        const sy = d.source.y;
        const tx = d.target.x;
        const ty = d.target.y;
        const my = (sy + ty) / 2;
        return `M${sx},${sy} C${sx},${my} ${tx},${my} ${tx},${ty}`;
      });

    // 添加多个流动粒子
    [0, 0.33, 0.66].forEach((offset, i) => {
      linkGroup.append("circle")
        .attr("r", 3)
        .attr("fill", "#22d3ee")
        .attr("opacity", 0.8)
        .append("animateMotion")
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite")
        .attr("begin", `${offset * 2}s`)
        .append("mpath")
        .attr("href", (d: any, j: number) => `#link-${j}`);
    });

    // 添加箭头指示器（沿路径移动）
    linkGroup.append("polygon")
      .attr("points", "-4,-3 4,0 -4,3")
      .attr("fill", "#22d3ee")
      .attr("opacity", 0.9)
      .append("animateMotion")
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite")
      .attr("rotate", "auto")
      .append("mpath")
      .attr("href", (d: any, i: number) => `#link-${i}`);

    // 处理非树形链接（dependency, deployment, inferred 类型）
    const nonTreeLinks = data.links
      .filter(l => l.type && l.type !== 'call')
      .map(l => ({
        source: typeof l.source === 'object' ? (l.source as any).id : l.source,
        target: typeof l.target === 'object' ? (l.target as any).id : l.target,
        type: l.type,
        confidence: l.confidence
      }));

    // 创建节点位置映射
    const nodePositions = new Map<string, { x: number, y: number }>();
    treeNodes.forEach((d: any) => {
      nodePositions.set(d.data.id, { x: d.x, y: d.y });
    });

    // 绘制非树形链接
    const extraLinkGroup = g.append("g")
      .selectAll("path")
      .data(nonTreeLinks.filter(l => nodePositions.has(l.source) && nodePositions.has(l.target)))
      .join("path")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke", d => d.type === 'inferred' ? '#c084fc' : d.type === 'deployment' ? '#334155' : '#64748b')
      .attr("stroke-dasharray", d => (d.type === 'dependency' || d.type === 'inferred') ? "6,4" : "none")
      .attr("opacity", d => d.type === 'deployment' ? 0.3 : 0.5)
      .attr("d", d => {
        const source = nodePositions.get(d.source)!;
        const target = nodePositions.get(d.target)!;
        const mx = (source.x + target.x) / 2;
        const my = (source.y + target.y) / 2;
        // 使用弧线区分非树形链接
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.5;
        return `M${source.x},${source.y} Q${mx + dr * 0.3},${my} ${target.x},${target.y}`;
      });

    // 用于更新连接线的函数
    const updateLinks = () => {
      // 更新树形连接线
      linkGroup.select("path.base-link")
        .attr("d", (d: any) => {
          const sx = d.source.x;
          const sy = d.source.y;
          const tx = d.target.x;
          const ty = d.target.y;
          const my = (sy + ty) / 2;
          return `M${sx},${sy} C${sx},${my} ${tx},${my} ${tx},${ty}`;
        });

      // 更新节点位置映射
      treeNodes.forEach((d: any) => {
        nodePositions.set(d.data.id, { x: d.x, y: d.y });
      });

      // 更新非树形连接线
      extraLinkGroup
        .attr("d", (d: any) => {
          const source = nodePositions.get(d.source);
          const target = nodePositions.get(d.target);
          if (!source || !target) return "";
          const mx = (source.x + target.x) / 2;
          const my = (source.y + target.y) / 2;
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * 0.5;
          return `M${source.x},${source.y} Q${mx + dr * 0.3},${my} ${target.x},${target.y}`;
        });
    };

    // 拖拽行为
    const drag = d3.drag<SVGGElement, any>()
      .on("start", function(event, d) {
        d3.select(this).raise().classed("dragging", true);
      })
      .on("drag", function(event, d) {
        d.x = event.x;
        d.y = event.y;
        d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
        updateLinks();
      })
      .on("end", function(event, d) {
        d3.select(this).classed("dragging", false);
      });

    // 绘制节点
    const nodeGroup = g.append("g")
      .selectAll("g")
      .data(treeNodes)
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .attr("cursor", "grab")
      .call(drag)
      .on("click", (e, d: any) => {
        if (!e.defaultPrevented) onNodeClickRef.current(d.data.id);
      })
      .on("dblclick", (e, d: any) => onNodeDoubleClickRef.current?.(d.data.id));

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
      .attr("fill", (d: any) => d.data.isShadow ? "rgba(88, 28, 135, 0.2)" : "#0f172a")
      .attr("stroke", (d: any) => getTypeColor(d.data.type, d.data.isShadow))
      .attr("stroke-width", (d: any) => d.data.isShadow ? 1.5 : 2)
      .attr("stroke-dasharray", (d: any) => d.data.isShadow ? "5,5" : "none")
      .attr("class", "node-rect transition-all duration-300");

    nodeGroup.append("text")
      .text((d: any) => d.data.label)
      .attr("x", 0)
      .attr("y", -6)
      .attr("text-anchor", "middle")
      .attr("fill", (d: any) => d.data.isShadow ? "#a78bfa" : "#e2e8f0")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .style("pointer-events", "none");

    nodeGroup.append("text")
      .text((d: any) => d.data.isShadow ? "INFERRED" : "ONLINE")
      .attr("x", 0)
      .attr("y", 13)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("font-family", "monospace")
      .attr("fill", (d: any) => d.data.isShadow ? "#c084fc" : "#4ade80")
      .style("pointer-events", "none");

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
