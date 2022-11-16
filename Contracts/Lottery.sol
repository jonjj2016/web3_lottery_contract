// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract Lottery {
    address public immutable manager;

    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function join() public payable {
        require(msg.value >= 0.001e18, "Not enought ether");
        players.push(msg.sender);
    }

    function random() private view returns (uint256) {
        return
            uint(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    function participants() public view returns (address[] memory) {
        return players;
    }

    function pickWinner() public {
        require(msg.sender == manager, "Only Manager can call this function");
        uint256 index = random() % players.length;
        address winner = players[index];
        payable(winner).transfer(address(this).balance);
        players = new address[](0);
    }
}
