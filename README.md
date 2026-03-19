# AMMdemoPlus

一个基于 **Hardhat + Solidity + Next.js + ethers.js** 构建的多币种 AMM（Automated Market Maker，自动做市商）去中心化交易所 Demo 项目。

这个项目的目标不是直接复刻生产级 DEX，而是从零开始，逐步实现一个可运行、可研究、可扩展的多币流动性池系统，并配套前端界面，帮助理解以下核心概念：

- 流动性池（Liquidity Pool）
- LP Token（流动性份额代币）
- Router / Pool / Factory 分层架构
- 多币种池（Multi-token Pool）
- Swap、Add Liquidity、Remove Liquidity 的完整流程
- 前端如何与链上合约交互

---

## 1. 项目简介

在传统订单簿交易模型中，买卖双方需要挂单、撮合、成交。而在 AMM 模型中，用户不是直接和另一个交易者成交，而是和一个**流动性池**进行交易。

本项目实现的是一个**多币种流动性池 Demo**：

- 一个池子中可以同时存放多个测试代币
- 用户可以向池子中添加流动性
- 用户可以移除流动性
- 用户可以在池中的任意两种代币之间进行兑换
- 流动性提供者会获得 LP Token，表示自己占池子的份额

项目分为两个部分：

### 智能合约后端

基于 Hardhat + Solidity 实现：

- MockERC20 测试币
- LPToken
- MultiTokenPool
- MultiTokenRouter
- MultiTokenFactory
- 数学与辅助库

### 前端

基于 Next.js + Tailwind CSS + ethers.js 实现：

- 连接 MetaMask
- 读取池中全部 token
- 展示用户余额、池子余额、权重
- 添加流动性
- 移除流动性
- 执行 Swap

---

## 2. 项目结构

```text
AMMdemoPlus/
├── hardhat/
│   ├── contracts/
│   │   ├── interfaces/
│   │   │   ├── IERC20Minimal.sol
│   │   │   ├── IDexFactory.sol
│   │   │   ├── IDexPair.sol
│   │   │   ├── IDexRouter.sol
│   │   │   ├── IMultiTokenFactory.sol
│   │   │   ├── IMultiTokenPool.sol
│   │   │   └── IMultiTokenRouter.sol
│   │   ├── libraries/
│   │   │   ├── DexLibrary.sol
│   │   │   ├── DexMath.sol
│   │   │   └── PoolMath.sol
│   │   ├── tokens/
│   │   │   ├── LPToken.sol
│   │   │   └── MockERC20.sol
│   │   ├── core/
│   │   │   ├── DexFactory.sol
│   │   │   ├── DexPair.sol
│   │   │   ├── MultiTokenFactory.sol
│   │   │   └── MultiTokenPool.sol
│   │   └── periphery/
│   │       ├── DexRouter.sol
│   │       └── MultiTokenRouter.sol
│   ├── scripts/
│   │   ├── deploy.ts
│   │   ├── seed.ts
│   │   ├── deployMultiTokenDex.ts
│   │   ├── seedMultiTokenDex.ts
│   │   └── mintFiveTokensToUser.ts
│   └── test/
│       └── Dex.test.ts
│
└── nextjs/
    └── ammdemopluss/
        ├── app/
        ├── components/
        ├── hooks/
        ├── lib/
        ├── public/
        └── ...
```

---

## 3. 核心概念说明

### 3.1 流动性池（Liquidity Pool）

流动性池可以理解为一个“公共库存仓库”。池子中存放多种代币，用户可以：

- 向池子中放入资产，成为流动性提供者
- 从池子中拿某种代币换出另一种代币
- 按自己的份额撤出资产

在这个项目中，多币池 `MultiTokenPool` 保存了：

- 池子支持的全部 token 地址
- 每个 token 的余额
- 每个 token 的权重
- LP Token 总量与份额关系

流动性池最核心的功能不是单纯“存币”，而是给交易者提供**可随时成交的公共库存**。在 AMM 模型里，交易者面对的是池子，而不是一个具体的对手方。

---

### 3.2 LP Token

LP Token 本质上是一个**池子份额凭证**。

当用户向池子中添加流动性时，池子会根据其投入资产的贡献，给用户铸造 LP Token。当用户移除流动性时，用户把 LP Token 交回池子，池子再按比例返还底层资产。

它的作用不是表示某一种资产，而是表示：

