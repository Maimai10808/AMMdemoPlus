// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMultiTokenRouter {
    function addLiquidity(
        address pool,
        uint256[] calldata amountsIn,
        address to,
        uint256 deadline
    ) external returns (uint256 liquidity);

    function removeLiquidity(
        address pool,
        uint256 liquidityIn,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amountsOut);

    function swapExactTokenForToken(
        address pool,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);
}
