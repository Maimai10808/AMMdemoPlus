// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMultiTokenFactory {
    function createPool(
        address[] calldata tokens,
        uint256[] calldata weights
    ) external returns (address pool);

    function allPools(uint256 index) external view returns (address pool);

    function allPoolsLength() external view returns (uint256);
}
