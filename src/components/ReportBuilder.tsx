import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Transaction, Party } from '@/lib/types';
import { generateReport, exportToPDF, exportToExcel } from '@/lib/reportExport';
import { useToast } from '@/hooks/use-toast';

interface ReportBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  parties: Party[];
}

export function ReportBuilder({ open, onOpenChange, transactions, parties }: ReportBuilderProps) {
  const { toast } = useToast();
  const [reportTitle, setReportTitle] = useState('Financial Report');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeParties, setIncludeParties] = useState(true);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  const handleExport = () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: 'Error',
        description: 'Please select a date range',
        variant: 'destructive',
      });
      return;
    }

    const report = generateReport(
      transactions,
      includeParties ? parties : [],
      { from: dateFrom, to: dateTo },
      reportTitle
    );

    if (exportFormat === 'pdf') {
      exportToPDF(
        report.transactions,
        report.parties,
        report.stats,
        reportTitle.toLowerCase().replace(/\s+/g, '-')
      );
      toast({
        title: 'PDF Export',
        description: 'PDF report is being generated. Use the print dialog to save.',
      });
    } else {
      exportToExcel(
        report.transactions,
        report.parties,
        reportTitle.toLowerCase().replace(/\s+/g, '-')
      );
      toast({
        title: 'Excel Export',
        description: 'Excel file has been downloaded.',
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Custom Report Builder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report Title */}
          <div className="space-y-2">
            <Label>Report Title</Label>
            <Input
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Enter report title"
            />
          </div>

          {/* Date Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Report Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="include-charts" className="text-sm font-normal cursor-pointer">
                  Include charts and visualizations
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-parties"
                  checked={includeParties}
                  onCheckedChange={(checked) => setIncludeParties(checked as boolean)}
                />
                <Label htmlFor="include-parties" className="text-sm font-normal cursor-pointer">
                  Include parties information
                </Label>
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'pdf' | 'excel')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel Spreadsheet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

