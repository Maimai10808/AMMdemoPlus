import deployment from "../../../hardhat/deployments/localhost.json";

type Address = `0x${string}`;

export const TARGET_CHAIN_ID = deployment.chainId ?? 31337;

export const FACTORY_ADDRESS = deployment.factory as Address;
export const POOL_ADDRESS = deployment.pool as Address;
export const ROUTER_ADDRESS = deployment.router as Address;

export const TOKEN_A_ADDRESS = deployment.tokens.tokenA.address as Address;
export const TOKEN_B_ADDRESS = deployment.tokens.tokenB.address as Address;
export const TOKEN_C_ADDRESS = deployment.tokens.tokenC.address as Address;
export const TOKEN_D_ADDRESS = deployment.tokens.tokenD.address as Address;
export const TOKEN_E_ADDRESS = deployment.tokens.tokenE.address as Address;

export const TOKENS = [
  {
    key: "tokenA",
    symbol: deployment.tokens.tokenA.symbol,
    address: TOKEN_A_ADDRESS,
  },
  {
    key: "tokenB",
    symbol: deployment.tokens.tokenB.symbol,
    address: TOKEN_B_ADDRESS,
  },
  {
    key: "tokenC",
    symbol: deployment.tokens.tokenC.symbol,
    address: TOKEN_C_ADDRESS,
  },
  {
    key: "tokenD",
    symbol: deployment.tokens.tokenD.symbol,
    address: TOKEN_D_ADDRESS,
  },
  {
    key: "tokenE",
    symbol: deployment.tokens.tokenE.symbol,
    address: TOKEN_E_ADDRESS,
  },
] as const;
