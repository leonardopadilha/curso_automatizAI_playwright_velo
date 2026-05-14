import { describe, it, expect } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  type CarConfiguration,
} from './configuratorStore';

const BASE_PRICE = 40000;
const SPORT_WHEELS_PRICE = 2000;
const PRECISION_PARK_PRICE = 5500;
const FLUX_CAPACITOR_PRICE = 5000;

const baseConfig: CarConfiguration = {
  exteriorColor: 'glacier-blue',
  interiorColor: 'carbon-black',
  wheelType: 'aero',
  optionals: [],
};

// Intl.NumberFormat pode produzir espaços comuns ou non-breaking entre "R$" e o valor.
// Normalizamos quaisquer espaços para garantir testes determinísticos em qualquer ambiente.
const normalizeSpaces = (s: string) => s.replace(/\s+/g, ' ');

describe('calculateTotalPrice', () => {
  it('returns the base price for the default configuration (aero wheels, no optionals)', () => {
    expect(calculateTotalPrice(baseConfig)).toBe(BASE_PRICE);
  });

  it('adds the sport wheels surcharge when wheelType is "sport"', () => {
    const config: CarConfiguration = { ...baseConfig, wheelType: 'sport' };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE + SPORT_WHEELS_PRICE);
  });

  it('adds the price of a single optional (precision-park)', () => {
    const config: CarConfiguration = { ...baseConfig, optionals: ['precision-park'] };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE + PRECISION_PARK_PRICE);
  });

  it('adds the price of a single optional (flux-capacitor)', () => {
    const config: CarConfiguration = { ...baseConfig, optionals: ['flux-capacitor'] };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE + FLUX_CAPACITOR_PRICE);
  });

  it('sums every optional in the configuration', () => {
    const config: CarConfiguration = {
      ...baseConfig,
      optionals: ['precision-park', 'flux-capacitor'],
    };
    expect(calculateTotalPrice(config)).toBe(
      BASE_PRICE + PRECISION_PARK_PRICE + FLUX_CAPACITOR_PRICE,
    );
  });

  it('combines sport wheels with every optional', () => {
    const config: CarConfiguration = {
      ...baseConfig,
      wheelType: 'sport',
      optionals: ['precision-park', 'flux-capacitor'],
    };
    expect(calculateTotalPrice(config)).toBe(
      BASE_PRICE + SPORT_WHEELS_PRICE + PRECISION_PARK_PRICE + FLUX_CAPACITOR_PRICE,
    );
  });

  it('does not change the price when optionals is not an array (defensive guard)', () => {
    const config = { ...baseConfig, optionals: undefined as unknown as CarConfiguration['optionals'] };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE);
  });

  it('ignores unknown optional keys without breaking the total', () => {
    const config = {
      ...baseConfig,
      optionals: ['unknown-optional'] as unknown as CarConfiguration['optionals'],
    };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE);
  });
});

describe('calculateInstallment', () => {
  // Fórmula esperada: (total * 0.02 * 1.02^12) / (1.02^12 - 1), 12 meses, juros 2% a.m.
  const expectedInstallment = (total: number) => {
    const r = 0.02;
    const n = 12;
    const v = (total * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(v * 100) / 100;
  };

  it('computes the installment for the base price', () => {
    const total = 40000;
    expect(calculateInstallment(total)).toBe(expectedInstallment(total));
  });

  it('computes the installment for a fully loaded car', () => {
    const total = BASE_PRICE + SPORT_WHEELS_PRICE + PRECISION_PARK_PRICE + FLUX_CAPACITOR_PRICE;
    expect(calculateInstallment(total)).toBe(expectedInstallment(total));
  });

  it('returns 0 when the total is 0', () => {
    expect(calculateInstallment(0)).toBe(0);
  });

  it('rounds the installment to two decimal places', () => {
    const value = calculateInstallment(40000);
    const decimals = value.toString().split('.')[1] ?? '';
    expect(decimals.length).toBeLessThanOrEqual(2);
  });

  it('is monotonically increasing with the total amount', () => {
    expect(calculateInstallment(10000)).toBeLessThan(calculateInstallment(20000));
    expect(calculateInstallment(20000)).toBeLessThan(calculateInstallment(40000));
  });
});

describe('formatPrice', () => {
  it('formats a whole number into Brazilian Real currency', () => {
    expect(normalizeSpaces(formatPrice(40000))).toBe('R$ 40.000,00');
  });

  it('formats zero correctly', () => {
    expect(normalizeSpaces(formatPrice(0))).toBe('R$ 0,00');
  });

  it('uses comma as the decimal separator and dot for thousands', () => {
    expect(normalizeSpaces(formatPrice(1234567.89))).toBe('R$ 1.234.567,89');
  });

  it('always renders exactly two decimal places', () => {
    expect(normalizeSpaces(formatPrice(10))).toBe('R$ 10,00');
    expect(normalizeSpaces(formatPrice(10.5))).toBe('R$ 10,50');
  });

  it('rounds values to two decimals according to Intl', () => {
    expect(normalizeSpaces(formatPrice(10.005))).toMatch(/^R\$ 10,0[01]$/);
  });
});