> 用户当前拥有整个流动性池多少比例的权益。

所以 LP Token 更接近“股份证明”或“仓单”，而不是普通交易代币。

---

### 3.3 Router

Router 是用户交互入口层。

前端一般不会直接调用 Pool 的底层函数，而是调用 Router 提供的统一接口，例如：

- `addLiquidity`
- `removeLiquidity`
- `swapExactTokenForToken`

Router 的职责主要是：

- 检查截止时间
- 把用户资产转入池子
- 调用池子完成实际逻辑结算

Pool 是“资金池”，Router 是“流程调度器”。

---

### 3.4 多币池（Multi-token Pool）

与双币池不同，多币池中不再只有 `token0` 和 `token1`，而是可以存放多个代币。

本项目当前实现的是一个五币池示例，支持：

- dETH
- dUSD
- dBTC
- dXRP
- dDOGE

多币池通过：

- `tokens[]`
- `balances[token]`
- `weights[token]`

来管理池子状态。

---

### 3.5 权重（Weight）

权重用来描述池子的“目标资产配置”。例如：

- dETH: 50%
- dUSD: 20%
- dBTC: 10%
- dXRP: 10%
- dDOGE: 10%

权重不是“绝对价格”，也不是永远不变的实际占比。它更像是池子的设计参数，用来影响：

- 池子的目标持仓结构
- 池子内部定价曲线
- 不同资产对池子价格的影响程度

外部市场价格最终仍然会通过套利影响池内价格。

等权池当然也是可以成立的，例如 `20/20/20/20/20`。不等权并不是为了“违背市场”，而是为了表达池子的资产配置偏好与风险结构。

---

## 4. 实现原理

### 4.1 Pool 记录状态

`MultiTokenPool.sol` 是整个系统的核心资金池，它负责：

- 保存支持的 token 列表
- 保存每个 token 的池内余额
- 保存每个 token 的权重
- 接收流动性
- 发放 LP Token
- 销毁 LP Token
- 处理 token 兑换

池子的核心思想是：

> 用户不是和另一个用户直接交易，而是和这个公共池子进行交易。

---

### 4.2 Add Liquidity 机制

添加流动性的基本流程如下：

1. 用户在前端输入各个 token 的投入数量
2. 前端调用 Router
3. Router 逐个调用 token 的 `transferFrom`，将资产从用户转入 Pool
4. Pool 根据新增资产数量，计算应铸造的 LP Token 数量
5. Pool 给用户铸造 LP Token

这表示用户成为了池子的共同所有者之一。

---

### 4.3 Remove Liquidity 机制

移除流动性的流程如下：

1. 用户输入要销毁的 LP Token 数量
2. Router 将 LP Token 从用户地址转入 Pool
3. Pool 销毁这部分 LP Token
4. Pool 按比例返还各个 token 给用户

返回的不是“最初原样存进去的币”，而是：

> 当前池子状态下，用户按份额应得的那一部分资产组合。

---

### 4.4 Swap 机制

Swap 的流程如下：

1. 用户指定 `tokenIn`、`tokenOut` 和 `amountIn`
2. Router 把输入代币转到 Pool
3. Pool 根据当前余额和权重，计算输出数量
4. Pool 将 `tokenOut` 转给用户

池子给出的价格不是链下“绝对真理价格”，而是：

> 当前池子库存结构下愿意成交的价格。

如果池子价格与外部市场价格偏离过大，套利者会通过交易把它逐步拉回合理区间。

---

### 4.5 池子价格与外部市场

AMM 池子的价格通常不是直接读取现实世界美元价格，而是由池内状态决定。外部市场价格通过套利行为影响池子，从而形成动态平衡。

所以更准确地说：

- 池子内部决定即时成交价格
- 外部市场决定长期合理价格区间
- 套利者在两者之间起桥梁作用

因此，池子的价格并不是“现实价格的镜像”，而是“在池子当前库存条件下的报价”。

---

### 4.6 套利机制

如果池子内部价格与外部市场价格不一致，套利者会进行无风险或低风险搬砖：

- 在价格低的一侧买入
- 在价格高的一侧卖出

这种行为会：

- 改变池内各资产余额
- 推动池内价格向外部市场价格靠近
- 维持系统的动态价格一致性

从这个角度看，套利者虽然是在赚价差，但同时也在帮助池子维持价格有效性。

---

