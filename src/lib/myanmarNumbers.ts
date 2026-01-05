// Myanmar Numbers Conversion Utility

const MYANMAR_DIGITS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
const WESTERN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toMyanmarNumber(num: number | string): string {
  const str = typeof num === 'number' ? num.toString() : num;
  return str
    .split('')
    .map((char) => {
      const index = WESTERN_DIGITS.indexOf(char);
      return index !== -1 ? MYANMAR_DIGITS[index] : char;
    })
    .join('');
}

export function fromMyanmarNumber(str: string): string {
  return str
    .split('')
    .map((char) => {
      const index = MYANMAR_DIGITS.indexOf(char);
      return index !== -1 ? WESTERN_DIGITS[index] : char;
    })
    .join('');
}

export function formatMyanmarCurrency(amount: number, useMyanmarNumbers: boolean = false): string {
  const formatted = amount.toLocaleString('en-US');
  return useMyanmarNumbers ? toMyanmarNumber(formatted) : formatted;
}

