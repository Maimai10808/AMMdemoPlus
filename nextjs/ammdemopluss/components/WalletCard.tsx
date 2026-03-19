import { shortAddr } from "@/lib/format";

type Props = {
  account: string;
  nativeBalance: string;
  loading: boolean;
  status: string;
  connectWallet: () => void;
};

export default function WalletCard({
  account,
  nativeBalance,
  loading,
  status,
  connectWallet,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">钱包</h2>
          <p className="mt-1 text-sm text-slate-400">
            {account ? `已连接: ${shortAddr(account)}` : "未连接"}
          </p>
          {account && (
            <p className="mt-1 text-sm text-slate-400">
              原生 ETH: {nativeBalance}
            </p>
          )}
        </div>

        <button
          onClick={connectWallet}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {account ? "重新连接" : "连接钱包"}
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
        状态：{status}
      </div>
    </div>
  );
}
