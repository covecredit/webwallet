import React, { useState, useCallback, useRef } from 'react';
import { Activity, Search } from 'lucide-react';
import Widget from '../Widget/Widget';
import ForceGraph2D from 'react-force-graph-2d';
import { useWalletStore } from '../../store/walletStore';
import { graphService } from '../../services/graph';
import { GraphData } from '../../services/graph/types';
import GraphControls from './GraphControls';
import AccountInfo from './AccountInfo';
import { SearchHistory } from './SearchHistory';
import GraphContextMenu from './GraphContextMenu';
import { LAYOUT } from '../../constants/layout';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storage';

const GraphPanel: React.FC = () => {
  const { isConnected } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: any;
  } | null>(null);
  const fgRef = useRef<any>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchGraphData = useCallback(async (searchAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await graphService.buildTransactionGraph(searchAddress, { limit: 50 });
      setGraphData(data);
      setSelectedNode(data.nodes.find(node => node.id === searchAddress));

      // Add to search history
      const history = loadFromStorage<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || [];
      const newHistory = [searchAddress, ...history.filter(addr => addr !== searchAddress)]
        .slice(0, 10);
      saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, newHistory);

      // Center graph after data loads
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 50);
          fgRef.current.centerAt(0, 0, 1000);
        }
      }, 100);
    } catch (error: any) {
      console.error('Failed to fetch graph data:', error);
      setError(error.message || 'Failed to fetch transaction data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) {
      setGraphData({ nodes: [], links: [] });
      return;
    }
    await fetchGraphData(searchQuery);
  };

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  const handleNodeRightClick = useCallback((node: any, event: any) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      node
    });
  }, []);

  const handleContextMenuSearch = useCallback(() => {
    if (contextMenu?.node) {
      setSearchQuery(contextMenu.node.id);
      fetchGraphData(contextMenu.node.id);
      setContextMenu(null);
    }
  }, [contextMenu, fetchGraphData]);

  const handleContextMenuCopy = useCallback(async () => {
    if (contextMenu?.node) {
      try {
        await navigator.clipboard.writeText(contextMenu.node.id);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
      setContextMenu(null);
    }
  }, [contextMenu]);

  return (
    <Widget
      id="graph"
      title="Chain eXplorer"
      icon={Activity}
      defaultPosition={{ x: 360, y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN }}
      defaultSize={{ width: 1000, height: 600 }}
    >
      {isConnected ? (
        <div className="space-y-4 p-4">
          <div className="relative">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchHistory(true)}
                onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                placeholder="Enter XRPL address to explore..."
                className="flex-1 px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                         text-text placeholder-text/50 focus:outline-none focus:border-primary"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button
                type="submit"
                className="px-4 py-2 hover:text-primary text-primary/70 rounded-lg 
                         transition-colors flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </form>

            {showSearchHistory && (
              <SearchHistory
                onSelect={(address) => {
                  setSearchQuery(address);
                  fetchGraphData(address);
                }}
              />
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="relative h-[350px] border border-primary/30 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
              </div>
            ) : graphData.nodes.length > 0 ? (
              <>
                <ForceGraph2D
                  ref={fgRef}
                  graphData={graphData}
                  nodeLabel="label"
                  nodeColor={(node: any) => node.type === 'wallet' ? '#4169E1' : '#FF8C00'}
                  nodeRelSize={6}
                  linkColor={() => 'rgba(65, 105, 225, 0.2)'}
                  linkWidth={1}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleWidth={2}
                  linkDirectionalParticleSpeed={0.005}
                  backgroundColor="transparent"
                  onNodeClick={handleNodeClick}
                  onNodeRightClick={handleNodeRightClick}
                  onNodeHover={setHoveredNode}
                  d3AlphaDecay={0.02}
                  d3VelocityDecay={0.3}
                  d3Force="charge"
                  d3ForceStrength={-1000}
                  cooldownTime={2000}
                  nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    const label = node.label;
                    const fontSize = 12/globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    
                    ctx.fillStyle = node.type === 'wallet' ? '#4169E1' : '#FF8C00';
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#E6E8E6';
                    
                    const firstLine = label.split('\n')[0];
                    ctx.fillText(firstLine, node.x, node.y + 10);
                  }}
                />
                <GraphControls
                  onZoomIn={() => fgRef.current?.zoom(2)}
                  onZoomOut={() => fgRef.current?.zoom(0.5)}
                  onCenter={() => {
                    fgRef.current?.centerAt();
                    fgRef.current?.zoom(1);
                  }}
                  onReset={() => {
                    fgRef.current?.centerAt();
                    fgRef.current?.zoom(1);
                    fgRef.current?.d3ReheatSimulation();
                  }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-text/50">
                Enter an XRPL address to explore transactions
              </div>
            )}
          </div>

          <AccountInfo selectedNode={selectedNode} />

          {contextMenu && (
            <GraphContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              node={contextMenu.node}
              onSearch={handleContextMenuSearch}
              onCopy={handleContextMenuCopy}
              onClose={() => setContextMenu(null)}
            />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-text/50">
          Connect your wallet to explore the XRPL chain
        </div>
      )}
    </Widget>
  );
};

export default GraphPanel;
