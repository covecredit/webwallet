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

  const fetchGraphData = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (searchTerm.startsWith('r') && searchTerm.length >= 25) {
        // Account address
        data = await graphService.buildTransactionGraph(searchTerm, { limit: 50 });
      } else if (/^[A-F0-9]{64}$/i.test(searchTerm)) {
        // Transaction hash
        data = await graphService.buildTransactionGraph(searchTerm, { type: 'transaction' });
      } else if (/^\d+$/.test(searchTerm)) {
        // Ledger sequence
        data = await graphService.buildTransactionGraph(searchTerm, { type: 'ledger' });
      } else {
        throw new Error('Invalid search term. Enter an account address, transaction hash, or ledger sequence.');
      }

      setGraphData(data);
      setSelectedNode(data.nodes[0]);

      // Add to search history
      const history = loadFromStorage<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || [];
      const newHistory = [searchTerm, ...history.filter(term => term !== searchTerm)]
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
    setSearchQuery(node.id);
    fetchGraphData(node.id);
  }, [fetchGraphData]);

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
                placeholder="Enter XRPL address, transaction hash, or ledger sequence..."
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
            {/* Rest of the component remains the same */}
          </div>

          <AccountInfo selectedNode={selectedNode} />
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