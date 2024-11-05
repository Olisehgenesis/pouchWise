from algopy import ARC4Contract, Address, UInt64, List
from algopy.arc4 import abimethod
from algopy.types import State, Txn


class SavingsGroup(ARC4Contract):
    # Global state
    members: State[List[Address]]  # List of members in the group
    contribution_amount: State[UInt64]  # Amount each member must contribute per round
    current_round: State[UInt64]  # Current round number
    total_rounds: State[UInt64]  # Total number of rounds (equal to number of members)
    last_collection_round: State[UInt64]  # Last Algorand round when collection was made

    @abimethod()
    def create(self, members: List[Address], contribution_amount: UInt64):
        """Initialize the savings group"""
        # Verify we have at least 2 members
        assert len(members) >= 2, "Need at least 2 members"
        
        # Verify no duplicate members
        for i in range(len(members)):
            for j in range(i + 1, len(members)):
                assert members[i] != members[j], "Duplicate members not allowed"

        self.members = members
        self.contribution_amount = contribution_amount
        self.current_round = UInt64(0)
        self.total_rounds = UInt64(len(members))
        self.last_collection_round = UInt64(0)

    @abimethod()
    def contribute(self):
        """Contribute to the current round"""
        # Verify sender is a member
        is_member = False
        for member in self.members:
            if Txn.sender() == member:
                is_member = True
                break
        assert is_member, "Only members can contribute"

        # Verify correct payment amount
        assert Txn.amount() == self.contribution_amount, "Incorrect contribution amount"

        # Verify we haven't already collected this round
        assert Txn.round() > self.last_collection_round, "Already collected this round"

        # If all members have contributed, distribute to current round's recipient
        total_expected = self.contribution_amount * (self.total_rounds - 1)
        if self.app_address.balance >= total_expected:
            # Get current recipient
            recipient = self.members[self.current_round]
            
            # Send accumulated amount to recipient
            self.app_address.send(recipient, total_expected)
            
            # Update state
            self.current_round = (self.current_round + 1) % self.total_rounds
            self.last_collection_round = Txn.round()

    @abimethod(read_only=True)
    def get_current_recipient(self) -> Address:
        """Get the member who will receive funds this round"""
        return self.members[self.current_round]

    @abimethod(read_only=True)
    def get_contribution_amount(self) -> UInt64:
        """Get the required contribution amount"""
        return self.contribution_amount

    @abimethod(read_only=True)
    def get_round_info(self) -> UInt64:
        """Get the current round number"""
        return self.current_round 
