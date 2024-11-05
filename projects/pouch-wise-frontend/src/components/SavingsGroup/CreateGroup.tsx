import React, { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet';
import * as algokit from '@algorandfoundation/algokit-utils';
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs';
import { SavingsGroupClient } from '../SavingsGroup/SavingsGroupProvider';

const CreateGroup: React.FC = () => {
  const [members, setMembers] = useState<string[]>(['']);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { activeAddress, signer } = useWallet();
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algodClient = algokit.getAlgoClient({
    server: algodConfig.server,
    port: algodConfig.port,
    token: algodConfig.token,
  });

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const updateMember = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const removeMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddress || !signer) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);
      const client = new SavingsGroupClient({
        sender: { signer, addr: activeAddress },
        resolveBy: 'id',
        id: 1, // Replace with your deployed contract ID
      }, algodClient);

      const amount = Math.floor(parseFloat(contributionAmount) * 1e6);
      await client.create({
        members: members.filter(m => m.length === 58),
        contribution_amount: BigInt(amount)
      });

      // Reset form
      setMembers(['']);
      setContributionAmount('');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Savings Group</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Members</label>
          {members.map((member, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={member}
                onChange={(e) => updateMember(index, e.target.value)}
                placeholder="Enter Algorand address"
                className="flex-1 p-2 border rounded"
                required
              />
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMemberField}
            className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Add Member
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Contribution Amount (ALGO)
          </label>
          <input
            type="number"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            placeholder="Enter amount in ALGO"
            className="w-full p-2 border rounded"
            required
            min="0"
            step="0.1"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !activeAddress}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700
                   disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;
