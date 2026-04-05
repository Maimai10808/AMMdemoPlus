// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenFaucet is Ownable {
    struct FaucetToken {
        address token;
        uint256 maxPerClaim;
        bool enabled;
    }

    FaucetToken[] public faucetTokens;

    mapping(address => uint256) public lastClaimAt;
    uint256 public cooldown = 30 seconds;

    event TokenAdded(address indexed token, uint256 maxPerClaim);
    event TokenUpdated(
        uint256 indexed index,
        address indexed token,
        uint256 maxPerClaim,
        bool enabled
    );
    event CooldownUpdated(uint256 cooldown);
    event Claimed(address indexed user, address indexed token, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function addToken(address token, uint256 maxPerClaim) external onlyOwner {
        faucetTokens.push(
            FaucetToken({token: token, maxPerClaim: maxPerClaim, enabled: true})
        );

        emit TokenAdded(token, maxPerClaim);
    }

    function updateToken(
        uint256 index,
        address token,
        uint256 maxPerClaim,
        bool enabled
    ) external onlyOwner {
        require(index < faucetTokens.length, "invalid index");

        faucetTokens[index] = FaucetToken({
            token: token,
            maxPerClaim: maxPerClaim,
            enabled: enabled
        });

        emit TokenUpdated(index, token, maxPerClaim, enabled);
    }

    function setCooldown(uint256 newCooldown) external onlyOwner {
        cooldown = newCooldown;
        emit CooldownUpdated(newCooldown);
    }

    function faucetTokenCount() external view returns (uint256) {
        return faucetTokens.length;
    }

    function claim(uint256 index, uint256 amount) external {
        require(index < faucetTokens.length, "invalid index");
        require(
            block.timestamp >= lastClaimAt[msg.sender] + cooldown,
            "cooldown active"
        );
        require(amount > 0, "zero amount");

        FaucetToken memory ft = faucetTokens[index];

        require(ft.enabled, "token disabled");
        require(amount <= ft.maxPerClaim, "amount exceeds max per claim");

        uint256 faucetBalance = IERC20(ft.token).balanceOf(address(this));
        require(faucetBalance >= amount, "faucet insufficient balance");

        lastClaimAt[msg.sender] = block.timestamp;

        IERC20(ft.token).transfer(msg.sender, amount);

        emit Claimed(msg.sender, ft.token, amount);
    }

    function withdrawToken(
        address token,
        uint256 amount,
        address to
    ) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }
}
