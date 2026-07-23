// Background Service Worker: The Single Source of Truth
import { BackgroundController } from './controllers/BackgroundController.js';

// Boot the domain controllers
BackgroundController.initialize().catch((err) => {
  console.error('VaultX Fatal Background Error:', err);
});
