// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMultiTokenPool {
    function getTokens() external view returns (address[] memory);

    function getBalance(address token) external view returns (uint256);

    function getWeight(address token) external view returns (uint256);

    function addLiquidity(address to) external returns (uint256 liquidity);

    function removeLiquidity(
        address to,
        uint256 liquidityIn
    ) external returns (uint256[] memory amountsOut);

    function swapExactTokenForToken(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external returns (uint256 amountOut);
}
