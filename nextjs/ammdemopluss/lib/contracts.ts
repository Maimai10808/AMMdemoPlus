import { BrowserProvider, Contract } from "ethers";
import { ERC20_ABI, MULTI_POOL_ABI, MULTI_ROUTER_ABI } from "./abi";
import { POOL_ADDRESS, ROUTER_ADDRESS } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildMultiDexContracts(ethereum: any, account?: string) {
  const provider = new BrowserProvider(ethereum);
  const signer = account
    ? await provider.getSigner(account)
    : await provider.getSigner();

  const pool = new Contract(POOL_ADDRESS, MULTI_POOL_ABI, signer);
  const router = new Contract(ROUTER_ADDRESS, MULTI_ROUTER_ABI, signer);

  return {
    provider,
    signer,
    pool,
    router,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildTokenContract(address: string, signerOrProvider: any) {
  return new Contract(address, ERC20_ABI, signerOrProvider);
}
