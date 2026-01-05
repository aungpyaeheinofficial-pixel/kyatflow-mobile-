// Data Export Utilities
import { Transaction, Party } from './types';

export const exportToCSV = (transactions: Transaction[], parties: Party[]): string => {
  // Export Transactions
  const transactionHeaders = ['ID', 'Date', 'Type', 'Amount (MMK)', 'Category', 'Payment Method', 'Notes'];
  const transactionRows = transactions.map(t => [
    t.id,
    t.date.toISOString(),
    t.type,
    t.amount.toString(),
    t.category,
    t.paymentMethod,
    t.notes || '',
  ]);

  // Export Parties
  const partyHeaders = ['ID', 'Name', 'Type', 'Phone', 'Balance (MMK)'];
  const partyRows = parties.map(p => [
    p.id,
    p.name,
    p.type,
    p.phone || '',
    p.balance.toString(),
  ]);

  const csv = [
    '=== TRANSACTIONS ===',
    transactionHeaders.join(','),
    ...transactionRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    '',
    '=== PARTIES ===',
    partyHeaders.join(','),
    ...partyRows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
};

export const exportToJSON = (transactions: Transaction[], parties: Party[]): string => {
  return JSON.stringify({ transactions, parties }, null, 2);
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportTransactionsAsCSV = (transactions: Transaction[]) => {
  const headers = ['Date', 'Type', 'Amount (MMK)', 'Category', 'Payment Method', 'Notes'];
  const rows = transactions.map(t => [
    t.date.toLocaleDateString(),
    t.type,
    t.amount.toString(),
    t.category,
    t.paymentMethod,
    t.notes || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const filename = `kyatflow-transactions-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv');
};

export const exportAllData = (transactions: Transaction[], parties: Party[]) => {
  const json = exportToJSON(transactions, parties);
  const filename = `kyatflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, filename, 'application/json');
};

