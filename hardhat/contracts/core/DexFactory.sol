// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IDexFactory} from "../interfaces/IDexFactory.sol";
import {DexPair} from "./DexPair.sol";

contract DexFactory is IDexFactory {
    mapping(address => mapping(address => address)) public override getPair;
    address[] public override allPairs;

    function allPairsLength() external view override returns (uint256) {
        return allPairs.length;
    }

    function createPair(
        address tokenA,
        address tokenB
    ) external override returns (address pair) {
        require(tokenA != tokenB, "IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "PAIR_EXISTS");

        DexPair newPair = new DexPair(token0, token1);
        pair = address(newPair);

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }
}
