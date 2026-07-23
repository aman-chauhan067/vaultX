import type { TokenInfo } from '../assets/index.js';

export interface SpamScore {
  score: number; // 0 to 100 (100 being guaranteed spam)
  reasons: string[];
  isHidden: boolean;
}

export class SpamDetector {
  private knownScams = new Set([
    '0x0000000000000000000000000000000000000000'
    // We would populate this with known scam addresses
  ]);

  private spamKeywords = [
    'claim',
    'airdrop',
    'visit',
    'free',
    'win',
    'giveaway',
    'reward',
    '.com',
    '.io',
    '.org'
  ];

  public analyzeToken(token: TokenInfo, userHiddenList: string[] = []): SpamScore {
    let score = 0;
    const reasons: string[] = [];
    const address = token.address.toLowerCase();

    // 1. User Hidden List
    if (userHiddenList.includes(address)) {
      return { score: 100, reasons: ['User manually hidden'], isHidden: true };
    }

    // 2. Known Scams
    if (this.knownScams.has(address)) {
      score += 100;
      reasons.push('Matches known scam database');
    }

    // 3. Spam Keywords in Name/Symbol
    const nameLower = token.name.toLowerCase();
    const symbolLower = token.symbol.toLowerCase();

    for (const keyword of this.spamKeywords) {
      if (nameLower.includes(keyword) || symbolLower.includes(keyword)) {
        score += 40;
        reasons.push(`Contains suspicious keyword: ${keyword}`);
      }
    }

    // 4. Unknown/Unverified
    if (!token.verified) {
      score += 10;
      reasons.push('Unverified contract');
    }

    // 5. Zero length name/symbol
    if (token.name.trim() === '' || token.symbol.trim() === '') {
      score += 30;
      reasons.push('Missing metadata');
    }

    return {
      score: Math.min(score, 100),
      reasons,
      isHidden: score >= 80 // Automatically hide if score >= 80
    };
  }
}
