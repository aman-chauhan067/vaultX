/**
 * @file errors/index.ts
 * @description Custom errors for Network Engine
 */

export class NetworkEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkEngineError';
  }
}

export class UnsupportedChainError extends NetworkEngineError {
  constructor(chainId: number) {
    super(`Chain ID ${chainId} is not supported by the network registry.`);
    this.name = 'UnsupportedChainError';
  }
}

export class RpcExhaustionError extends NetworkEngineError {
  constructor(chainId: number) {
    super(`All configured RPC URLs for chain ${chainId} have failed.`);
    this.name = 'RpcExhaustionError';
  }
}

export class InvalidRpcError extends NetworkEngineError {
  constructor(url: string) {
    super(`Invalid RPC URL: ${url}`);
    this.name = 'InvalidRpcError';
  }
}
