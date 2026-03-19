// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PoolMath {
    error InvalidAmount();
    error InvalidBalance();

    function min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x < y ? x : y;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    // 学习版：近似报价，结合 tokenIn/tokenOut 的余额和权重
    function getAmountOut(
        uint256 amountIn,
        uint256 balanceIn,
        uint256 balanceOut,
        uint256 weightIn,
        uint256 weightOut
    ) internal pure returns (uint256 amountOut) {
        if (amountIn == 0) revert InvalidAmount();
        if (balanceIn == 0 || balanceOut == 0) revert InvalidBalance();

        uint256 amountInWithFee = amountIn * 997;
        uint256 adjustedIn = amountInWithFee * weightIn;
        uint256 adjustedOutFactor = balanceOut * weightOut * 1000;

        amountOut =
            (adjustedIn * balanceOut) /
            (balanceIn * weightOut * 1000 + adjustedIn);

        if (amountOut > balanceOut) {
            amountOut = balanceOut;
        }
    }
}
