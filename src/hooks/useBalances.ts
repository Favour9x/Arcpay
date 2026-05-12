import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { formatUnits } from 'viem';
import { kit, createAdapter } from '../utils/appKit';

const EURC_CONTRACT = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';
const EURC_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  }
] as const;

export function useBalances() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  const [eurcBalance, setEurcBalance] = useState('0.00');
  const [unifiedBalance, setUnifiedBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalances = async () => {
    if (!address || !publicClient || !isConnected) return;
    
    setIsLoading(true);
    try {
      // Fetch USDC balance (native token with 18 decimals)
      const usdcBal = await publicClient.getBalance({ address });
      setUsdcBalance(parseFloat(formatUnits(usdcBal, 18)).toFixed(2));

      // Fetch EURC balance (ERC-20 with 6 decimals)
      const eurcBal = await publicClient.readContract({
        address: EURC_CONTRACT,
        abi: EURC_ABI,
        functionName: 'balanceOf',
        args: [address]
      });
      setEurcBalance(parseFloat(formatUnits(eurcBal as bigint, 6)).toFixed(2));

      // Fetch unified balance
      if (walletClient && address) {
        try {
          const adapter = createAdapter(walletClient, address);
          const unifiedBal = await kit.unifiedBalance.getBalance({ adapter });
          setUnifiedBalance(unifiedBal?.balance || '0.00');
        } catch (error) {
          console.error('Error fetching unified balance:', error);
          setUnifiedBalance('0.00');
        }
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [address, isConnected, publicClient, walletClient]);

  return {
    usdcBalance,
    eurcBalance,
    unifiedBalance,
    isLoading,
    refetch: fetchBalances
  };
}
