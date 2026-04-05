export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
] as const;

export const MULTI_POOL_ABI = [
  "function getTokens() view returns (address[])",
  "function getBalance(address token) view returns (uint256)",
  "function getWeight(address token) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
] as const;

export const MULTI_ROUTER_ABI = [
  "function addLiquidity(address pool, uint256[] amountsIn, address to, uint256 deadline) returns (uint256 liquidity)",
  "function removeLiquidity(address pool, uint256 liquidityIn, address to, uint256 deadline) returns (uint256[] memory amountsOut)",
  "function swapExactTokenForToken(address pool, address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address to, uint256 deadline) returns (uint256 amountOut)",
] as const;
