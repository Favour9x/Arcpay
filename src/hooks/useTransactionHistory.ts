import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Transaction } from '../types';

export function useTransactionHistory() {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!address || !isConnected) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://testnet.arcscan.app/api?module=account&action=txlist&address=${address}&sort=desc`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        // Transform ArcScan API response to our Transaction type
        const formattedTxs: Transaction[] = data.result.slice(0, 20).map((tx: any) => {
          // Determine transaction type based on method or value
          let type: Transaction['type'] = 'SEND';
          if (tx.functionName?.includes('swap')) type = 'SWAP';
          else if (tx.functionName?.includes('bridge')) type = 'BRIDGE';
          else if (tx.functionName?.includes('unified')) type = 'UNIFIED DEPOSIT';

          // Determine status
          let status: Transaction['status'] = 'success';
          if (tx.isError === '1') status = 'failed';
          else if (tx.confirmations === '0') status = 'pending';

          // Format amount (convert from 6 decimals to readable format)
          const amount = (parseInt(tx.value) / 1e6).toFixed(2);

          // Format timestamp
          const timestamp = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString();

          return {
            id: tx.hash,
            type,
            amount,
            token: 'USDC',
            address: tx.from === address?.toLowerCase() ? tx.to : tx.from,
            timestamp,
            status
          };
        });

        setTransactions(formattedTxs);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Poll every 30 seconds
    const interval = setInterval(fetchTransactions, 30000);

    // Refetch on tab focus
    const handleFocus = () => fetchTransactions();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [address, isConnected]);

  return {
    transactions,
    isLoading,
    refetch: fetchTransactions
  };
}
