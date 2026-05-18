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

describe('Cálculo do preço total (calculateTotalPrice)', () => {
  it('retorna o preço base para a configuração padrão (rodas aero, sem opcionais)', () => {
    expect(calculateTotalPrice(baseConfig)).toBe(BASE_PRICE);
  });

  it('adiciona o acréscimo das rodas sport quando wheelType é "sport"', () => {
    const config: CarConfiguration = { ...baseConfig, wheelType: 'sport' };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE + SPORT_WHEELS_PRICE);
  });

  it('adiciona o preço de um único opcional (precision-park)', () => {
    const config: CarConfiguration = { ...baseConfig, optionals: ['precision-park'] };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE + PRECISION_PARK_PRICE);
  });

  it('adiciona o preço de um único opcional (flux-capacitor)', () => {
    const config: CarConfiguration = { ...baseConfig, optionals: ['flux-capacitor'] };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE + FLUX_CAPACITOR_PRICE);
  });

  it('soma todos os opcionais na configuração', () => {
    const config: CarConfiguration = {
      ...baseConfig,
      optionals: ['precision-park', 'flux-capacitor'],
    };
    expect(calculateTotalPrice(config)).toBe(
      BASE_PRICE + PRECISION_PARK_PRICE + FLUX_CAPACITOR_PRICE,
    );
  });

  it('combina as rodas sport com todos os opcionais', () => {
    const config: CarConfiguration = {
      ...baseConfig,
      wheelType: 'sport',
      optionals: ['precision-park', 'flux-capacitor'],
    };
    expect(calculateTotalPrice(config)).toBe(
      BASE_PRICE + SPORT_WHEELS_PRICE + PRECISION_PARK_PRICE + FLUX_CAPACITOR_PRICE,
    );
  });

  it('não altera o preço quando optionals não é um array (proteção defensiva)', () => {
    const config = { ...baseConfig, optionals: undefined as unknown as CarConfiguration['optionals'] };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE);
  });

  it('ignora chaves de opcionais desconhecidas sem afetar o total', () => {
    const config = {
      ...baseConfig,
      optionals: ['unknown-optional'] as unknown as CarConfiguration['optionals'],
    };
    expect(calculateTotalPrice(config)).toBe(BASE_PRICE);
  });
});

describe('Cálculo da parcela (calculateInstallment)', () => {
  // Fórmula esperada: (total * 0.02 * 1.02^12) / (1.02^12 - 1), 12 meses, juros 2% a.m.
  const expectedInstallment = (total: number) => {
    const r = 0.02;
    const n = 12;
    const v = (total * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(v * 100) / 100;
  };

  it('calcula a parcela para o preço base', () => {
    const total = 40000;
    expect(calculateInstallment(total)).toBe(expectedInstallment(total));
  });

  it('calcula a parcela para o carro totalmente equipado', () => {
    const total = BASE_PRICE + SPORT_WHEELS_PRICE + PRECISION_PARK_PRICE + FLUX_CAPACITOR_PRICE;
    expect(calculateInstallment(total)).toBe(expectedInstallment(total));
  });

  it('retorna 0 quando o total é 0', () => {
    expect(calculateInstallment(0)).toBe(0);
  });

  it('arredonda a parcela para duas casas decimais', () => {
    const value = calculateInstallment(40000);
    const decimals = value.toString().split('.')[1] ?? '';
    expect(decimals.length).toBeLessThanOrEqual(2);
  });

  it('cresce proporcionalmente ao valor total', () => {
    expect(calculateInstallment(10000)).toBeLessThan(calculateInstallment(20000));
    expect(calculateInstallment(20000)).toBeLessThan(calculateInstallment(40000));
  });
});

describe('Formatação do preço (formatPrice)', () => {
  it('formata um número inteiro em moeda Real Brasileiro', () => {
    expect(normalizeSpaces(formatPrice(40000))).toBe('R$ 40.000,00');
  });

  it('formata zero corretamente', () => {
    expect(normalizeSpaces(formatPrice(0))).toBe('R$ 0,00');
  });

  it('usa vírgula como separador decimal e ponto para os milhares', () => {
    expect(normalizeSpaces(formatPrice(1234567.89))).toBe('R$ 1.234.567,89');
  });

  it('sempre exibe exatamente duas casas decimais', () => {
    expect(normalizeSpaces(formatPrice(10))).toBe('R$ 10,00');
    expect(normalizeSpaces(formatPrice(10.5))).toBe('R$ 10,50');
  });

  it('arredonda valores para duas casas decimais conforme o Intl', () => {
    expect(normalizeSpaces(formatPrice(10.005))).toMatch(/^R\$ 10,0[01]$/);
  });
});
