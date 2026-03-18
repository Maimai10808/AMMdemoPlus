// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20Minimal} from "../interfaces/IERC20Minimal.sol";
import {IDexFactory} from "../interfaces/IDexFactory.sol";
import {IDexPair} from "../interfaces/IDexPair.sol";
import {IDexRouter} from "../interfaces/IDexRouter.sol";
import {DexLibrary} from "../libraries/DexLibrary.sol";

contract DexRouter is IDexRouter {
    address public immutable factory;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "EXPIRED");
        _;
    }

    constructor(address _factory) {
        factory = _factory;
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        override
        ensure(deadline)
        returns (uint256 amountA, uint256 amountB, uint256 liquidity)
    {
        if (IDexFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            IDexFactory(factory).createPair(tokenA, tokenB);
        }

        address pair = IDexFactory(factory).getPair(tokenA, tokenB);
        (uint256 reserveA, uint256 reserveB) = DexLibrary.getReserves(
            factory,
            tokenA,
            tokenB
        );

        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = DexLibrary.quote(
                amountADesired,
                reserveA,
                reserveB
            );
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = DexLibrary.quote(
                    amountBDesired,
                    reserveB,
                    reserveA
                );
                require(amountAOptimal >= amountAMin, "INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }

        IERC20Minimal(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20Minimal(tokenB).transferFrom(msg.sender, pair, amountB);
        liquidity = IDexPair(pair).mint(to);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        override
        ensure(deadline)
        returns (uint256 amountA, uint256 amountB)
    {
        address pair = IDexFactory(factory).getPair(tokenA, tokenB);
        IERC20Minimal(pair).transferFrom(msg.sender, pair, liquidity);
        (amountA, amountB) = IDexPair(pair).burn(to);
        require(amountA >= amountAMin, "INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "INSUFFICIENT_B_AMOUNT");
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override ensure(deadline) returns (uint256[] memory amounts) {
        amounts = DexLibrary.getAmountsOut(factory, amountIn, path);
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "INSUFFICIENT_OUTPUT_AMOUNT"
        );

        address firstPair = IDexFactory(factory).getPair(path[0], path[1]);
        IERC20Minimal(path[0]).transferFrom(msg.sender, firstPair, amounts[0]);
        _swap(amounts, path, to);
    }

    function _swap(
        uint256[] memory amounts,
        address[] memory path,
        address _to
    ) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = DexLibrary.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));

            address to = i < path.length - 2
                ? IDexFactory(factory).getPair(output, path[i + 2])
                : _to;

            IDexPair(IDexFactory(factory).getPair(input, output)).swap(
                amount0Out,
                amount1Out,
                to
            );
        }
    }
}
