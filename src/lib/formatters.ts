// KyatFlow Currency Formatting Utilities

export const LAKH_VALUE = 100000;

/**
 * Format number with Myanmar-style commas
 */
export function formatWithCommas(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Convert Kyats to Lakhs (သိန်း)
 */
export function kyatsToLakhs(kyats: number): number {
  return kyats / LAKH_VALUE;
}

/**
 * Convert Lakhs to Kyats
 */
export function lakhsToKyats(lakhs: number): number {
  return lakhs * LAKH_VALUE;
}

/**
 * Format currency in Kyats or Lakhs
 */
export function formatCurrency(
  amount: number,
  showInLakhs: boolean = false,
  includeSymbol: boolean = true
): string {
  if (showInLakhs) {
    const lakhs = kyatsToLakhs(amount);
    const formatted = lakhs % 1 === 0 
      ? formatWithCommas(lakhs) 
      : lakhs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return includeSymbol ? `${formatted} Lakhs` : formatted;
  }
  
  const formatted = formatWithCommas(Math.round(amount));
  return includeSymbol ? `${formatted} MMK` : formatted;
}

/**
 * Parse a number string with commas
 */
export function parseNumberInput(value: string): number {
  const cleaned = value.replace(/,/g, '').replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format input with commas as user types
 */
export function formatInputWithCommas(value: string): string {
  const cleaned = value.replace(/,/g, '').replace(/[^\d]/g, '');
  if (!cleaned) return '';
  return parseInt(cleaned, 10).toLocaleString('en-US');
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Parse KPay/Wave SMS text
 */
export function parsePaymentSMS(text: string): {
  amount: number;
  sender: string;
  phone: string;
  transactionId: string;
  date: Date;
} | null {
  // Pattern: "Ngwe Lwe: 150,000 MMK from Mg Mg (09xxxx) on 12/01/2026. Trans ID: 12345."
  const amountMatch = text.match(/(\d{1,3}(?:,\d{3})*)\s*MMK/i);
  const senderMatch = text.match(/from\s+([^(]+)\s*\(/i);
  const phoneMatch = text.match(/\((\d+)\)/);
  const transIdMatch = text.match(/Trans(?:action)?\s*ID:\s*(\w+)/i);
  const dateMatch = text.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);

  if (!amountMatch) return null;

  return {
    amount: parseNumberInput(amountMatch[1]),
    sender: senderMatch?.[1]?.trim() || 'Unknown',
    phone: phoneMatch?.[1] || '',
    transactionId: transIdMatch?.[1] || '',
    date: dateMatch ? new Date(dateMatch[1]) : new Date(),
  };
}
