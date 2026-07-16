import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

type NextConfigWithAuthInterrupts = {
  experimental?: {
    authInterrupts?: boolean;
  };
};

describe('next.config', () => {
  it('enables authInterrupts for forbidden() support during build', () => {
    const config = nextConfig as NextConfigWithAuthInterrupts;
    expect(config.experimental?.authInterrupts).toBe(true);
  });
});
