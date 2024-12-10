import React, { useState, useEffect } from 'react';
import { Image, Loader } from 'lucide-react';
import Widget from '../Widget/Widget';
import { useWalletStore } from '../../store/walletStore';
import { xrplService } from '../../services/xrpl';

interface NFT {
  NFTokenID: string;
  URI?: string;
  Issuer: string;
  TokenTaxon: number;
}

const NFTViewer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { address } = useWalletStore();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;

      try {
        setLoading(true);
        setError(null);

        const client = xrplService.getClient();
        if (!client) throw new Error('Not connected to network');

        const response = await client.request({
          command: 'account_nfts',
          account: address
        });

        setNfts(response.result.account_nfts);
      } catch (error: any) {
        console.error('Failed to fetch NFTs:', error);
        setError(error.message || 'Failed to fetch NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address]);

  const decodeNFTUri = (uri: string): string => {
    try {
      // Handle hex-encoded URIs
      if (uri.startsWith('68747470')) { // hex for 'http'
        return Buffer.from(uri, 'hex').toString('utf8');
      }
      // Handle base64 or other encodings
      return uri;
    } catch (error) {
      console.error('Failed to decode NFT URI:', error);
      return uri;
    }
  };

  return (
    <Widget
      id="nft"
      title="NFT Viewer"
      icon={Image}
      defaultPosition={{ x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 }}
      defaultSize={{ width: 600, height: 400 }}
      onClose={onClose}
    >
      <div className="h-full overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center text-text/50 p-4">
            No NFTs found in this wallet
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {nfts.map((nft) => (
              <div
                key={nft.NFTokenID}
                className="bg-background/50 border border-primary/30 rounded-lg p-4 space-y-2"
              >
                {nft.URI && (
                  <div className="aspect-square bg-background/30 rounded-lg overflow-hidden">
                    <img
                      src={decodeNFTUri(nft.URI)}
                      alt={`NFT ${nft.NFTokenID}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIi8+PC9zdmc+';
                      }}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-sm font-medium text-primary">
                    Token ID: {nft.NFTokenID.slice(0, 8)}...{nft.NFTokenID.slice(-8)}
                  </div>
                  <div className="text-xs text-text/70">
                    Issuer: {nft.Issuer.slice(0, 8)}...{nft.Issuer.slice(-8)}
                  </div>
                  <div className="text-xs text-text/70">
                    Taxon: {nft.TokenTaxon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Widget>
  );
};

export default NFTViewer;