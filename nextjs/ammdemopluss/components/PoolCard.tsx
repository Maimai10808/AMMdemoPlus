type Props = {
  token0Symbol: string;
  token1Symbol: string;
  token0Balance: string;
  token1Balance: string;
  lpBalance: string;
  reserve0: string;
  reserve1: string;
};

export default function PoolCard(props: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">我的资产</h2>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>{props.token0Symbol}</span>
            <span>{props.token0Balance}</span>
          </div>
          <div className="flex justify-between">
            <span>{props.token1Symbol}</span>
            <span>{props.token1Balance}</span>
          </div>
          <div className="flex justify-between">
            <span>LP Token</span>
            <span>{props.lpBalance}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">池子储备</h2>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>{props.token0Symbol}</span>
            <span>{props.reserve0}</span>
          </div>
          <div className="flex justify-between">
            <span>{props.token1Symbol}</span>
            <span>{props.reserve1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
