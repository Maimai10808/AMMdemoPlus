// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IMultiTokenFactory} from "../interfaces/IMultiTokenFactory.sol";
import {MultiTokenPool} from "./MultiTokenPool.sol";

contract MultiTokenFactory is IMultiTokenFactory {
    address[] public override allPools;

    event PoolCreated(address indexed pool);

    function allPoolsLength() external view override returns (uint256) {
        return allPools.length;
    }

    function createPool(
        address[] calldata tokens,
        uint256[] calldata weights
    ) external override returns (address pool) {
        MultiTokenPool newPool = new MultiTokenPool(tokens, weights);
        pool = address(newPool);
        allPools.push(pool);

        emit PoolCreated(pool);
    }
}
