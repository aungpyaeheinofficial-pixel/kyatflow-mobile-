// Report Export Utilities for PDF and Excel
import { Transaction, Party } from './types';
import { format } from 'date-fns';

// Excel export using CSV format (can be opened in Excel)
export const exportToExcel = (transactions: Transaction[], parties: Party[], filename: string = 'report') => {
  const headers = ['Date', 'Type', 'Amount (MMK)', 'Category', 'Payment Method', 'Notes', 'Party'];
  const rows = transactions.map(tx => [
    format(tx.date, 'yyyy-MM-dd HH:mm'),
    tx.type,
    tx.amount.toString(),
    tx.category,
    tx.paymentMethod,
    tx.notes || '',
    parties.find(p => p.id === tx.partyId)?.name || '',
  ]);

  const csv = [
    headers.join('\t'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join('\t')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// PDF export using html2pdf approach (requires html2pdf.js or similar)
export const exportToPDF = async (
  transactions: Transaction[],
  parties: Party[],
  stats: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
  },
  filename: string = 'report'
) => {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { margin-top: 30px; padding: 20px; background-color: #f9f9f9; }
          .summary-item { margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>Financial Report</h1>
        <p>Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
        
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-item"><strong>Total Income:</strong> ${stats.totalIncome.toLocaleString()} MMK</div>
          <div class="summary-item"><strong>Total Expense:</strong> ${stats.totalExpense.toLocaleString()} MMK</div>
          <div class="summary-item"><strong>Net Cash Flow:</strong> ${stats.netCashFlow.toLocaleString()} MMK</div>
        </div>

        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Payment Method</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(tx => `
              <tr>
                <td>${format(tx.date, 'yyyy-MM-dd')}</td>
                <td>${tx.type}</td>
                <td>${tx.amount.toLocaleString()}</td>
                <td>${tx.category}</td>
                <td>${tx.paymentMethod}</td>
                <td>${tx.notes || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    // Wait a bit then trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

// Generate report data structure
export interface ReportData {
  title: string;
  dateRange: { from: Date; to: Date };
  transactions: Transaction[];
  parties: Party[];
  stats: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
  };
  charts?: {
    expenseBreakdown: any[];
    incomeBreakdown: any[];
  };
}

export const generateReport = (
  transactions: Transaction[],
  parties: Party[],
  dateRange: { from: Date; to: Date },
  title: string = 'Financial Report'
): ReportData => {
  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= dateRange.from && txDate <= dateRange.to;
  });

  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return {
    title,
    dateRange,
    transactions: filteredTransactions,
    parties,
    stats: {
      totalIncome,
      totalExpense,
      netCashFlow: totalIncome - totalExpense,
    },
  };
};

