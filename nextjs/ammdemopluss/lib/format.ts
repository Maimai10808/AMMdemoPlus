import { ethers } from "ethers";

export function formatUnitsSafe(
  value: bigint,
  decimals = 18,
  fractionDigits = 4,
) {
  const num = Number(ethers.formatUnits(value, decimals));
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

export function parseUnitsSafe(value: string, decimals = 18) {
  if (!value || Number(value) <= 0) return BigInt(0);
  return ethers.parseUnits(value, decimals);
}

export function makeDeadline(minutes = 20) {
  return Math.floor(Date.now() / 1000) + minutes * 60;
}

export function shortAddr(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
