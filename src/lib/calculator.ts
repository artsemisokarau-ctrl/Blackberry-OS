export type Operator = '+' | '-' | '*' | '/';

export interface CalcState {
  display: string;
  stored: number | null;
  operator: Operator | null;
  fresh: boolean;
  error: boolean;
}

export const CALC_START: CalcState = { display: '0', stored: null, operator: null, fresh: true, error: false };
const CALC_ERROR: CalcState = { ...CALC_START, display: 'Error', error: true };
const MAX_DIGITS = 12;

function isOperator(key: string): key is Operator {
  return key === '+' || key === '-' || key === '*' || key === '/';
}

function compute(a: number, b: number, operator: Operator): number | null {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? null : a / b;
  }
}

function format(value: number): string {
  return String(Number(value.toPrecision(10)));
}

function pressDigit(state: CalcState, digit: string): CalcState {
  if (state.error) return pressDigit(CALC_START, digit);
  if (state.fresh) return { ...state, display: digit, fresh: false };
  if (state.display.replace(/\D/g, '').length >= MAX_DIGITS) return state;
  return { ...state, display: state.display === '0' ? digit : state.display + digit };
}

function pressDecimal(state: CalcState): CalcState {
  if (state.error) return state;
  if (state.fresh) return { ...state, display: '0.', fresh: false };
  if (state.display.includes('.')) return state;
  return { ...state, display: `${state.display}.` };
}

function pressOperator(state: CalcState, operator: Operator): CalcState {
  if (state.error) return state;
  const current = Number(state.display);
  if (state.operator !== null && state.stored !== null && !state.fresh) {
    const result = compute(state.stored, current, state.operator);
    if (result === null) return CALC_ERROR;
    return { ...state, display: format(result), stored: result, operator, fresh: true };
  }
  return { ...state, stored: state.stored ?? current, operator, fresh: true };
}

function pressEquals(state: CalcState): CalcState {
  if (state.error || state.operator === null || state.stored === null) return state;
  const result = compute(state.stored, Number(state.display), state.operator);
  if (result === null) return CALC_ERROR;
  return { ...CALC_START, display: format(result) };
}

function pressBackspace(state: CalcState): CalcState {
  if (state.error || state.fresh) return state;
  return { ...state, display: state.display.length > 1 ? state.display.slice(0, -1) : '0' };
}

export function applyKey(state: CalcState, key: string): CalcState | null {
  if (/^[0-9]$/.test(key)) return pressDigit(state, key);
  if (key === '.') return pressDecimal(state);
  if (isOperator(key)) return pressOperator(state, key);
  if (key === '=' || key === 'select') return pressEquals(state);
  if (key === 'backspace') return pressBackspace(state);
  if (key === 'c' || key === 'C') return CALC_START;
  return null;
}
