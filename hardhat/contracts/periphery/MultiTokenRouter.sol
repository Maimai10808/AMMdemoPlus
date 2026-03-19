// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20Minimal} from "../interfaces/IERC20Minimal.sol";
import {IMultiTokenPool} from "../interfaces/IMultiTokenPool.sol";
import {IMultiTokenRouter} from "../interfaces/IMultiTokenRouter.sol";

contract MultiTokenRouter is IMultiTokenRouter {
    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "EXPIRED");
        _;
    }

    function addLiquidity(
        address pool,
        uint256[] calldata amountsIn,
        address to,
        uint256 deadline
    ) external override ensure(deadline) returns (uint256 liquidity) {
        address[] memory tokens = IMultiTokenPool(pool).getTokens();
        require(tokens.length == amountsIn.length, "LENGTH_MISMATCH");

        for (uint256 i = 0; i < tokens.length; i++) {
            if (amountsIn[i] > 0) {
                require(
                    IERC20Minimal(tokens[i]).transferFrom(
                        msg.sender,
                        pool,
                        amountsIn[i]
                    ),
                    "TRANSFER_IN_FAILED"
                );
            }
        }

        liquidity = IMultiTokenPool(pool).addLiquidity(to);
    }

    function removeLiquidity(
        address pool,
        uint256 liquidityIn,
        address to,
        uint256 deadline
    ) external override ensure(deadline) returns (uint256[] memory amountsOut) {
        require(
            IERC20Minimal(pool).transferFrom(msg.sender, pool, liquidityIn),
            "LP_TRANSFER_FAILED"
        );

        amountsOut = IMultiTokenPool(pool).removeLiquidity(to, liquidityIn);
    }

    function swapExactTokenForToken(
        address pool,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to,
        uint256 deadline
    ) external override ensure(deadline) returns (uint256 amountOut) {
        require(
            IERC20Minimal(tokenIn).transferFrom(msg.sender, pool, amountIn),
            "TOKEN_IN_TRANSFER_FAILED"
        );

        amountOut = IMultiTokenPool(pool).swapExactTokenForToken(
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            to
        );
    }
}
