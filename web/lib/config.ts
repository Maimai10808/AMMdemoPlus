type Address = `0x${string}`;

function requireAddress(value: string | undefined, name: string): Address {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value as Address;
}

export const TARGET_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337",
);

export const FACTORY_ADDRESS = requireAddress(
  process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
  "NEXT_PUBLIC_FACTORY_ADDRESS",
);

export const POOL_ADDRESS = requireAddress(
  process.env.NEXT_PUBLIC_POOL_ADDRESS,
  "NEXT_PUBLIC_POOL_ADDRESS",
);

export const ROUTER_ADDRESS = requireAddress(
  process.env.NEXT_PUBLIC_ROUTER_ADDRESS,
  "NEXT_PUBLIC_ROUTER_ADDRESS",
);

export const TOKEN_A_ADDRESS = requireAddress(
  process.env.NEXT_PUBLIC_TOKEN_A_ADDRESS,
  "NEXT_PUBLIC_TOKEN_A_ADDRESS",
);

export const TOKEN_B_ADDRESS = requireAddress(
  process.env.NEXT_PUBLIC_TOKEN_B_ADDRESS,
  "NEXT_PUBLIC_TOKEN_B_ADDRESS",
);

export const TOKEN_C_ADDRESS = requireAddress(
  process.env.NEXT_PUBLIC_TOKEN_C_ADDRESS,
  "NEXT_PUBLIC_TOKEN_C_ADDRESS",
);

export const TOKEN_D_ADDRESS = requireAddress(
  process.env.NEXT_PUBLIC_TOKEN_D_ADDRESS,
  "NEXT_PUBLIC_TOKEN_D_ADDRESS",
);

export const TOKEN_E_ADDRESS = requireAddress(
  process.env.NEXT_PUBLIC_TOKEN_E_ADDRESS,
  "NEXT_PUBLIC_TOKEN_E_ADDRESS",
);

export const TOKENS = [
  { key: "tokenA", symbol: "dETH", address: TOKEN_A_ADDRESS },
  { key: "tokenB", symbol: "dUSD", address: TOKEN_B_ADDRESS },
  { key: "tokenC", symbol: "dBTC", address: TOKEN_C_ADDRESS },
  { key: "tokenD", symbol: "dXRP", address: TOKEN_D_ADDRESS },
  { key: "tokenE", symbol: "dDOGE", address: TOKEN_E_ADDRESS },
] as const;
