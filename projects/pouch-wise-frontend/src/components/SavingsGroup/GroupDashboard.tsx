import React from 'react';
import { useWallet } from '@txnlab/use-wallet';
import { useSavingsGroup } from './SavingsGroupProvider';
import { ellipseAddress } from '../../utils/ellipseAddress';

const GroupDashboard: React.FC = () => {
  const { activeAddress } = useWallet();
  const {
    currentRound,
    contributionAmount,
    currentRecipient,
    isLoading,
    contribute
  } = useSavingsGroup();

  const handleContribute = async () => {
    try {
      await contribute();
    } catch (error) {
      console.error('Failed to contribute:', error);
    }
  };

  if (!activeAddress) {
    return (
      <div className="text-center p-6">
        <p className="text-lg">Please connect your wallet to view the savings group</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Savings Group Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Round</h3>
            <p className="text-2xl">{currentRound}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Required Contribution</h3>
            <p className="text-2xl">{contributionAmount / 1e6} ALGO</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg col-span-2">
            <h3 className="text-lg font-semibold mb-2">Current Recipient</h3>
            <p className="text-xl font-mono">{ellipseAddress(currentRecipient)}</p>
          </div>
        </div>

        <button
          onClick={handleContribute}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Contribute'}
        </button>
      </div>
    </div>
  );
};

export default GroupDashboard;
