import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet';
import * as algokit from '@algorandfoundation/algokit-utils';
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs';
import { SavingsGroupClient } from '../../contracts/SavingsGroup';

interface SavingsGroupContextType {
  currentRound: number;
  contributionAmount: number;
  currentRecipient: string;
  members: string[];
  isLoading: boolean;
  contribute: () => Promise<void>;
  refreshGroupState: () => Promise<void>;
}

const SavingsGroupContext = createContext<SavingsGroupContextType | undefined>(undefined);

export const SavingsGroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { activeAddress, signer } = useWallet();
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algodClient = algokit.getAlgoClient({
    server: algodConfig.server,
    port: algodConfig.port,
    token: algodConfig.token,
  });

  const getAppClient = () => {
    if (!activeAddress || !signer) throw new Error('Wallet not connected');
    return new SavingsGroupClient({
      sender: { signer, addr: activeAddress },
      resolveBy: 'id',
      id: 1, // Replace with your deployed contract ID
    }, algodClient);
  };

  const refreshGroupState = async () => {
    try {
      setIsLoading(true);
      const client = getAppClient();

      const roundInfo = await client.get_round_info();
      setCurrentRound(Number(roundInfo.return.valueOf()));

      const amount = await client.get_contribution_amount();
      setContributionAmount(Number(amount.return.valueOf()));

      const recipient = await client.get_current_recipient();
      setCurrentRecipient(recipient.return.valueOf());

    } catch (error) {
      console.error('Error fetching group state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contribute = async () => {
    try {
      setIsLoading(true);
      const client = getAppClient();
      await client.contribute({});
      await refreshGroupState();
    } catch (error) {
      console.error('Error contributing:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeAddress) {
      refreshGroupState();
    }
  }, [activeAddress]);

  return (
    <SavingsGroupContext.Provider
      value={{
        currentRound,
        contributionAmount,
        currentRecipient,
        members,
        isLoading,
        contribute,
        refreshGroupState
      }}
    >
      {children}
    </SavingsGroupContext.Provider>
  );
};

export const useSavingsGroup = () => {
  const context = useContext(SavingsGroupContext);
  if (!context) {
    throw new Error('useSavingsGroup must be used within SavingsGroupProvider');
  }
  return context;
};
