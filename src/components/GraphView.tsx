import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useApp, NoteFile } from '@/store/AppContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ForceGraph2D from 'react-force-graph-2d';

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  folder: string;
}

interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

// Folder color palette
const FOLDER_COLORS = [
  'hsl(160, 84%, 39%)', // primary green
  'hsl(220, 70%, 55%)', // blue
  'hsl(280, 60%, 55%)', // purple
  'hsl(30, 80%, 55%)',  // orange
  'hsl(340, 70%, 55%)', // pink
  'hsl(50, 80%, 50%)',  // yellow
  'hsl(180, 60%, 45%)', // teal
  'hsl(10, 70%, 55%)',  // red-orange
];

export function GraphView() {
  const { showGraph, setShowGraph, files, loadFile } = useApp();
  const graphRef = useRef<any>(null);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const allFiles: NoteFile[] = [];

    const walk = (items: NoteFile[]) => {
      for (const item of items) {
        if (item.isFolder && item.children) walk(item.children);
        else allFiles.push(item);
      }
    };
    walk(files);

    // Map folders to colors
    const folderSet = new Set<string>();
    allFiles.forEach(f => {
      const parts = f.path.split('/');
      folderSet.add(parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)');
    });
    const folderList = Array.from(folderSet);
    const folderColorMap: Record<string, string> = {};
    folderList.forEach((folder, i) => {
      folderColorMap[folder] = FOLDER_COLORS[i % FOLDER_COLORS.length];
    });

    for (const file of allFiles) {
      const parts = file.path.split('/');
      const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)';
      nodes.push({
        id: file.path,
        name: file.name.replace('.md', ''),
        val: 1,
        color: folderColorMap[folder],
        folder,
      });
    }

    // Build links with weight (count of references between two notes)
    const linkWeightMap: Record<string, number> = {};
    for (const file of allFiles) {
      if (!file.content) continue;
      const matches = file.content.match(/\[\[([^\]]+)\]\]/g);
      if (!matches) continue;
      for (const match of matches) {
        const linkName = match.slice(2, -2).trim().toLowerCase();
        const target = allFiles.find(f => f.name.replace('.md', '').toLowerCase() === linkName);
        if (target && target.path !== file.path) {
          const key = [file.path, target.path].sort().join('|||');
          linkWeightMap[key] = (linkWeightMap[key] || 0) + 1;
        }
      }
    }

    for (const [key, weight] of Object.entries(linkWeightMap)) {
      const [source, target] = key.split('|||');
      links.push({ source, target, weight });
    }

    // Mark orphans with dimmed color
    const connectedIds = new Set<string>();
    links.forEach(l => { connectedIds.add(l.source as string); connectedIds.add(l.target as string); });
    for (const node of nodes) {
      if (!connectedIds.has(node.id)) {
        node.color = 'hsl(0, 0%, 35%)'; // dim gray for orphans
      }
    }

    return { nodes, links };
  }, [files]);

  const handleNodeClick = useCallback((node: any) => {
    loadFile(node.id);
    setShowGraph(false);
  }, [loadFile, setShowGraph]);

  useEffect(() => {
    if (showGraph && graphRef.current) {
      graphRef.current.d3Force('charge')?.strength(-200);
    }
  }, [showGraph]);

  const maxWeight = useMemo(() => {
    return Math.max(1, ...graphData.links.map(l => l.weight));
  }, [graphData.links]);

  return (
    <Dialog open={showGraph} onOpenChange={setShowGraph}>
      <DialogContent className="bg-card shadow-elevated border-0 sm:max-w-4xl h-[80vh] p-0 overflow-hidden">
        {/* Legend */}
        <div className="absolute top-3 left-3 z-10 bg-card/90 rounded-lg p-2 space-y-1 backdrop-blur-sm">
          {Object.entries(
            graphData.nodes.reduce<Record<string, string>>((acc, n) => {
              if (!acc[n.folder]) acc[n.folder] = n.color;
              return acc;
            }, {})
          ).map(([folder, color]) => (
            <div key={folder} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="truncate max-w-[120px]">{folder}</span>
            </div>
          ))}
        </div>

        <div className="w-full h-full">
          {showGraph && (
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeLabel="name"
              nodeColor="color"
              nodeRelSize={6}
              linkColor={() => 'hsla(220, 10%, 60%, 0.25)'}
              linkWidth={(link: any) => Math.max(0.5, (link.weight / maxWeight) * 4)}
              onNodeClick={handleNodeClick}
              backgroundColor="transparent"
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const label = node.name;
                const fontSize = 11 / globalScale;
                ctx.font = `${fontSize}px Inter, sans-serif`;

                // Node circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = node.color;
                ctx.fill();

                // Label
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'hsl(220, 10%, 70%)';
                ctx.fillText(label, node.x, node.y + 6);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
