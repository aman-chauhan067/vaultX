import { ProviderManager } from './packages/network-engine/src/providers/index.js';

async function test() {
  const manager = new ProviderManager();
  try {
    manager.switchChain(1);
    console.log('Success');
  } catch (err) {
    console.error('Failed!', err);
  }
}
test();