### 4.7 流动性提供者如何盈利

LP 的主要收益来源通常是：

- 用户交易产生的手续费
- 池子整体资产价值增长带来的份额增值

但 LP 也要承担风险，最典型的是：

- 无常损失（Impermanent Loss）
- 某些资产价格剧烈波动带来的组合价值变化

所以 LP 不是“无风险吃利息”，而是通过向市场提供库存来换取手续费收益。

---

## 5. 文件作用说明

### `MockERC20.sol`

测试代币合约，用于铸造 dETH、dUSD、dBTC、dXRP、dDOGE 等测试币。

### `LPToken.sol`

实现流动性份额代币逻辑，用于表示用户在池中的权益比例。

### `MultiTokenPool.sol`

多币池核心合约，负责存储状态、管理余额、铸造和销毁 LP Token、执行交换。

### `MultiTokenRouter.sol`

多币池路由合约，负责统一用户入口，组织 add/remove/swap 流程。

### `MultiTokenFactory.sol`

用于创建新的多币池实例。

### `PoolMath.sol`

封装池子的数学计算逻辑，用于做报价和辅助计算。

### `deployMultiTokenDex.ts`

部署多币池相关合约和测试币。

### `seedMultiTokenDex.ts`

向多币池注入初始流动性，用于启动池子。

### `mintFiveTokensToUser.ts`

为指定测试地址批量铸造 5 种测试币。

---

## 6. 前端实现机制

前端基于 Next.js + ethers.js 实现，核心逻辑放在 `hooks/useMultiTokenDex.ts` 中。

主要流程包括：

### 1. 连接钱包

- 检测 MetaMask
- 自动切换到 Hardhat 本地链
- 获取当前账户地址

### 2. 动态读取池子 token 列表

前端并不是手写死五个 token 地址，而是通过：

```ts
pool.getTokens();
```

从链上动态读取池中支持的 token。

### 3. 读取每个 token 的信息

对每个 token 地址再读取：

- symbol
- decimals
- 用户余额
- 池子余额
- 权重

### 4. 调用 Router 进行交互

前端通过 Router 执行：

- Add Liquidity
- Remove Liquidity
- Swap

---

## 7. 运行方式

### 7.1 启动本地链

在 `hardhat` 目录执行：

```bash
npx hardhat node
```

---

### 7.2 部署多币池合约

```bash
npx hardhat run scripts/deployMultiTokenDex.ts --network localhost
```

---

### 7.3 初始化池子流动性

```bash
npx hardhat run scripts/seedMultiTokenDex.ts --network localhost
```

---

### 7.4 给测试用户发五种币

```bash
npx hardhat run scripts/mintFiveTokensToUser.ts --network localhost
```

---

### 7.5 配置前端环境变量

在 Next.js 前端项目中配置 `.env.local`：

```env
NEXT_PUBLIC_POOL_ADDRESS=...
NEXT_PUBLIC_ROUTER_ADDRESS=...
NEXT_PUBLIC_FACTORY_ADDRESS=...
```

---

### 7.6 启动前端

```bash
npm run dev
```

---

## 8. 项目当前定位

这个项目当前定位为：

**多币种 AMM / DEX 学习与研究型 Demo**

它更侧重于：

- 帮助理解池子、LP、Router、权重和多币交换机制
- 验证从双币池升级到多币池的工程思路
- 打通智能合约与前端联调流程

它不是生产环境可直接上线的协议版本，当前仍然属于教学与实验性质。

---

## 9. 后续可扩展方向

未来可以继续扩展：

- 更精确的多币定价公式
- 更严格的滑点保护
- 更完整的手续费机制
- 单边流动性添加
- 更完善的测试用例
- 更专业的前端界面与图表
- 部署到测试网
- 池子状态可视化
- 协议费与治理模块

---

## 10. 总结

这个项目展示了一个多币种 AMM/DEX 的基础实现路径：

- 用 Pool 承载资产与状态
- 用 LP Token 表示池子份额
- 用 Router 组织交互流程
- 用前端动态读取池子支持的 token 列表
- 用测试币和脚本完成本地链开发闭环

它帮助从工程和机制两个层面理解：

- 为什么需要流动性池
- 为什么需要 LP Token
- 为什么价格与池内状态有关
- 为什么外部市场会通过套利影响池子
- 为什么 Router / Pool / Factory 要分层设计

---

## License

MIT
