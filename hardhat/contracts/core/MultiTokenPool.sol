// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20Minimal} from "../interfaces/IERC20Minimal.sol";
import {IMultiTokenPool} from "../interfaces/IMultiTokenPool.sol";
import {LPToken} from "../tokens/LPToken.sol";
import {PoolMath} from "../libraries/PoolMath.sol";

contract MultiTokenPool is LPToken, IMultiTokenPool {
    using PoolMath for uint256;

    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;
    uint256 public constant TOTAL_WEIGHT = 10000; // 100%

    address[] public tokens;
    mapping(address => bool) public isSupportedToken;
    mapping(address => uint256) public balances;
    mapping(address => uint256) public weights;

    event LiquidityAdded(address indexed sender, uint256 liquidityMinted);
    event LiquidityRemoved(address indexed sender, uint256 liquidityBurned);
    event Swap(
        address indexed sender,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address to
    );

    constructor(
        address[] memory _tokens,
        uint256[] memory _weights
    ) LPToken("Multi Pool LP Token", "MPLP") {
        require(_tokens.length >= 2, "NEED_AT_LEAST_2_TOKENS");
        require(_tokens.length == _weights.length, "LENGTH_MISMATCH");

        uint256 weightSum;
        for (uint256 i = 0; i < _tokens.length; i++) {
            address token = _tokens[i];
            require(token != address(0), "ZERO_TOKEN");
            require(!isSupportedToken[token], "DUPLICATE_TOKEN");
            require(_weights[i] > 0, "ZERO_WEIGHT");

            tokens.push(token);
            isSupportedToken[token] = true;
            weights[token] = _weights[i];
            weightSum += _weights[i];
        }

        require(weightSum == TOTAL_WEIGHT, "INVALID_WEIGHT_SUM");
    }

    function getTokens() external view override returns (address[] memory) {
        return tokens;
    }

    function getBalance(
        address token
    ) external view override returns (uint256) {
        return balances[token];
    }

    function getWeight(address token) external view override returns (uint256) {
        return weights[token];
    }

    function addLiquidity(
        address to
    ) external override returns (uint256 liquidity) {
        uint256[] memory amountsIn = new uint256[](tokens.length);
        uint256 poolValueBefore;

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 currentBalance = IERC20Minimal(token).balanceOf(
                address(this)
            );
            uint256 amountIn = currentBalance - balances[token];
            amountsIn[i] = amountIn;

            if (balances[token] > 0) {
                poolValueBefore += balances[token];
            }
        }

        if (totalSupply == 0) {
            uint256 initialValue;
            for (uint256 i = 0; i < tokens.length; i++) {
                initialValue += amountsIn[i];
            }

            liquidity =
                PoolMath.sqrt(initialValue * initialValue) -
                MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            liquidity = type(uint256).max;
            for (uint256 i = 0; i < tokens.length; i++) {
                address token = tokens[i];
                require(balances[token] > 0, "EMPTY_BALANCE");
                uint256 partialLiquidity = (amountsIn[i] * totalSupply) /
                    balances[token];
                liquidity = PoolMath.min(liquidity, partialLiquidity);
            }
        }

        require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_MINTED");

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            balances[token] = IERC20Minimal(token).balanceOf(address(this));
        }

        _mint(to, liquidity);
        emit LiquidityAdded(msg.sender, liquidity);
    }

    function removeLiquidity(
        address to,
        uint256 liquidityIn
    ) external override returns (uint256[] memory amountsOut) {
        require(liquidityIn > 0, "ZERO_LIQUIDITY");
        require(balanceOf[address(this)] >= liquidityIn, "POOL_NOT_HOLDING_LP");

        amountsOut = new uint256[](tokens.length);
        uint256 _totalSupply = totalSupply;

        _burn(address(this), liquidityIn);

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 amountOut = (balances[token] * liquidityIn) / _totalSupply;
            amountsOut[i] = amountOut;

            balances[token] -= amountOut;
            require(
                IERC20Minimal(token).transfer(to, amountOut),
                "TRANSFER_FAILED"
            );
        }

        emit LiquidityRemoved(msg.sender, liquidityIn);
    }

    function swapExactTokenForToken(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external override returns (uint256 amountOut) {
        require(isSupportedToken[tokenIn], "INVALID_TOKEN_IN");
        require(isSupportedToken[tokenOut], "INVALID_TOKEN_OUT");
        require(tokenIn != tokenOut, "IDENTICAL_TOKENS");
        require(amountIn > 0, "ZERO_INPUT");

        uint256 actualBalanceIn = IERC20Minimal(tokenIn).balanceOf(
            address(this)
        );
        uint256 realAmountIn = actualBalanceIn - balances[tokenIn];
        require(realAmountIn >= amountIn, "INPUT_NOT_RECEIVED");

        amountOut = PoolMath.getAmountOut(
            amountIn,
            balances[tokenIn],
            balances[tokenOut],
            weights[tokenIn],
            weights[tokenOut]
        );

        require(amountOut >= minAmountOut, "SLIPPAGE");
        require(amountOut < balances[tokenOut], "INSUFFICIENT_POOL_LIQUIDITY");

        balances[tokenIn] = actualBalanceIn;
        balances[tokenOut] -= amountOut;

        require(
            IERC20Minimal(tokenOut).transfer(to, amountOut),
            "TRANSFER_OUT_FAILED"
        );

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut, to);
    }
}
