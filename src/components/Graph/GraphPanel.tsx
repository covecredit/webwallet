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
import { GRAPH_COLORS, NODE_SIZES } from '../../constants/colors';
import { addToSearchHistory } from '../../utils/searchHistory';

const GraphPanel: React.FC = () => {
  const { isConnected } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: any;
  } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const fgRef = useRef<any>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchGraphData = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await graphService.buildTransactionGraph(searchTerm);
      setGraphData(data);
      setSelectedNode(data.nodes[0]);
      addToSearchHistory(searchTerm);

      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 50);
          fgRef.current.centerAt(0, 0, 1000);
        }
      }, 100);
    } catch (error: any) {
      console.error('Failed to fetch graph data:', error);
      setError(error.message || 'Failed to fetch data');
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
    setContextMenu(null);
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
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  }, [contextMenu]);

  return (
    <Widget
      id="graph"
      title="Chain Explorer"
      icon={Activity}
      defaultPosition={{ x: 360, y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN }}
      defaultSize={{ width: 1000, height: 600 }}
    >
      <div className="p-4 space-y-4">
        {isConnected ? (
          <>
            <div className="relative">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchHistory(true)}
                  onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                  placeholder="Enter XRPL address, transaction hash, or ledger sequence..."
                  className="flex-1 px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                           text-text placeholder-text/50 focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg 
                           transition-colors flex items-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </form>

              {showSearchHistory && (
                <SearchHistory
                  onSelect={(term) => {
                    setSearchQuery(term);
                    fetchGraphData(term);
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
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel="label"
                    nodeColor={(node: any) => GRAPH_COLORS[node.type] || GRAPH_COLORS.TRANSACTION}
                    nodeVal={(node: any) => NODE_SIZES[node.type] || NODE_SIZES.TRANSACTION}
                    linkColor={() => GRAPH_COLORS.LINK}
                    linkWidth={1.5}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleWidth={2}
                    linkDirectionalParticleColor={() => GRAPH_COLORS.PARTICLE}
                    onNodeClick={handleNodeClick}
                    onNodeRightClick={handleNodeRightClick}
                    backgroundColor="transparent"
                  />
                  <GraphControls
                    onZoomIn={() => fgRef.current?.zoomIn()}
                    onZoomOut={() => fgRef.current?.zoomOut()}
                    onCenter={() => {
                      fgRef.current?.centerAt(0, 0, 1000);
                      fgRef.current?.zoomToFit(400);
                    }}
                    onReset={() => {
                      setGraphData({ nodes: [], links: [] });
                      setSelectedNode(null);
                      setSearchQuery('');
                    }}
                  />
                </>
              )}
            </div>

            <AccountInfo selectedNode={selectedNode} />

            {contextMenu && (
              <GraphContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                node={contextMenu.node}
                onClose={() => setContextMenu(null)}
                onSearch={handleContextMenuSearch}
                onCopy={handleContextMenuCopy}
                copiedAddress={copiedAddress}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-text/50">
            Connect your wallet to explore the XRPL chain
          </div>
        )}
      </div>
    </Widget>
  );
};

export default GraphPanel;