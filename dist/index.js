#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const sushi_1 = require("sushi");
dotenv_1.default.config();
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const RPC_URLS = {
    1: "https://eth.llamarpc.com",
    137: "https://polygon-rpc.com",
    42161: "https://arbitrum.llamarpc.com",
    10: "https://optimism.llamarpc.com",
    56: "https://bsc.llamarpc.com",
    43114: "https://avalanche.llamarpc.com",
    8453: "https://base.llamarpc.com",
    100: "https://rpc.gnosischain.com",
    747474: "https://rpc.katana.network"
};
const EVM_TOKEN_DECIMALS = {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6, // USDC on Ethereum
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 6, // USDT on Ethereum
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 6, // USDC on Polygon
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 6, // USDT on Polygon
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831': 6, // USDC on Arbitrum
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 6, // USDT on Arbitrum
    '0x0b2c639c533813f4aa9d7837caf62653d097ff85': 6, // USDC on Optimism
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': 6, // USDT on Optimism
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 6, // USDC on BSC
    '0x55d398326f99059ff775485246999027b3197955': 6, // USDT on BSC
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 6, // USDC on Base
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': 6, // USDT on Base
    '0x203a662b0bd271a6ed5a60edfbd04bfce608fd36': 6, // USDC on Katana
    '0x2dca96907fde857dd3d816880a0df407eeb2d2f2': 6, // USDT on Katana  
    '0xee7d8bcfb72bc1880d0cf19822eb0a2e6577ab62': 18, // ETH on Katana
    '0x0913da6da4b42f538b445599b46bb4622342cf52': 8, // WBTC on Katana
    '0x62d6a123e8d19d06d68cf0d2294f9a3a0362c6b3': 18, // USDS on Katana
    '0x00000000efe302beaa2b3e6e1b18d08d69a9012a': 6,
    '0x0000000000000000000000000000000000000000': 18 // Native token
};
const KATANA_TOKEN_MAP = {
    'ETH': '0xee7d8bcfb72bc1880d0cf19822eb0a2e6577ab62',
    'WETH': '0xee7d8bcfb72bc1880d0cf19822eb0a2e6577ab62',
    'WBTC': '0x0913da6da4b42f538b445599b46bb4622342cf52',
    'USDC': '0x203a662b0bd271a6ed5a60edfbd04bfce608fd36',
    'USDT': '0x2dca96907fde857dd3d816880a0df407eeb2d2f2',
    'USDS': '0x62d6a123e8d19d06d68cf0d2294f9a3a0362c6b3',
    'AUSD': '0x00000000efe302beaa2b3e6e1b18d08d69a9012a',
};
const KATANA_YEARN_VAULTS = {
    USDC: {
        address: "0x80c34BD3A3569E126e7055831036aa7b212cB159",
        name: "USDC yVault",
        symbol: "yvUSDC"
    },
    ETH: {
        address: "0xE007CA01894c863d7898045ed5A3B4Abf0b18f37",
        name: "ETH yVault",
        symbol: "yvETH"
    },
    USDT: {
        address: "0x9A6bd7B6Fd5C4F87eb66356441502fc7dCdd185B",
        name: "USDT yVault",
        symbol: "yvUSDT"
    },
    WBTC: {
        address: "0xAa0362eCC584B985056E47812931270b99C91f9d",
        name: "WBTC yVault",
        symbol: "yvWBTC"
    },
    AUSD: {
        address: "0x93Fec6639717b6215A48E5a72a162C50DCC40d68",
        name: "AUSD yVault",
        symbol: "yvAUSD"
    }
};
const LIFI_ERC20_ABI = [
    {
        "name": "approve",
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "name": "allowance",
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
// ABIs
const ERC20_ABI = [
    "function symbol() external view returns (string)",
    "function name() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)"
];
const ERC4626_ABI = [
    "function asset() external view returns (address)",
    "function totalAssets() external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function symbol() external view returns (string)",
    "function name() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function balanceOf(address account) external view returns (uint256)",
    "function convertToAssets(uint256 shares) external view returns (uint256)",
    "function convertToShares(uint256 assets) external view returns (uint256)",
    "function previewDeposit(uint256 assets) external view returns (uint256)",
    "function previewMint(uint256 shares) external view returns (uint256)",
    "function previewWithdraw(uint256 assets) external view returns (uint256)",
    "function previewRedeem(uint256 shares) external view returns (uint256)",
    "function maxDeposit(address receiver) external view returns (uint256)",
    "function maxMint(address receiver) external view returns (uint256)",
    "function maxWithdraw(address owner) external view returns (uint256)",
    "function maxRedeem(address owner) external view returns (uint256)",
    "function deposit(uint256 assets, address receiver) external returns (uint256)",
    "function mint(uint256 shares, address receiver) external returns (uint256)",
    "function withdraw(uint256 assets, address receiver, address owner) external returns (uint256)",
    "function redeem(uint256 shares, address receiver, address owner) external returns (uint256)"
];
const server = new mcp_js_1.McpServer({
    name: "Katana MCP ",
    version: "1.0.0",
    description: "MCP server for Katana network with LI.FI cross-chain swaps and Yearn vault integration",
});
function getChainId(chain) {
    if (typeof chain === 'number')
        return chain;
    const chainMap = {
        'ETH': 1, 'ETHEREUM': 1,
        'POL': 137, 'POLYGON': 137, 'MATIC': 137,
        'ARB': 42161, 'ARBITRUM': 42161,
        'OPT': 10, 'OPTIMISM': 10,
        'BSC': 56, 'BNB': 56,
        'AVAX': 43114, 'AVALANCHE': 43114,
        'BASE': 8453,
        'DAI': 100, 'GNOSIS': 100, 'XDAI': 100,
        'KATANA': 747474
    };
    if (!isNaN(Number(chain)))
        return parseInt(chain);
    return chainMap[chain.toUpperCase()] || null;
}
const BRIDGE_SUPPORTED_CHAINS = {
    ethereum: {
        chainId: 1,
        name: "Ethereum",
        minimumDepositUSD: 50,
        supportedTokens: [
            { symbol: "USDC", name: "USD Coin", decimals: 6, contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", minimumDeposit: "50" },
            { symbol: "DAI", name: "Dai Stablecoin", decimals: 18, contractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", minimumDeposit: "50" },
            { symbol: "USDT", name: "Tether USD", decimals: 6, contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", minimumDeposit: "50" },
            { symbol: "ETH", name: "Ethereum", decimals: 18, contractAddress: "0x0000000000000000000000000000000000000000", minimumDeposit: "50" }, // Native ETH
            { symbol: "WETH", name: "Wrapped Ethereum", decimals: 18, contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", minimumDeposit: "50" }
        ]
    },
    polygon: {
        chainId: 137,
        name: "Polygon",
        minimumDepositUSD: 2.5,
        supportedTokens: [
            { symbol: "USDC", name: "USD Coin", decimals: 6, contractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", minimumDeposit: "2.5" },
            { symbol: "DAI", name: "Dai Stablecoin", decimals: 18, contractAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", minimumDeposit: "2.5" },
            { symbol: "USDT", name: "Tether USD", decimals: 6, contractAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", minimumDeposit: "2.5" },
            { symbol: "ETH", name: "Ethereum", decimals: 18, contractAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", minimumDeposit: "2.5" },
            { symbol: "WETH", name: "Wrapped Ethereum", decimals: 18, contractAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", minimumDeposit: "2.5" },
            { symbol: "POL", name: "Polygon Ecosystem Token", decimals: 18, contractAddress: "0x455e53830391e86dd42C63Ff65FbA36C4F13d71E", minimumDeposit: "2.5" },
            { symbol: "MATIC", name: "Matic Token", decimals: 18, contractAddress: "0x0000000000000000000000000000000000001010", minimumDeposit: "2.5" }, // Native MATIC
            { symbol: "CBTC", name: "Compound Bitcoin", decimals: 8, contractAddress: "0x0D6C5afF7f086E5CB3F7e4Ea2D3BaDbCCff5f4b9", minimumDeposit: "2.5" },
            { symbol: "USDC.e", name: "USD Coin (Bridged)", decimals: 6, contractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", minimumDeposit: "2.5" },
            { symbol: "ARB", name: "Arbitrum", decimals: 18, contractAddress: "0x3E5CC6C9E10AF1cf57E3a69b96754ef0a36B3bf0", minimumDeposit: "2.5" }
        ]
    },
    base: {
        chainId: 8453,
        name: "Base",
        minimumDepositUSD: 2.5,
        supportedTokens: [
            { symbol: "USDC", name: "USD Coin", decimals: 6, contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", minimumDeposit: "2.5" },
            { symbol: "DAI", name: "Dai Stablecoin", decimals: 18, contractAddress: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", minimumDeposit: "2.5" },
            { symbol: "USDT", name: "Tether USD", decimals: 6, contractAddress: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", minimumDeposit: "2.5" },
            { symbol: "ETH", name: "Ethereum", decimals: 18, contractAddress: "0x0000000000000000000000000000000000000000", minimumDeposit: "2.5" }, // Native ETH
            { symbol: "WETH", name: "Wrapped Ethereum", decimals: 18, contractAddress: "0x4200000000000000000000000000000000000006", minimumDeposit: "2.5" },
            { symbol: "POL", name: "Polygon Ecosystem Token", decimals: 18, contractAddress: "0x4a1b3e39B76D51C85ADaaf2DD5e7c7673C9CBA22", minimumDeposit: "2.5" },
            { symbol: "MATIC", name: "Matic Token", decimals: 18, contractAddress: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2", minimumDeposit: "2.5" },
            { symbol: "CBTC", name: "Compound Bitcoin", decimals: 8, contractAddress: "0x9C145bbE4c7F6B5b1E4a0Dfb87f88F84Fb23E2da", minimumDeposit: "2.5" },
            { symbol: "USDC.e", name: "USD Coin (Bridged)", decimals: 6, contractAddress: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", minimumDeposit: "2.5" },
            { symbol: "ARB", name: "Arbitrum", decimals: 18, contractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548", minimumDeposit: "2.5" }
        ]
    },
    arbitrum: {
        chainId: 42161,
        name: "Arbitrum",
        minimumDepositUSD: 2.5,
        supportedTokens: [
            { symbol: "USDC", name: "USD Coin", decimals: 6, contractAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", minimumDeposit: "2.5" },
            { symbol: "DAI", name: "Dai Stablecoin", decimals: 18, contractAddress: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", minimumDeposit: "2.5" },
            { symbol: "USDT", name: "Tether USD", decimals: 6, contractAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", minimumDeposit: "2.5" },
            { symbol: "ETH", name: "Ethereum", decimals: 18, contractAddress: "0x0000000000000000000000000000000000000000", minimumDeposit: "2.5" }, // Native ETH
            { symbol: "WETH", name: "Wrapped Ethereum", decimals: 18, contractAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", minimumDeposit: "2.5" },
            { symbol: "POL", name: "Polygon Ecosystem Token", decimals: 18, contractAddress: "0x1EEA86b8e86a5c31f18e7D5Dc1f9B11eE4e84b45", minimumDeposit: "2.5" },
            { symbol: "MATIC", name: "Matic Token", decimals: 18, contractAddress: "0x561877b6b3dd7651313794e5f2894b2F18bE0766", minimumDeposit: "2.5" },
            { symbol: "CBTC", name: "Compound Bitcoin", decimals: 8, contractAddress: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", minimumDeposit: "2.5" },
            { symbol: "USDC.e", name: "USD Coin (Bridged)", decimals: 6, contractAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", minimumDeposit: "2.5" },
            { symbol: "ARB", name: "Arbitrum", decimals: 18, contractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548", minimumDeposit: "2.5" }
        ]
    }
};
function getTokenDecimals(tokenAddress) {
    const lowerCaseAddress = tokenAddress.toLowerCase();
    return EVM_TOKEN_DECIMALS[lowerCaseAddress] || 18;
}
function resolveTokenAddress(token) {
    if (ethers_1.ethers.isAddress(token)) {
        return token;
    }
    const upperToken = token.toUpperCase();
    return KATANA_TOKEN_MAP[upperToken] || token;
}
function convertAmountToSmallestUnit(amount, decimals) {
    const amountBN = ethers_1.ethers.parseUnits(amount.toString(), decimals);
    return amountBN.toString();
}
function getWalletAddress(privateKey = PRIVATE_KEY || "") {
    if (!privateKey) {
        throw new Error("Private key not found");
    }
    const wallet = new ethers_1.ethers.Wallet(privateKey);
    return wallet.address;
}
function getDefaultWallet() {
    if (!PRIVATE_KEY) {
        throw new Error("WALLET_PRIVATE_KEY environment variable is not set");
    }
    const rpcUrl = RPC_URLS[747474];
    if (!rpcUrl) {
        throw new Error("No RPC URL configured for Katana chain");
    }
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const cleanKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
        return new ethers_1.ethers.Wallet(cleanKey, provider);
    }
    catch (error) {
        throw new Error(`Failed to create wallet: ${error.message}`);
    }
}
function formatBalance(balance, decimals) {
    return ethers_1.ethers.formatUnits(balance, decimals);
}
function getProvider() {
    const rpcUrl = RPC_URLS[747474];
    if (!rpcUrl) {
        throw new Error("No RPC URL configured for Katana chain");
    }
    try {
        return new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    }
    catch (error) {
        throw new Error(`Failed to connect to Katana RPC: ${error.message}`);
    }
}
function isValidAddress(address) {
    try {
        return ethers_1.ethers.isAddress(address);
    }
    catch {
        return false;
    }
}
function getDefaultAddress() {
    if (!PRIVATE_KEY) {
        throw new Error("WALLET_PRIVATE_KEY environment variable is not set");
    }
    try {
        const cleanKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
        const wallet = new ethers_1.ethers.Wallet(cleanKey);
        return wallet.address;
    }
    catch (error) {
        throw new Error(`Failed to derive address from private key: ${error.message}`);
    }
}
function getSupportedBridgeChains() {
    return Object.keys(BRIDGE_SUPPORTED_CHAINS);
}
function getSupportedTokensForChain(chain) {
    const chainConfig = BRIDGE_SUPPORTED_CHAINS[chain.toLowerCase()];
    return chainConfig ? chainConfig.supportedTokens : [];
}
function isTokenSupportedOnChain(chain, token) {
    const supportedTokens = getSupportedTokensForChain(chain);
    return supportedTokens.some(t => t.symbol.toLowerCase() === token.toLowerCase());
}
function getMinimumDepositForChain(chain) {
    const chainConfig = BRIDGE_SUPPORTED_CHAINS[chain.toLowerCase()];
    return chainConfig ? chainConfig.minimumDepositUSD : 50;
}
async function sendTokensToDepositAddress(sourceChain, tokenSymbol, amount, depositAddress) {
    try {
        const chainConfig = BRIDGE_SUPPORTED_CHAINS[sourceChain.toLowerCase()];
        if (!chainConfig) {
            throw new Error(`Unsupported source chain: ${sourceChain}`);
        }
        const tokenInfo = chainConfig.supportedTokens.find(t => t.symbol.toLowerCase() === tokenSymbol.toLowerCase());
        if (!tokenInfo) {
            throw new Error(`Token ${tokenSymbol} not supported on ${sourceChain}`);
        }
        const sourceChainId = chainConfig.chainId;
        const rpcUrl = RPC_URLS[sourceChainId];
        if (!rpcUrl) {
            throw new Error(`No RPC URL configured for ${sourceChain} (${sourceChainId})`);
        }
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
        const walletAddress = wallet.address;
        console.log(`Sending ${amount} ${tokenSymbol} from ${walletAddress} to ${depositAddress} on ${sourceChain}`);
        let transaction;
        const amountWei = ethers_1.ethers.parseUnits(amount, tokenInfo.decimals);
        if (tokenSymbol.toLowerCase() === 'eth' || tokenSymbol.toLowerCase() === 'matic' || tokenSymbol.toLowerCase() === 'pol') {
            transaction = await wallet.sendTransaction({
                to: depositAddress,
                value: amountWei,
                gasLimit: 21000
            });
        }
        else {
            if (!tokenInfo.contractAddress) {
                throw new Error(`Contract address not configured for ${tokenSymbol} on ${sourceChain}`);
            }
            const tokenContract = new ethers_1.ethers.Contract(tokenInfo.contractAddress, ["function transfer(address to, uint256 amount) external returns (bool)"], wallet);
            transaction = await tokenContract.transfer(depositAddress, amountWei, {
                gasLimit: 100000
            });
        }
        const receipt = await transaction.wait();
        return {
            transactionHash: transaction.hash,
            blockNumber: receipt?.blockNumber,
            gasUsed: receipt?.gasUsed?.toString(),
            explorerUrl: getExplorerUrl(sourceChainId, transaction.hash),
            status: "confirmed"
        };
    }
    catch (error) {
        console.error('Transaction failed:', error.message);
        throw new Error(`Failed to send tokens: ${error.message}`);
    }
}
async function checkAllowance(tokenAddress, ownerAddress, spenderAddress) {
    try {
        const allowance = await publicClient.readContract({
            address: tokenAddress,
            abi: SUSHI_ERC20_ABI,
            functionName: 'allowance',
            args: [ownerAddress, spenderAddress],
        });
        return allowance;
    }
    catch (error) {
        console.error(`Error checking allowance:`, error.message);
        return 0n;
    }
}
async function approveTokenViem(tokenAddress, spenderAddress, amount) {
    const walletClient = (0, viem_1.createWalletClient)({
        chain: katanaChain,
        transport: (0, viem_1.http)(),
    });
    try {
        const hash = await walletClient.writeContract({
            account: (0, accounts_1.privateKeyToAccount)(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`),
            address: tokenAddress,
            abi: SUSHI_ERC20_ABI,
            functionName: 'approve',
            args: [spenderAddress, amount],
        });
        console.log(`Approval transaction sent: ${hash}`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`Approval confirmed in block: ${receipt.blockNumber}`);
        return receipt;
    }
    catch (error) {
        console.error(`Approval failed:`, error.message);
        throw error;
    }
}
function getExplorerUrl(chainId, txHash) {
    const explorers = {
        1: `https://etherscan.io/tx/${txHash}`,
        137: `https://polygonscan.com/tx/${txHash}`,
        42161: `https://arbiscan.io/tx/${txHash}`,
        10: `https://optimistic.etherscan.io/tx/${txHash}`,
        56: `https://bscscan.com/tx/${txHash}`,
        43114: `https://snowtrace.io/tx/${txHash}`,
        8453: `https://basescan.org/tx/${txHash}`,
        100: `https://gnosisscan.io/tx/${txHash}`,
        747474: `https://explorer.katana.network/tx/${txHash}`
    };
    return explorers[chainId] || `https://etherscan.io/tx/${txHash}`;
}
const katanaChain = (0, viem_1.defineChain)({
    id: 747474,
    name: 'Katana',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.katana.network'],
        },
        public: {
            http: ['https://rpc.katana.network'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Katana Explorer',
            url: 'https://explorer.katanarpc.com'
        },
    },
    testnet: false,
});
const publicClient = (0, viem_1.createPublicClient)({
    chain: katanaChain,
    transport: (0, viem_1.http)(),
});
const SUSHI_ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            { "name": "_owner", "type": "address" },
            { "name": "_spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "name": "_spender", "type": "address" },
            { "name": "_value", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
    }
];
//Tool:  Bridge Assets on katana
server.tool("bridgeAssets", "Bridge tokens from supported chains to Katana network. Automatically generates deposit address and sends tokens from your wallet. Also inform user their tokens will be automatically bridged to ETH on Katana.", {
    asset: zod_1.z.string().describe("Token symbol to bridge (e.g., 'USDC', 'ETH', 'DAI')"),
    chain: zod_1.z.string().describe("Source chain name (ethereum, polygon, base, arbitrum)"),
    amount: zod_1.z.string().describe("Amount to bridge in token units (e.g., '100' for 100 USDC)")
}, async ({ asset, chain, amount }) => {
    try {
        if (!PRIVATE_KEY) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: "error",
                            message: "WALLET_PRIVATE_KEY not found in environment variables"
                        }, null, 2)
                    }]
            };
        }
        const supportedChains = getSupportedBridgeChains();
        if (!supportedChains.includes(chain.toLowerCase())) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: "error",
                            message: `Unsupported chain: ${chain}`,
                            supportedChains: supportedChains,
                            providedChain: chain
                        }, null, 2)
                    }]
            };
        }
        if (!isTokenSupportedOnChain(chain, asset)) {
            const supportedTokens = getSupportedTokensForChain(chain);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: "error",
                            message: `Token ${asset} is not supported on ${chain}`,
                            supportedTokensOnChain: supportedTokens.map(t => ({
                                symbol: t.symbol,
                                name: t.name,
                                minimumDeposit: `$${t.minimumDeposit}`
                            })),
                            providedToken: asset,
                            providedChain: chain
                        }, null, 2)
                    }]
            };
        }
        const minimumDepositUSD = getMinimumDepositForChain(chain);
        const chainConfig = BRIDGE_SUPPORTED_CHAINS[chain.toLowerCase()];
        const tokenInfo = chainConfig.supportedTokens.find(t => t.symbol.toLowerCase() === asset.toLowerCase());
        console.log(`Minimum deposit for ${chain}: $${minimumDepositUSD}`);
        console.log(`Amount requested: ${amount} ${asset}`);
        const walletAddress = getDefaultAddress();
        const targetAssetTicker = "ETH";
        const resolvedTokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
        const expirationTimestampMs = Date.now() + (24 * 60 * 60 * 1000);
        const payload = {
            userId: walletAddress,
            toChainId: "747474",
            toTokenAddress: resolvedTokenAddress,
            recipientAddr: walletAddress,
            clientMetadata: {
                id: "",
                startTimestampMs: Date.now(),
                finalDollarValue: 0,
                latestQuote: null,
                depositAddress: null,
                initSettings: {
                    config: {
                        targetAsset: resolvedTokenAddress,
                        targetChain: "747474",
                        targetAssetTicker: targetAssetTicker,
                        expirationTimestampMs: expirationTimestampMs,
                        checkoutItemTitle: `Bridge ${amount} ${asset} to Katana`
                    }
                },
                selectedSourceAssetInfo: {
                    address: tokenInfo?.contractAddress || "0x",
                    symbol: asset,
                    chainId: chainConfig.chainId.toString(),
                    iconSrc: null
                },
                selectedPaymentMethodInfo: {
                    paymentMethod: "token_transfer",
                    title: "Automated Bridge Transfer",
                    description: `Bridge ${amount} ${asset} from ${chain} to Katana`
                }
            }
        };
        console.log('Generating deposit address...');
        const response = await axios_1.default.post('https://api.fun.xyz/v1/eoa', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
                'Origin': 'https://app.katana.network',
                'Referer': 'https://app.katana.network/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                'X-Api-Key': 'OXLUmejkh9PlNDS4gSvi9gcEWacOpTz2KUVepVf4',
                'Sec-Ch-Ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
                'Sec-Ch-Ua-Mobile': '?1',
                'Sec-Ch-Ua-Platform': '"Android"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
                'Priority': 'u=1, i'
            }
        });
        const responseData = response.data;
        const depositAddr = responseData.depositAddr;
        if (!depositAddr) {
            throw new Error('No deposit address returned from API');
        }
        console.log(`Deposit address generated: ${depositAddr}`);
        console.log(`Sending ${amount} ${asset} to deposit address...`);
        const transactionResult = await sendTokensToDepositAddress(chain, asset, amount, depositAddr);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "success",
                        summary: `Successfully initiated bridge of ${amount} ${asset} from ${chain} to Katana!`,
                        bridgeDetails: {
                            sourceChain: `${chainConfig.name} (${chainConfig.chainId})`,
                            targetChain: "Katana (747474)",
                            asset: asset,
                            amount: amount,
                            minimumDepositMet: `$${minimumDepositUSD}`,
                            depositAddress: depositAddr,
                            yourWalletAddress: walletAddress
                        },
                        transaction: {
                            ...transactionResult,
                            message: `Sent ${amount} ${asset} from your wallet to bridge deposit address`
                        },
                        instructions: 'Your tokens will be automatically bridged to ETH on Katana network. It may take a few minutes to complete.',
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        console.error('Bridge process failed:', error.response?.data || error.message);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "error",
                        message: `Bridge failed: ${error.message}`,
                        input: {
                            asset,
                            chain,
                            amount
                        },
                        details: error.response?.data || error.code || "Unknown error",
                        supportedChains: getSupportedBridgeChains(),
                        troubleshooting: {
                            commonIssues: [
                                "Insufficient token balance",
                                "Token not supported on source chain",
                                "Amount below minimum deposit threshold",
                                "Network connectivity issues"
                            ],
                            suggestions: [
                                "Check your token balance on source chain",
                                "Verify token is in supported list",
                                `Ensure amount meets minimum deposit requirement`,
                                "Try again in a few minutes"
                            ]
                        },
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    }
});
// Tool: Get token balances on Katana
server.tool("getTokenBalances", "Get token balances for your wallet on Katana network (uses address from private key in environment)", {}, async () => {
    try {
        if (!PRIVATE_KEY) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: "error",
                            message: "WALLET_PRIVATE_KEY not found in environment variables"
                        }, null, 2)
                    }]
            };
        }
        const targetAddress = getWalletAddress(PRIVATE_KEY);
        if (!ethers_1.ethers.isAddress(targetAddress)) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: "error",
                            message: "Invalid wallet address format derived from private key"
                        }, null, 2)
                    }]
            };
        }
        let tokenBalances = [];
        let dataSource = "staging";
        let apiError = null;
        try {
            console.log("Attempting staging API...");
            const stagingResponse = await axios_1.default.get(`https://api-staging.katana.network/v1/tokens/balances/${targetAddress}`, {
                headers: {
                    'authority': 'api-staging.katana.network',
                    'method': 'GET',
                    'path': `/v1/tokens/balances/${targetAddress}`,
                    'scheme': 'https',
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en-US,en=0.9,hq=0.8',
                    'Content-Type': 'application/json',
                    'Origin': 'https://app.katana.network',
                    'Priority': 'u=1, i',
                    'Referer': 'https://app.katana.network/',
                    'Sec-Ch-Ua': '"Google Chrome";v="137", "Chromium";v="137", "Not(A)Brand";v="24"',
                    'Sec-Ch-Ua-Mobile': '?1',
                    'Sec-Ch-Ua-Platform': '"Android"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                }
            });
            const responseData = stagingResponse.data;
            console.log("Staging API response structure:", typeof responseData, responseData);
            if (responseData && responseData.balances && Array.isArray(responseData.balances)) {
                tokenBalances = responseData.balances;
                console.log(`Staging API success: Found ${tokenBalances.length} tokens`);
            }
            else if (Array.isArray(responseData)) {
                tokenBalances = responseData;
                console.log(`Staging API success: Direct array with ${tokenBalances.length} tokens`);
            }
            else {
                throw new Error(`Invalid staging API response format: ${typeof responseData}`);
            }
        }
        catch (stagingError) {
            dataSource = "explorer";
            try {
                console.log("Attempting explorer API fallback...");
                const explorerResponse = await axios_1.default.get(`https://explorer-katana.t.conduit.xyz/api/v2/addresses/${targetAddress}/token-balances`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const explorerData = explorerResponse.data;
                console.log("Explorer API response structure:", typeof explorerData, explorerData);
                if (Array.isArray(explorerData)) {
                    tokenBalances = explorerData;
                    console.log(`Explorer API success: Found ${tokenBalances.length} tokens`);
                }
                else {
                    throw new Error(`Invalid explorer API response format: ${typeof explorerData}`);
                }
            }
            catch (explorerError) {
                console.log("Explorer API also failed:");
                throw new Error(`Both APIs failed.`);
            }
        }
        let formattedBalances = [];
        let totalValueUSD = 0;
        if (dataSource === "staging") {
            formattedBalances = tokenBalances.map((token) => {
                const decimals = parseInt(token.decimals || '18');
                const rawBalance = token.balance || '0';
                let humanReadableBalance = '0';
                try {
                    if (rawBalance !== '0' && rawBalance !== 0) {
                        humanReadableBalance = ethers_1.ethers.formatUnits(rawBalance.toString(), decimals);
                    }
                }
                catch (error) {
                    console.error(`Error parsing balance for ${token.symbol}:`, error);
                    humanReadableBalance = 'Error parsing value';
                }
                const valueUSD = parseFloat(token.value_usd || '0');
                totalValueUSD += valueUSD;
                return {
                    tokenAddress: token.token_address || 'N/A',
                    tokenName: token.name || 'Unknown',
                    tokenSymbol: token.symbol || 'Unknown',
                    decimals: decimals,
                    balance: rawBalance.toString(),
                    rawBalance: rawBalance.toString(),
                    humanReadableBalance: humanReadableBalance,
                    tokenType: token.type || 'ERC20',
                    priceUSD: parseFloat(token.price || '0'),
                    valueUSD: valueUSD,
                    logoUrl: token.logo_url || null,
                    chainId: token.chain_id || 747474
                };
            });
        }
        else {
            formattedBalances = tokenBalances.map((tokenData) => {
                const token = tokenData.token || {};
                const decimals = parseInt(token.decimals || '18');
                const rawBalance = tokenData.value || '0';
                let humanReadableBalance = '0';
                try {
                    if (rawBalance !== '0' && rawBalance !== 0) {
                        humanReadableBalance = ethers_1.ethers.formatUnits(rawBalance.toString(), decimals);
                    }
                }
                catch (error) {
                    console.error(`Error parsing balance for ${token.symbol}:`, error);
                    humanReadableBalance = 'Error parsing value';
                }
                return {
                    tokenAddress: token.address || 'N/A',
                    tokenName: token.name || 'Unknown',
                    tokenSymbol: token.symbol || 'Unknown',
                    decimals: decimals,
                    balance: rawBalance.toString(),
                    rawBalance: rawBalance.toString(),
                    humanReadableBalance: humanReadableBalance,
                    tokenType: token.type || 'Unknown',
                    priceUSD: 0,
                    valueUSD: 0,
                    logoUrl: null,
                    chainId: 747474
                };
            });
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "success",
                        walletAddress: targetAddress,
                        network: "Katana (Chain ID: 747474)",
                        dataSource: dataSource,
                        totalTokens: formattedBalances.length,
                        totalValueUSD: dataSource === "staging" ? totalValueUSD : null,
                        tokenBalances: formattedBalances,
                        explorerUrl: `https://explorer.katana.network/address/${targetAddress}`,
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        console.error("getTokenBalances error:", error);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "error"
                    }, null, 2)
                }]
        };
    }
});
// Tool: Get Yearn vault info
server.tool("getYearnVaultInfo", "Get detailed information about Yearn vaults on Katana network", {
    vaultAddress: zod_1.z.string().optional().describe("Specific vault address to query (optional - if not provided, returns info for all known vaults)")
}, async ({ vaultAddress }) => {
    try {
        const provider = getProvider();
        let vaultsToQuery = [];
        if (vaultAddress) {
            if (!isValidAddress(vaultAddress)) {
                throw new Error(`Invalid vault address: ${vaultAddress}`);
            }
            vaultsToQuery.push({ address: vaultAddress, symbol: "Unknown", name: "Unknown Vault" });
        }
        else {
            vaultsToQuery = Object.values(KATANA_YEARN_VAULTS);
        }
        const vaultInfoPromises = vaultsToQuery.map(async (vault) => {
            try {
                const vaultContract = new ethers_1.ethers.Contract(vault.address, ERC4626_ABI, provider);
                let asset, totalAssets, totalSupply, symbol, name, decimals;
                try {
                    [asset, totalAssets, totalSupply, symbol, name, decimals] = await Promise.all([
                        vaultContract.asset(),
                        vaultContract.totalAssets(),
                        vaultContract.totalSupply(),
                        vaultContract.symbol().catch(() => vault.symbol),
                        vaultContract.name().catch(() => vault.name),
                        vaultContract.decimals().catch(() => 18n)
                    ]);
                }
                catch (contractError) {
                    throw new Error(`Contract call failed: ${contractError.message}`);
                }
                const assetContract = new ethers_1.ethers.Contract(asset, ERC20_ABI, provider);
                let assetSymbol, assetName, assetDecimals;
                try {
                    [assetSymbol, assetName, assetDecimals] = await Promise.all([
                        assetContract.symbol().catch(() => "UNKNOWN"),
                        assetContract.name().catch(() => "Unknown Asset"),
                        assetContract.decimals().catch(() => 18n)
                    ]);
                }
                catch (assetError) {
                    assetSymbol = "UNKNOWN";
                    assetName = "Unknown Asset";
                    assetDecimals = 18n;
                }
                const vaultDecimals = Number(decimals);
                const underlyingDecimals = Number(assetDecimals);
                let sharePrice = "0";
                try {
                    if (totalSupply > 0n) {
                        const oneShare = ethers_1.ethers.parseUnits("1", vaultDecimals);
                        const pricePerShare = await vaultContract.convertToAssets(oneShare);
                        sharePrice = formatBalance(pricePerShare, underlyingDecimals);
                    }
                }
                catch (priceError) {
                    console.warn(`Could not calculate share price for ${vault.address}: ${priceError.message}`);
                    sharePrice = "N/A";
                }
                return {
                    vaultAddress: vault.address,
                    vaultSymbol: symbol,
                    vaultName: name,
                    vaultDecimals: vaultDecimals,
                    underlyingAsset: {
                        address: asset,
                        symbol: assetSymbol,
                        name: assetName,
                        decimals: underlyingDecimals
                    },
                    totalAssets: formatBalance(totalAssets, underlyingDecimals),
                    totalSupply: formatBalance(totalSupply, vaultDecimals),
                    sharePrice: sharePrice,
                    rawData: {
                        totalAssetsWei: totalAssets.toString(),
                        totalSupplyWei: totalSupply.toString()
                    },
                    status: "active"
                };
            }
            catch (error) {
                return {
                    vaultAddress: vault.address,
                    vaultSymbol: vault.symbol || "Unknown",
                    vaultName: vault.name || "Unknown Vault",
                    status: "error",
                    error: error.message
                };
            }
        });
        const vaultInfos = await Promise.all(vaultInfoPromises);
        const response = {
            network: "Katana (Chain ID: 747474)",
            queryType: vaultAddress ? "specific_vault" : "all_known_vaults",
            vaults: vaultInfos,
            totalVaults: vaultInfos.length,
            activeVaults: vaultInfos.filter(v => v.status === "active").length,
            knownVaults: Object.keys(KATANA_YEARN_VAULTS),
            timestamp: new Date().toISOString()
        };
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(response, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "error",
                        message: `Failed to get vault info: ${error.message}`,
                        vaultAddress: vaultAddress || "none_provided",
                        network: "Katana (Chain ID: 747474)"
                    }, null, 2)
                }]
        };
    }
});
// depositToYearnVault 
server.tool("depositToYearnVault", "Deposit tokens into a Yearn vault on Katana network. Only works with tokens already on Katana (USDC, ETH, WBTC, USDT, AUSD).", {
    token: zod_1.z.string().describe("Token to deposit that's already on Katana (e.g., 'USDC', 'ETH', 'WBTC')"),
    amount: zod_1.z.string().describe("Amount to deposit in human-readable format (e.g., '100' for 100 USDC)"),
    vaultTarget: zod_1.z.enum(["USDC", "ETH", "WBTC", "USDT", "AUSD"]).describe("Target vault to deposit into (e.g., 'USDC' vault to get yvUSDC)")
}, async ({ token, amount, vaultTarget }) => {
    try {
        if (!PRIVATE_KEY) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: "error",
                            message: "WALLET_PRIVATE_KEY not found in environment variables"
                        }, null, 2)
                    }]
            };
        }
        const vaultInfo = KATANA_YEARN_VAULTS[vaultTarget];
        if (!vaultInfo) {
            throw new Error(`No vault found for ${vaultTarget}`);
        }
        const resolvedToken = resolveTokenAddress(token);
        const targetKatanaToken = resolveTokenAddress(vaultTarget);
        console.log(`Target vault: ${vaultInfo.symbol} (${vaultInfo.address})`);
        console.log(`Input token: ${token} (${resolvedToken})`);
        console.log(`Target Katana token: ${vaultTarget} (${targetKatanaToken})`);
        if (resolvedToken.toLowerCase() !== targetKatanaToken.toLowerCase()) {
            throw new Error(`Token mismatch: trying to deposit ${token} into ${vaultTarget} vault. Please use the corresponding token or use SushiSwap to swap first.`);
        }
        console.log(`Direct deposit: ${amount} ${vaultTarget} into ${vaultInfo.symbol} vault...`);
        const wallet = getDefaultWallet();
        const walletAddress = wallet.address;
        const vaultContract = new ethers_1.ethers.Contract(vaultInfo.address, ERC4626_ABI, wallet);
        const [asset, vaultSymbol, vaultDecimals] = await Promise.all([
            vaultContract.asset(),
            vaultContract.symbol().catch(() => "yvToken"),
            vaultContract.decimals().catch(() => 18)
        ]);
        const assetContract = new ethers_1.ethers.Contract(asset, ERC20_ABI, wallet);
        const [assetSymbol, assetDecimals] = await Promise.all([
            assetContract.symbol().catch(() => "UNKNOWN"),
            assetContract.decimals().catch(() => 18)
        ]);
        const depositAmount = ethers_1.ethers.parseUnits(amount, assetDecimals);
        if (depositAmount <= 0n) {
            throw new Error("Amount must be greater than 0");
        }
        const assetBalance = await assetContract.balanceOf(walletAddress);
        if (assetBalance < depositAmount) {
            throw new Error(`Insufficient ${assetSymbol} balance. Required: ${amount}, Available: ${formatBalance(assetBalance, assetDecimals)}`);
        }
        const currentAllowance = await assetContract.allowance(walletAddress, vaultInfo.address);
        if (currentAllowance < depositAmount) {
            console.log("Approving vault to spend tokens...");
            const approveTx = await assetContract.approve(vaultInfo.address, depositAmount, {
                gasLimit: 100000
            });
            await approveTx.wait();
        }
        const initialAssetBalance = await assetContract.balanceOf(walletAddress);
        const initialVaultBalance = await vaultContract.balanceOf(walletAddress);
        const expectedShares = await vaultContract.previewDeposit(depositAmount);
        const tx = await vaultContract.deposit(depositAmount, walletAddress, {
            gasLimit: 200000
        });
        const receipt = await tx.wait();
        const finalAssetBalance = await assetContract.balanceOf(walletAddress);
        const finalVaultBalance = await vaultContract.balanceOf(walletAddress);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "success",
                        type: "direct_deposit",
                        summary: `Successfully deposited ${amount} ${assetSymbol} into ${vaultSymbol} vault!`,
                        transactionHash: tx.hash,
                        blockNumber: receipt?.blockNumber,
                        gasUsed: receipt?.gasUsed.toString(),
                        walletAddress,
                        vaultAddress: vaultInfo.address,
                        vaultSymbol,
                        underlyingAsset: {
                            address: asset,
                            symbol: assetSymbol
                        },
                        amountDeposited: amount,
                        expectedShares: formatBalance(expectedShares, vaultDecimals),
                        balanceChanges: {
                            assetBalance: {
                                before: formatBalance(initialAssetBalance, assetDecimals),
                                after: formatBalance(finalAssetBalance, assetDecimals)
                            },
                            vaultBalance: {
                                before: formatBalance(initialVaultBalance, vaultDecimals),
                                after: formatBalance(finalVaultBalance, vaultDecimals)
                            }
                        },
                        explorerUrl: getExplorerUrl(747474, tx.hash),
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "error",
                        message: `Vault deposit failed: ${error.message}`,
                        token,
                        amount,
                        vaultTarget,
                        details: error.code || error.reason || "Unknown error",
                        suggestion: "Make sure you have the correct token on Katana. Use SushiSwap to swap tokens first if needed."
                    }, null, 2)
                }]
        };
    }
});
// Tool: Withdraw from Yearn vault
server.tool("withdrawFromYearnVault", "Withdraw tokens from a Yearn vault on Katana chain", {
    vaultAddress: zod_1.z.string().describe("Address of the Yearn vault to withdraw from"),
    amount: zod_1.z.string().describe("Amount of underlying tokens to withdraw (in token units, e.g., '1.5')"),
    withdrawType: zod_1.z.enum(["assets", "shares"]).default("assets").describe("Whether to withdraw by asset amount or share amount")
}, async ({ vaultAddress, amount, withdrawType }) => {
    try {
        if (!isValidAddress(vaultAddress)) {
            throw new Error(`Invalid vault address: ${vaultAddress}`);
        }
        const wallet = getDefaultWallet();
        const walletAddress = wallet.address;
        const vaultContract = new ethers_1.ethers.Contract(vaultAddress, ERC4626_ABI, wallet);
        const [asset, vaultSymbol, vaultDecimals] = await Promise.all([
            vaultContract.asset(),
            vaultContract.symbol().catch(() => "yvToken"),
            vaultContract.decimals().catch(() => 18)
        ]);
        const assetContract = new ethers_1.ethers.Contract(asset, ERC20_ABI, wallet);
        const [assetSymbol, assetDecimals] = await Promise.all([
            assetContract.symbol().catch(() => "UNKNOWN"),
            assetContract.decimals().catch(() => 18)
        ]);
        const initialAssetBalance = await assetContract.balanceOf(walletAddress);
        const initialVaultBalance = await vaultContract.balanceOf(walletAddress);
        let tx, expectedAssets, expectedShares;
        if (withdrawType === "assets") {
            const withdrawAmount = ethers_1.ethers.parseUnits(amount, assetDecimals);
            if (withdrawAmount <= 0n) {
                throw new Error("Amount must be greater than 0");
            }
            const maxWithdraw = await vaultContract.maxWithdraw(walletAddress);
            if (withdrawAmount > maxWithdraw) {
                throw new Error(`Insufficient vault position. Requested: ${amount}, Available: ${formatBalance(maxWithdraw, assetDecimals)}`);
            }
            expectedShares = await vaultContract.previewWithdraw(withdrawAmount);
            expectedAssets = withdrawAmount;
            tx = await vaultContract.withdraw(withdrawAmount, walletAddress, walletAddress, {
                gasLimit: 200000
            });
        }
        else {
            const shareAmount = ethers_1.ethers.parseUnits(amount, vaultDecimals);
            if (shareAmount <= 0n) {
                throw new Error("Amount must be greater than 0");
            }
            if (initialVaultBalance < shareAmount) {
                throw new Error(`Insufficient vault shares. Requested: ${amount}, Available: ${formatBalance(initialVaultBalance, vaultDecimals)}`);
            }
            expectedAssets = await vaultContract.previewRedeem(shareAmount);
            expectedShares = shareAmount;
            tx = await vaultContract.redeem(shareAmount, walletAddress, walletAddress, {
                gasLimit: 200000
            });
        }
        const receipt = await tx.wait();
        const finalAssetBalance = await assetContract.balanceOf(walletAddress);
        const finalVaultBalance = await vaultContract.balanceOf(walletAddress);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "success",
                        transactionHash: tx.hash,
                        blockNumber: receipt?.blockNumber,
                        gasUsed: receipt?.gasUsed.toString(),
                        walletAddress,
                        vaultAddress,
                        vaultSymbol,
                        underlyingAsset: {
                            address: asset,
                            symbol: assetSymbol
                        },
                        withdrawType,
                        amountRequested: amount,
                        expectedAssets: formatBalance(expectedAssets, assetDecimals),
                        expectedShares: formatBalance(expectedShares, vaultDecimals),
                        balanceChanges: {
                            assetBalance: {
                                before: formatBalance(initialAssetBalance, assetDecimals),
                                after: formatBalance(finalAssetBalance, assetDecimals)
                            },
                            vaultBalance: {
                                before: formatBalance(initialVaultBalance, vaultDecimals),
                                after: formatBalance(finalVaultBalance, vaultDecimals)
                            }
                        },
                        explorerUrl: getExplorerUrl(747474, tx.hash),
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "error",
                        message: `Failed to withdraw from vault: ${error.message}`,
                        vaultAddress,
                        amount,
                        withdrawType
                    }, null, 2)
                }]
        };
    }
});
// Tool: Get user's Yearn vault positions
server.tool("getUserYearnPositions", "Get detailed information about your Yearn vault positions (uses address from private key in environment)", {
    address: zod_1.z.string().optional().describe("Optional: Wallet address to check Yearn positions for (defaults to address from private key in env)")
}, async ({ address }) => {
    try {
        const targetAddress = address || getDefaultAddress();
        if (!isValidAddress(targetAddress)) {
            throw new Error(`Invalid wallet address: ${targetAddress}`);
        }
        const provider = getProvider();
        const vaultAddresses = Object.values(KATANA_YEARN_VAULTS).map(v => v.address);
        const positionPromises = vaultAddresses.map(async (vaultAddress) => {
            try {
                const vaultContract = new ethers_1.ethers.Contract(vaultAddress, ERC4626_ABI, provider);
                const shareBalance = await vaultContract.balanceOf(targetAddress);
                if (shareBalance === 0n) {
                    return null;
                }
                const [asset, vaultSymbol, vaultName, vaultDecimals, underlyingValue, totalAssets, totalSupply] = await Promise.all([
                    vaultContract.asset(),
                    vaultContract.symbol().catch(() => "yvToken"),
                    vaultContract.name().catch(() => "Yearn Vault"),
                    vaultContract.decimals().catch(() => 18),
                    vaultContract.convertToAssets(shareBalance),
                    vaultContract.totalAssets(),
                    vaultContract.totalSupply()
                ]);
                const assetContract = new ethers_1.ethers.Contract(asset, ERC20_ABI, provider);
                const [assetSymbol, assetName, assetDecimals] = await Promise.all([
                    assetContract.symbol().catch(() => "UNKNOWN"),
                    assetContract.name().catch(() => "Unknown Asset"),
                    assetContract.decimals().catch(() => 18)
                ]);
                const sharePercentage = totalSupply === 0n ? 0 :
                    Number((shareBalance * 10000n) / totalSupply) / 100;
                return {
                    vaultAddress,
                    vaultSymbol,
                    vaultName,
                    underlyingAsset: {
                        address: asset,
                        symbol: assetSymbol,
                        name: assetName
                    },
                    userPosition: {
                        shareBalance: formatBalance(shareBalance, vaultDecimals),
                        underlyingValue: formatBalance(underlyingValue, assetDecimals),
                        shareOfVault: `${sharePercentage.toFixed(4)}%`
                    },
                    vaultMetrics: {
                        totalAssets: formatBalance(totalAssets, assetDecimals),
                        totalSupply: formatBalance(totalSupply, vaultDecimals),
                        sharePrice: formatBalance(totalSupply === 0n ? ethers_1.ethers.parseUnits("1", assetDecimals) :
                            (totalAssets * ethers_1.ethers.parseUnits("1", vaultDecimals)) / totalSupply, assetDecimals)
                    }
                };
            }
            catch (error) {
                console.error(`Error getting position for vault ${vaultAddress}:`, error.message);
                return null;
            }
        });
        const positions = (await Promise.all(positionPromises)).filter(p => p !== null);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        address: targetAddress,
                        addressSource: address ? "provided" : "derived_from_private_key",
                        network: "Katana (Chain ID: 747474)",
                        totalPositions: positions.length,
                        positions,
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "error",
                        message: `Failed to get Yearn positions: ${error.message}`,
                        address: address || "derived_from_private_key"
                    }, null, 2)
                }]
        };
    }
});
// Tool: Get SushiSwap quote
server.tool("getSushiQuote", "Get a quote for swapping tokens on SushiSwap on Katana network", {
    tokenIn: zod_1.z.string().describe("Input token symbol or address (e.g., 'ETH', 'USDC', or token address)"),
    tokenOut: zod_1.z.string().describe("Output token symbol or address (e.g., 'USDT', 'WBTC', or token address)"),
    amount: zod_1.z.string().describe("Amount to swap in human-readable format (e.g., '1.5' for 1.5 tokens)"),
    maxSlippage: zod_1.z.number().optional().default(0.5).describe("Maximum slippage tolerance as percentage (e.g., 0.5 for 0.5%)")
}, async ({ tokenIn, tokenOut, amount, maxSlippage }) => {
    try {
        const tokenInAddress = resolveTokenAddress(tokenIn);
        const tokenOutAddress = resolveTokenAddress(tokenOut);
        const tokenInDecimals = getTokenDecimals(tokenInAddress);
        const amountWei = convertAmountToSmallestUnit(amount, tokenInDecimals);
        console.log(`Getting SushiSwap quote: ${amount} ${tokenIn} -> ${tokenOut}`);
        console.log(`Token addresses: ${tokenInAddress} -> ${tokenOutAddress}`);
        const quoteData = await (0, sushi_1.getQuote)({
            chainId: 747474,
            tokenIn: tokenInAddress.startsWith('0x') ? tokenInAddress : `0x${tokenInAddress}`,
            tokenOut: tokenOutAddress.startsWith('0x') ? tokenOutAddress : `0x${tokenOutAddress}`,
            amount: BigInt(amountWei),
            maxSlippage: maxSlippage / 100,
        });
        if (!quoteData || quoteData.status !== 'Success') {
            throw new Error(`Failed to get quote: ${quoteData?.status || 'Unknown error'}`);
        }
        const tokenOutDecimals = getTokenDecimals(tokenOutAddress);
        const expectedOutput = quoteData.assumedAmountOut;
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "success",
                        quote: {
                            tokenIn: {
                                symbol: tokenIn,
                                address: tokenInAddress,
                                amount: amount,
                                amountWei: amountWei
                            },
                            tokenOut: {
                                symbol: tokenOut,
                                address: tokenOutAddress,
                                expectedAmount: expectedOutput
                            },
                            maxSlippage: `${maxSlippage}%`,
                        },
                        network: "Katana (Chain ID: 747474)",
                        dex: "SushiSwap",
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "error",
                        message: `Failed to get SushiSwap quote: ${error.message}`,
                        tokenIn,
                        tokenOut,
                        amount,
                        maxSlippage,
                        details: error.code || "Unknown error"
                    }, null, 2)
                }]
        };
    }
});
server.tool("executeSushiSwap", "Execute a token swap on SushiSwap on Katana network", {
    tokenIn: zod_1.z.string().describe("Input token symbol or address (e.g., 'USDC', 'ETH', or token address)"),
    tokenOut: zod_1.z.string().describe("Output token symbol or address (e.g., 'ETH', 'USDT', or token address)"),
    amount: zod_1.z.string().describe("Amount to swap in human-readable format (e.g., '0.1' for 0.1 tokens)"),
    maxSlippage: zod_1.z.number().optional().default(2.0).describe("Maximum slippage tolerance as percentage (e.g., 2.0 for 2%)")
}, async ({ tokenIn, tokenOut, amount, maxSlippage }) => {
    try {
        console.log('Starting token swap process...');
        if (!PRIVATE_KEY) {
            throw new Error("WALLET_PRIVATE_KEY not found in environment variables");
        }
        const walletAddress = getDefaultAddress();
        console.log(`Wallet: ${walletAddress}`);
        const tokenInAddress = resolveTokenAddress(tokenIn);
        const tokenOutAddress = resolveTokenAddress(tokenOut);
        console.log(`Swapping: ${amount} ${tokenIn} (${tokenInAddress}) -> ${tokenOut} (${tokenOutAddress})`);
        const tokenInDecimals = getTokenDecimals(tokenInAddress);
        const tokenOutDecimals = getTokenDecimals(tokenOutAddress);
        console.log(`Decimals: ${tokenIn}=${tokenInDecimals}, ${tokenOut}=${tokenOutDecimals}`);
        const blockNumber = await publicClient.getBlockNumber();
        console.log(`Connected to Katana, block number: ${blockNumber}`);
        const ethBalance = await publicClient.getBalance({
            address: walletAddress
        });
        console.log(`ETH Balance: ${(Number(ethBalance) / 1e18).toFixed(6)} ETH`);
        async function checkTokenBalance(tokenAddress, walletAddress) {
            try {
                console.log(`Checking balance for token: ${tokenAddress}`);
                console.log(`Wallet address: ${walletAddress}`);
                const balance = await publicClient.readContract({
                    address: tokenAddress,
                    abi: SUSHI_ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [walletAddress],
                });
                const decimals = await publicClient.readContract({
                    address: tokenAddress,
                    abi: SUSHI_ERC20_ABI,
                    functionName: 'decimals',
                    args: [],
                });
                console.log(`Raw balance from contract: ${balance}`);
                console.log(`Raw decimals from contract: ${decimals}`);
                console.log(`Balance type: ${typeof balance}`);
                console.log(`Decimals type: ${typeof decimals}`);
                const balanceBigInt = BigInt(balance.toString());
                const decimalsNumber = Number(decimals.toString());
                console.log(`Converted balance: ${balanceBigInt}`);
                console.log(`Converted decimals: ${decimalsNumber}`);
                return {
                    balance: balanceBigInt,
                    decimals: decimalsNumber
                };
            }
            catch (error) {
                console.error(`Error checking balance for ${tokenAddress}:`, error.message);
                return { balance: 0n, decimals: 18 };
            }
        }
        console.log('\n Checking token balances...');
        const tokenInBalance = await checkTokenBalance(tokenInAddress, walletAddress);
        const tokenOutBalance = await checkTokenBalance(tokenOutAddress, walletAddress);
        console.log(`TokenIn balance object:`, tokenInBalance);
        console.log(`TokenOut balance object:`, tokenOutBalance);
        const tokenInBalanceFormatted = Number(tokenInBalance.balance) / (10 ** Number(tokenInBalance.decimals));
        const tokenOutBalanceFormatted = Number(tokenOutBalance.balance) / (10 ** Number(tokenOutBalance.decimals));
        console.log(`TokenIn formatted calculation: ${Number(tokenInBalance.balance)} / ${10 ** Number(tokenInBalance.decimals)} = ${tokenInBalanceFormatted}`);
        console.log(`${tokenIn} Balance: ${tokenInBalanceFormatted} ${tokenIn}`);
        console.log(`${tokenOut} Balance: ${tokenOutBalanceFormatted} ${tokenOut}`);
        const swapAmount = ethers_1.ethers.parseUnits(amount, tokenInDecimals);
        console.log(`Input amount: "${amount}"`);
        console.log(`Token decimals: ${tokenInDecimals}`);
        console.log(`Swap amount in wei: ${swapAmount.toString()}`);
        console.log(`Available balance in wei: ${tokenInBalance.balance.toString()}`);
        console.log(`Balance >= SwapAmount: ${tokenInBalance.balance >= swapAmount}`);
        console.log(`Balance - SwapAmount: ${(tokenInBalance.balance - swapAmount).toString()}`);
        if (tokenInBalance.balance < swapAmount) {
            throw new Error(`Insufficient ${tokenIn} balance. Need: ${amount}, Have: ${tokenInBalanceFormatted}. Debug: needWei=${swapAmount.toString()}, haveWei=${tokenInBalance.balance.toString()}`);
        }
        console.log('\nGetting swap quote from SushiSwap...');
        const swapData = await (0, sushi_1.getSwap)({
            chainId: sushi_1.ChainId.KATANA,
            tokenIn: tokenInAddress,
            tokenOut: tokenOutAddress,
            sender: walletAddress,
            amount: swapAmount,
            maxSlippage: maxSlippage / 100,
        });
        if (swapData.status !== 'Success') {
            throw new Error(`Failed to get swap data: ${swapData.status}`);
        }
        const routerAddress = swapData.tx.to;
        console.log(`\nRouter contract: ${routerAddress}`);
        async function approveToken(tokenAddress, spenderAddress, amount) {
            const walletClient = (0, viem_1.createWalletClient)({
                chain: katanaChain,
                transport: (0, viem_1.http)(),
            });
            try {
                const hash = await walletClient.writeContract({
                    account: (0, accounts_1.privateKeyToAccount)(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`),
                    address: tokenAddress,
                    abi: SUSHI_ERC20_ABI,
                    functionName: 'approve',
                    args: [spenderAddress, amount],
                });
                console.log(`Approval transaction sent: ${hash}`);
                const receipt = await publicClient.waitForTransactionReceipt({ hash });
                console.log(`Approval confirmed in block: ${receipt.blockNumber}`);
                return receipt;
            }
            catch (error) {
                console.error(`Approval failed:`, error.message);
                throw error;
            }
        }
        console.log('\nChecking token allowance...');
        let approvalInfo = null;
        if (tokenInAddress !== '0xEE7D8BCFb72bC1880D0Cf19822eB0A2e6577aB62' &&
            tokenInAddress !== '0x0000000000000000000000000000000000000000' &&
            tokenInAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
            const currentAllowance = await checkAllowance(tokenInAddress, walletAddress, routerAddress);
            console.log(`Current allowance: ${Number(currentAllowance) / (10 ** tokenInDecimals)} ${tokenIn}`);
            if (currentAllowance < swapAmount) {
                console.log('Insufficient allowance, approving tokens...');
                const approvalAmount = swapAmount * 10n;
                try {
                    const approvalReceipt = await approveToken(tokenInAddress, routerAddress, approvalAmount);
                    approvalInfo = {
                        required: true,
                        hash: approvalReceipt.transactionHash,
                        blockNumber: approvalReceipt.blockNumber.toString(),
                        gasUsed: approvalReceipt.gasUsed.toString(),
                        approvedAmount: (Number(approvalAmount) / (10 ** tokenInDecimals)).toString()
                    };
                    console.log(`Approval successful: ${approvalInfo.hash}`);
                    console.log('Waiting for approval to be processed...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    const newAllowance = await checkAllowance(tokenInAddress, walletAddress, routerAddress);
                    console.log(`New allowance: ${Number(newAllowance) / (10 ** tokenInDecimals)} ${tokenIn}`);
                    if (newAllowance < swapAmount) {
                        throw new Error(`Approval verification failed - allowance still insufficient`);
                    }
                }
                catch (approvalError) {
                    throw new Error(`Token approval failed: ${approvalError.message}`);
                }
            }
            else {
                console.log('Sufficient allowance already exists');
                approvalInfo = { required: false, message: "Sufficient allowance exists" };
            }
        }
        else {
            console.log('Native ETH - no approval needed');
            approvalInfo = { required: false, message: "Native ETH - no approval needed" };
        }
        console.log('\nSimulating swap transaction...');
        try {
            const simulation = await publicClient.call({
                account: swapData.tx.from,
                data: swapData.tx.data,
                to: swapData.tx.to,
                value: swapData.tx.value,
            });
            console.log('Simulation successful!');
        }
        catch (simError) {
            console.error('Simulation failed:', simError.message);
            console.log('\nDebug info:');
            console.log(`- Swap amount: ${swapAmount.toString()}`);
            console.log(`- Router: ${routerAddress}`);
            console.log(`- Token balance: ${tokenInBalance.balance.toString()}`);
            const finalAllowance = await checkAllowance(tokenInAddress, walletAddress, routerAddress);
            console.log(`- Current allowance: ${finalAllowance.toString()}`);
            console.log(`- Allowance sufficient: ${finalAllowance >= swapAmount}`);
            throw new Error(`Transaction simulation failed: ${simError.message}`);
        }
        console.log('\nExecuting swap transaction...');
        const walletClient = (0, viem_1.createWalletClient)({
            chain: katanaChain,
            transport: (0, viem_1.http)(),
        });
        const swapHash = await walletClient.sendTransaction({
            account: (0, accounts_1.privateKeyToAccount)(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`),
            data: swapData.tx.data,
            to: swapData.tx.to,
            value: swapData.tx.value,
            gas: 500000n,
        });
        console.log(`Swap transaction sent: ${swapHash}`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash: swapHash });
        console.log(`Swap completed in block: ${receipt.blockNumber}`);
        console.log(`Gas used: ${receipt.gasUsed}`);
        console.log('\nChecking final balances...');
        const finalTokenIn = await checkTokenBalance(tokenInAddress, walletAddress);
        const finalTokenOut = await checkTokenBalance(tokenOutAddress, walletAddress);
        const finalInBalance = Number(finalTokenIn.balance) / (10 ** tokenInDecimals);
        const finalOutBalance = Number(finalTokenOut.balance) / (10 ** tokenOutDecimals);
        console.log(`${tokenIn}: ${finalInBalance}`);
        console.log(`${tokenOut}: ${finalOutBalance}`);
        const expectedOutputFormatted = Number(swapData.assumedAmountOut) / (10 ** tokenOutDecimals);
        const actualOutput = finalOutBalance - tokenOutBalanceFormatted;
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "success",
                        summary: `🎉 Successfully swapped ${amount} ${tokenIn} for ${actualOutput.toFixed(6)} ${tokenOut} on SushiSwap!`,
                        transactionHash: swapHash,
                        blockNumber: receipt.blockNumber.toString(),
                        gasUsed: receipt.gasUsed.toString(),
                        explorerUrl: getExplorerUrl(747474, swapHash),
                        swap: {
                            tokenIn: {
                                symbol: tokenIn,
                                address: tokenInAddress,
                                amount: amount,
                                decimals: tokenInDecimals
                            },
                            tokenOut: {
                                symbol: tokenOut,
                                address: tokenOutAddress,
                                expectedAmount: expectedOutputFormatted.toFixed(6),
                                actualAmount: actualOutput.toFixed(6),
                                decimals: tokenOutDecimals
                            },
                            priceImpact: `${(swapData.priceImpact * 100).toFixed(4)}%`,
                            maxSlippage: `${maxSlippage}%`,
                            swapPrice: swapData.swapPrice,
                            router: routerAddress
                        },
                        balanceChanges: {
                            [tokenIn]: {
                                before: tokenInBalanceFormatted,
                                after: finalInBalance,
                                change: finalInBalance - tokenInBalanceFormatted
                            },
                            [tokenOut]: {
                                before: tokenOutBalanceFormatted,
                                after: finalOutBalance,
                                change: actualOutput
                            }
                        },
                        approval: approvalInfo,
                        walletAddress,
                        network: "Katana (Chain ID: 747474)",
                        dex: "SushiSwap",
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        console.error('❌ Swap execution failed:', error.message);
        console.error('Full error:', error);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        status: "error",
                        message: `SushiSwap execution failed: ${error.message}`,
                        input: {
                            tokenIn,
                            tokenOut,
                            amount,
                            maxSlippage
                        },
                        details: error.code || error.reason || "Unknown error",
                        troubleshooting: {
                            commonIssues: [
                                "Insufficient token balance",
                                "Token approval failed",
                                "High price impact - try smaller amount or higher slippage",
                                "Network congestion - try again later",
                                "Router contract issues"
                            ],
                            suggestions: [
                                "Check your token balance with getTokenBalances",
                                "Try a smaller amount",
                                "Increase maxSlippage tolerance",
                                "Wait a few minutes and try again"
                            ]
                        },
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
        };
    }
});
// Start the server
async function startServer() {
    try {
        const transport = new stdio_js_1.StdioServerTransport();
        await server.connect(transport);
        console.log("Katana MCP Complete server started successfully");
    }
    catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
}
startServer();
