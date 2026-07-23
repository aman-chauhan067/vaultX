import { useState, useEffect, useMemo } from 'react';
import { VaultXService } from '../services/VaultXService.js';
import { useActiveWallet, useNetwork } from './index.js';
import { DEFAULT_NFTS } from '../config/nfts.js';
import type { NFT } from '@vaultx/network-engine';

export interface NFTCollection {
  contractAddress: string;
  name: string;
  nfts: NFT[];
}

export function useNFTs() {
  const activeWallet = useActiveWallet();
  const { activeChainId } = useNetwork();

  const [allNfts, setAllNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  const fetchNFTs = async (forceRefresh = false) => {
    if (!activeWallet || !activeChainId) return;

    setIsLoading(true);
    setError(null);
    try {
      const vaultXService = VaultXService.getInstance();

      // Filter known NFTs by active chain
      const knownNfts = DEFAULT_NFTS.filter((n) => n.chainId === activeChainId);

      const discovered = await vaultXService.assetManager.discoverNFTs(
        knownNfts,
        activeChainId,
        activeWallet.address
      );

      setAllNfts(discovered);
    } catch (err: any) {
      console.error('Failed to fetch NFTs', err);
      setError(err.message || 'Failed to fetch NFT data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset pagination on network/wallet change
    fetchNFTs();
  }, [activeWallet?.address, activeChainId]);

  // Filtering logic
  const filteredNfts = useMemo(() => {
    if (!searchQuery.trim()) return allNfts;
    const query = searchQuery.toLowerCase();
    return allNfts.filter(
      (nft) =>
        nft.name.toLowerCase().includes(query) ||
        nft.collectionName.toLowerCase().includes(query) ||
        nft.tokenId.toLowerCase().includes(query)
    );
  }, [allNfts, searchQuery]);

  // Derived state: Collections (only up to current page)
  const visibleNfts = useMemo(() => {
    return filteredNfts.slice(0, page * PAGE_SIZE);
  }, [filteredNfts, page]);

  const collections = useMemo(() => {
    const grouped = visibleNfts.reduce(
      (acc, nft) => {
        const key = nft.contractAddress.toLowerCase();
        if (!acc[key]) {
          acc[key] = {
            contractAddress: nft.contractAddress,
            name: nft.collectionName,
            nfts: []
          };
        }
        acc[key].nfts.push(nft);
        return acc;
      },
      {} as Record<string, NFTCollection>
    );

    return Object.values(grouped);
  }, [visibleNfts]);

  const hasMore = visibleNfts.length < filteredNfts.length;

  const loadMore = () => {
    if (hasMore) {
      setPage((p) => p + 1);
    }
  };

  return {
    nfts: filteredNfts,
    collections,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    refreshNFTs: () => fetchNFTs(true),
    loadMore,
    hasMore,
    isPaginating: false // We do client-side pagination here, so it's instantaneous
  };
}
