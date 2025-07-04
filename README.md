# Katana MCP Server

A Model Context Protocol (MCP) server for interacting with the Katana network, providing seamless cross-chain bridging, DeFi operations, and Yearn vault management through AI assistants.

## Features

**Cross-Chain Bridging**
- Bridge assets from Ethereum, Polygon, Arbitrum, and Base to Katana
- Automatic deposit address generation
- Support for major tokens (USDC, USDT, ETH, DAI, etc.)

**SushiSwap Integration**
- Get real-time swap quotes
- Execute token swaps with customizable slippage
- Support for all major tokens on Katana

**Yearn Vault Management**
- Deposit into yield-generating vaults
- Withdraw from vault positions
- View vault performance and user positions

**Portfolio Management**
- Check token balances across all assets
- Track Yearn vault positions
- Monitor transaction history

## Supported Networks

| Network | Chain ID | Minimum Deposit |
|---------|----------|----------------|
| Ethereum | 1 | $50 |
| Polygon | 137 | $2.5 |
| Arbitrum | 42161 | $2.5 |
| Base | 8453 | $2.5 |
| **Katana** | **747474** | **Destination** |

## Supported Tokens

### Katana Native Tokens
- **ETH** - Ethereum
- **USDC** - USD Coin  
- **USDT** - Tether USD
- **WBTC** - Wrapped Bitcoin
- **AUSD** - Aave USD
- **USDS** - USDS Stablecoin

### Yearn Vaults Available
- **yvUSDC** - USDC Vault
- **yvETH** - ETH Vault
- **yvUSDT** - USDT Vault
- **yvWBTC** - WBTC Vault
- **yvAUSD** - AUSD Vault

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or pnpm package manager
- A wallet private key with funds on supported networks


## MCP Configuration

Add this server to your MCP-compatible AI assistant (like Claude Desktop):

```json
{
  "mcpServers": {
    "katana-mcp": {
      "command": "npx",
        "args": ["katana-mcp"],
      "env": {
        "WALLET_PRIVATE_KEY": "your_private_key_here"
      }
    }
  }
}
```

## Available Tools

### Bridge Assets
**Tool**: `bridgeAssets`

Bridge tokens from supported chains to Katana network.

**Parameters:**
- `asset` (string): Token symbol (e.g., 'USDC', 'ETH')
- `chain` (string): Source chain ('ethereum', 'polygon', 'arbitrum', 'base')
- `amount` (string): Amount to bridge (e.g., '100')

**Example Usage:**
```
Bridge 100 USDC from Ethereum to Katana
```

### Get Token Balances
**Tool**: `getTokenBalances`

Check your token balances on Katana network.

**Parameters:**
- `walletAddress` (optional): Wallet address to check

**Example Usage:**
```
Show my token balances on Katana
```

### Yearn Vault Operations

#### Get Vault Information
**Tool**: `getYearnVaultInfo`

Get detailed information about available Yearn vaults.

**Example Usage:**
```
Show me all available Yearn vaults on Katana
```

#### Deposit to Vault
**Tool**: `depositToYearnVault`

Deposit tokens into yield-generating vaults.

**Parameters:**
- `token` (string): Token to deposit ('USDC', 'ETH', etc.)
- `amount` (string): Amount to deposit
- `vaultTarget` (string): Target vault ('USDC', 'ETH', 'WBTC', 'USDT', 'AUSD')

**Example Usage:**
```
Deposit 1000 USDC into the USDC vault
```

#### Withdraw from Vault
**Tool**: `withdrawFromYearnVault`

Withdraw tokens from vault positions.

**Parameters:**
- `vaultAddress` (string): Vault contract address
- `amount` (string): Amount to withdraw
- `withdrawType` (string): 'assets' or 'shares'

#### Get Vault Positions
**Tool**: `getUserYearnPositions`

View your current vault positions and yields.

**Example Usage:**
```
Show my Yearn vault positions
```

### SushiSwap Integration

#### Get Swap Quote
**Tool**: `getSushiQuote`

Get a quote for token swaps on SushiSwap.

**Parameters:**
- `tokenIn` (string): Input token
- `tokenOut` (string): Output token  
- `amount` (string): Amount to swap
- `maxSlippage` (number): Maximum slippage percentage

**Example Usage:**
```
Get a quote to swap 1 ETH for USDC with 0.5% slippage
```

#### Execute Swap
**Tool**: `executeSushiSwap`

Execute a token swap on SushiSwap.

**Parameters:**
- `tokenIn` (string): Input token
- `tokenOut` (string): Output token
- `amount` (string): Amount to swap
- `maxSlippage` (number): Maximum slippage percentage

**Example Usage:**
```
Swap 0.1 ETH for USDC with 2% slippage tolerance
```

## Error Handling

The server includes comprehensive error handling for common issues:

- **Insufficient Balance**: Clear messages about available vs required amounts
- **Network Issues**: Automatic retry logic and helpful troubleshooting
- **Slippage Protection**: Configurable slippage tolerance with sensible defaults
- **Gas Estimation**: Automatic gas limit calculation with safety margins

## Security Features

- **Private Key Management**: Secure environment variable handling
- **Transaction Simulation**: Pre-execution validation to prevent failed transactions
- **Allowance Optimization**: Efficient token approval management
- **Slippage Protection**: Configurable MEV protection


### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/katana-mcp-server.git
cd katana-mcp-server
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
WALLET_PRIVATE_KEY=your_private_key_here
```

⚠️ **Security Warning**: Never commit your private key to version control. Keep your `.env` file secure and private.

4. **Build the project**
```bash
pnpm run build
# or
npm run build
```

5. **Start the server**
```bash
pnpm run start
# or
npm run start
```

### Project Structure
```
katana-mcp-server/
├── index.ts              # Main server implementation
├── dist/                 # Compiled JavaScript
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            
```

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**"WALLET_PRIVATE_KEY not found"**
- Ensure your `.env` file contains your private key
- Verify the environment variable is correctly set

**"Insufficient balance" errors**
- Check your token balance on the source chain
- Ensure you have enough for gas fees
- Verify minimum deposit requirements are met

**Transaction failures**
- Try increasing slippage tolerance
- Check network congestion
- Ensure sufficient gas token balance

**Bridge issues**
- Verify the token is supported on the source chain
- Check minimum deposit amounts
- Ensure wallet has sufficient balance

### Getting Help

- **Issues**: Open an issue on GitHub with detailed error messages
- **Discussions**: Use GitHub Discussions for questions and feature requests
- **Documentation**: Check this README and inline code comments
