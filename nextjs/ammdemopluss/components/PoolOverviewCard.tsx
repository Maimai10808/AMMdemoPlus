import type { PoolTokenInfo } from "@/lib/types";

type Props = {
  tokens: PoolTokenInfo[];
  lpBalance: string;
};

export default function PoolOverviewCard({ tokens, lpBalance }: Props) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold text-white">池子总览</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="pb-3">Token</th>
              <th className="pb-3">我的余额</th>
              <th className="pb-3">池子余额</th>
              <th className="pb-3">权重</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.address} className="border-b border-slate-800">
                <td className="py-3">{token.symbol}</td>
                <td className="py-3">{token.balance}</td>
                <td className="py-3">{token.poolBalance}</td>
                <td className="py-3">{token.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
        LP Token 余额：{lpBalance}
      </div>
    </div>
  );
}
