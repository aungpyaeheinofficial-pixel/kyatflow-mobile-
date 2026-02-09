import { useState, useEffect, memo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { QuickTransactionForm } from '@/components/QuickTransactionForm';
import { CurrencyProvider, useCurrency } from '@/contexts/CurrencyContext';
import { useMyanmarNumbers } from '@/contexts/MyanmarNumbersContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSetFAB } from '@/contexts/FABContext';
import { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTransactions } from '@/hooks/use-transactions';
import { useParties } from '@/hooks/use-parties';
import { exportAllData } from '@/lib/dataExport';
import { useToast } from '@/hooks/use-toast';
import { securityStorage, hashPin, verifyPin, SecuritySettings } from '@/lib/security';
import { auditLog } from '@/lib/auditLog';
import { authStorage } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Moon,
  Smartphone,
  ChevronRight,
  LogOut,
  HelpCircle,
  Edit,
  Trash2,
  Lock,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Notification settings storage
const NOTIFICATION_STORAGE_KEY = 'kyatflow_notification_settings';
interface NotificationSettings {
  pushNotifications: boolean;
  smsReminders: boolean;
  emailReports: boolean;
}

const notificationStorage = {
  get: (): NotificationSettings => {
    try {
      const data = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (!data) {
        return {
          pushNotifications: true,
          smsReminders: false,
          emailReports: true,
        };
      }
      return JSON.parse(data);
    } catch {
      return {
        pushNotifications: true,
        smsReminders: false,
        emailReports: true,
      };
    }
  },
  save: (settings: NotificationSettings): void => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
  },
};

// Backup settings storage
const BACKUP_STORAGE_KEY = 'kyatflow_backup_settings';
const backupStorage = {
  get: (): boolean => {
    try {
      const data = localStorage.getItem(BACKUP_STORAGE_KEY);
      return data ? JSON.parse(data) : true;
    } catch {
      return true;
    }
  },
  save: (enabled: boolean): void => {
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(enabled));
  },
};

function SettingsContent() {
  const { transactions, createTransaction } = useTransactions();
  const { parties } = useParties();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { useMyanmarNumbers: showMyanmarNumbers, toggleMyanmarNumbers } = useMyanmarNumbers();
  const { showInLakhs: showLakhs, toggleCurrency: toggleLakhs } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => securityStorage.get());
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => notificationStorage.get());
  const [backupEnabled, setBackupEnabled] = useState<boolean>(() => backupStorage.get());
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [showTransactionLimitDialog, setShowTransactionLimitDialog] = useState(false);
  const [showAutoLockDialog, setShowAutoLockDialog] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [repeatTransaction, setRepeatTransaction] = useState<Transaction | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const setFAB = useSetFAB();
  const currentUser = authStorage.getCurrentUser();

  const handleQuickIncome = () => {
    setTransactionType('income');
    setRepeatTransaction(null);
    setShowTransactionForm(true);
  };

  const handleQuickExpense = () => {
    setTransactionType('expense');
    setRepeatTransaction(null);
    setShowTransactionForm(true);
  };

  const handleRepeatLast = () => {
    if (transactions.length > 0) {
      setRepeatTransaction(transactions[transactions.length - 1]);
      setShowTransactionForm(true);
    }
  };

  useEffect(() => {
    setFAB({
      onQuickIncome: handleQuickIncome,
      onQuickExpense: handleQuickExpense,
      onRepeatLast: handleRepeatLast,
    });
  }, [setFAB, transactions]);

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    const updated = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(updated);
    notificationStorage.save(updated);
    toast({
      title: 'Settings Updated',
      description: `${key === 'pushNotifications' ? 'Push Notifications' : key === 'smsReminders' ? 'SMS Reminders' : 'Email Reports'} ${updated[key] ? 'enabled' : 'disabled'}`,
    });
  };

  const handleBackupToggle = (enabled: boolean) => {
    setBackupEnabled(enabled);
    backupStorage.save(enabled);
    toast({
      title: 'Backup Settings Updated',
      description: `Auto backup ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', JSON.stringify(enabled));
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: 'Theme Updated',
      description: `Dark mode ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const settingsSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        {
          label: 'Profile Settings',
          description: currentUser ? `Signed in as ${currentUser.email}` : 'Manage your account details',
          hasToggle: false,
          onClick: () => {
            toast({
              title: 'Profile Settings',
              description: 'Profile settings feature coming soon',
            });
          },
        },
        {
          label: 'Business Information',
          description: 'Update your business profile',
          hasToggle: false,
          onClick: () => {
            toast({
              title: 'Business Information',
              description: 'Business information feature coming soon',
            });
          },
        },
      ],
    },
    {
      title: 'Financials',
      icon: Wallet,
      items: [
        {
          label: 'Budget Settings',
          description: 'Set spending limits and alerts',
          hasToggle: false,
          onClick: () => navigate('/budgets'),
        }
      ]
    },
    {
      title: 'Preferences',
      icon: Globe,
      items: [
        {
          label: t('settings.language'),
          description: t('settings.languageDesc'),
          hasToggle: false,
          onClick: () => setShowLanguageDialog(true),
        },
        {
          label: 'Myanmar Numbers',
          description: 'Use ၁၂၃ instead of 123',
          hasToggle: true,
          enabled: showMyanmarNumbers,
          onToggle: toggleMyanmarNumbers,
        },
        {
          label: 'Currency Display',
          description: 'Default to Lakhs (သိန်း)',
          hasToggle: true,
          enabled: showLakhs,
          onToggle: toggleLakhs,
        },
        {
          label: 'Dark Mode',
          description: 'Enable dark theme',
          hasToggle: true,
          enabled: darkMode,
          onToggle: () => handleDarkModeToggle(!darkMode),
          icon: Moon,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Push Notifications',
          description: 'Transaction alerts',
          hasToggle: true,
          enabled: notificationSettings.pushNotifications,
          onToggle: () => handleNotificationToggle('pushNotifications'),
        },
        {
          label: 'SMS Reminders',
          description: 'Payment due reminders',
          hasToggle: true,
          enabled: notificationSettings.smsReminders,
          onToggle: () => handleNotificationToggle('smsReminders'),
        },
        {
          label: 'Email Reports',
          description: 'Weekly summary',
          hasToggle: true,
          enabled: notificationSettings.emailReports,
          onToggle: () => handleNotificationToggle('emailReports'),
        },
      ],
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        {
          label: 'PIN Lock',
          description: securitySettings.pinRequired
            ? 'PIN is set. Tap to change or remove.'
            : 'Require PIN for transactions > 1M MMK',
          hasToggle: true,
          enabled: securitySettings.pinRequired,
          onToggle: () => {
            if (securitySettings.pinRequired) {
              setShowPinChange(true);
            } else {
              setShowPinSetup(true);
            }
          },
        },
        {
          label: 'Biometric Lock',
          description: 'Fingerprint/Face ID',
          hasToggle: true,
          enabled: securitySettings.biometricEnabled,
          onToggle: async () => {
            if (!securitySettings.biometricEnabled) {
              // Check if biometric is available
              const available = 'credentials' in navigator;
              if (!available) {
                toast({
                  title: 'Biometric Not Available',
                  description: 'Biometric authentication is not available on this device',
                  variant: 'destructive',
                });
                return;
              }
            }
            const updated = { ...securitySettings, biometricEnabled: !securitySettings.biometricEnabled };
            setSecuritySettings(updated);
            securityStorage.save(updated);
            toast({
              title: 'Biometric Lock Updated',
              description: `Biometric authentication ${updated.biometricEnabled ? 'enabled' : 'disabled'}`,
            });
          },
        },
        {
          label: 'Transaction Limit',
          description: `Require PIN above ${(securitySettings.transactionLimit / 1000000).toFixed(1)}M MMK`,
          hasToggle: false,
          onClick: () => setShowTransactionLimitDialog(true),
        },
        {
          label: 'Auto-Lock Timer',
          description: `Auto-lock after ${securitySettings.autoLockMinutes} minutes`,
          hasToggle: false,
          onClick: () => setShowAutoLockDialog(true),
        },
      ],
    },
    {
      title: 'Data',
      icon: Database,
      items: [
        {
          label: 'Export Data',
          description: 'Download your transactions',
          hasToggle: false,
          onClick: () => {
            try {
              exportAllData(transactions, parties);
              toast({
                title: 'Data Exported',
                description: 'Your data has been downloaded successfully.',
              });
            } catch (error) {
              toast({
                title: 'Export Failed',
                description: 'Failed to export data. Please try again.',
                variant: 'destructive',
              });
            }
          },
        },
        {
          label: 'Backup Settings',
          description: 'Auto backup to cloud',
          hasToggle: true,
          enabled: backupEnabled,
          onToggle: () => handleBackupToggle(!backupEnabled),
        },
        {
          label: 'Clear Cache',
          description: 'Free up storage space',
          hasToggle: false,
          onClick: () => {
            if (confirm('Are you sure you want to clear all cached data? This cannot be undone.')) {
              localStorage.clear();
              toast({
                title: 'Cache Cleared',
                description: 'All cached data has been cleared.',
              });
              window.location.reload();
            }
          },
        },
      ],
    },
  ];

  const handlePinSetup = () => {
    if (pin.length < 4) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be at least 4 digits',
        variant: 'destructive',
      });
      return;
    }
    if (pin !== confirmPin) {
      toast({
        title: 'PIN Mismatch',
        description: 'PINs do not match',
        variant: 'destructive',
      });
      return;
    }
    const updated = {
      ...securitySettings,
      pinRequired: true,
      pinHash: hashPin(pin),
    };
    setSecuritySettings(updated);
    securityStorage.save(updated);
    auditLog.log({
      action: 'update',
      entityType: 'settings',
      entityId: 'security',
      changes: { pin: { from: null, to: 'set' } }
    });
    setPin('');
    setConfirmPin('');
    setShowPinSetup(false);
    toast({
      title: 'PIN Set',
      description: 'PIN has been set successfully',
    });
  };

  const handlePinChange = () => {
    if (!oldPin || !securitySettings.pinHash) {
      toast({
        title: 'Error',
        description: 'Please enter your current PIN',
        variant: 'destructive',
      });
      return;
    }
    if (!verifyPin(oldPin, securitySettings.pinHash)) {
      toast({
        title: 'Invalid PIN',
        description: 'Current PIN is incorrect',
        variant: 'destructive',
      });
      setOldPin('');
      return;
    }
    if (pin.length < 4) {
      toast({
        title: 'Invalid PIN',
        description: 'New PIN must be at least 4 digits',
        variant: 'destructive',
      });
      return;
    }
    if (pin !== confirmPin) {
      toast({
        title: 'PIN Mismatch',
        description: 'New PINs do not match',
        variant: 'destructive',
      });
      return;
    }
    const updated = {
      ...securitySettings,
      pinHash: hashPin(pin),
    };
    setSecuritySettings(updated);
    securityStorage.save(updated);
    auditLog.log({
      action: 'update',
      entityType: 'settings',
      entityId: 'security',
      changes: { pin: { from: 'old', to: 'changed' } }
    });
    setPin('');
    setConfirmPin('');
    setOldPin('');
    setShowPinChange(false);
    toast({
      title: 'PIN Changed',
      description: 'PIN has been changed successfully',
    });
  };

  const handlePinRemove = () => {
    if (!oldPin || !securitySettings.pinHash) {
      toast({
        title: 'Error',
        description: 'Please enter your current PIN to remove it',
        variant: 'destructive',
      });
      return;
    }
    if (!verifyPin(oldPin, securitySettings.pinHash)) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN is incorrect',
        variant: 'destructive',
      });
      setOldPin('');
      return;
    }
    const updated = {
      ...securitySettings,
      pinRequired: false,
      pinHash: undefined,
    };
    setSecuritySettings(updated);
    securityStorage.save(updated);
    auditLog.log({
      action: 'update',
      entityType: 'settings',
      entityId: 'security',
      changes: { pin: { from: 'set', to: null } }
    });
    setOldPin('');
    setShowPinChange(false);
    toast({
      title: 'PIN Removed',
      description: 'PIN has been removed successfully',
    });
  };

  const handleTransactionLimitChange = (value: number[]) => {
    const limit = value[0];
    const updated = {
      ...securitySettings,
      transactionLimit: limit,
    };
    setSecuritySettings(updated);
    securityStorage.save(updated);
    auditLog.log({
      action: 'update',
      entityType: 'settings',
      entityId: 'security',
      changes: { transactionLimit: { from: securitySettings.transactionLimit, to: limit } }
    });
  };

  const handleAutoLockChange = (value: number[]) => {
    const minutes = value[0];
    const updated = {
      ...securitySettings,
      autoLockMinutes: minutes,
    };
    setSecuritySettings(updated);
    securityStorage.save(updated);
    auditLog.log({
      action: 'update',
      entityType: 'settings',
      entityId: 'security',
      changes: { autoLockMinutes: { from: securitySettings.autoLockMinutes, to: minutes } }
    });
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold lg:text-4xl">Settings</h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
          Customize your KyatFlow experience
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <Card
            key={section.title}
            className="animate-slide-up"
            style={{ animationDelay: `${sectionIndex * 50}ms` }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <section.icon className="h-5 w-5 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {section.items.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-6 py-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      }
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                        <p className="font-medium">{item.label}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    {item.hasToggle ? (
                      <Switch
                        checked={item.enabled || false}
                        onCheckedChange={(checked) => {
                          if (item.onToggle) {
                            item.onToggle();
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Help & Logout */}
        <Card className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-6 py-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Help & Support</p>
                    <p className="text-sm text-muted-foreground">Get help with KyatFlow</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div
                className="flex items-center justify-between px-6 py-4 hover:bg-destructive/5 transition-colors cursor-pointer"
                onClick={() => {
                  authStorage.logout();
                  // Silent logout - no toast notification
                  navigate('/login');
                }}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Sign Out</p>
                    <p className="text-sm text-muted-foreground">Log out of your account</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version Info */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>KyatFlow v1.0.0</p>
          <p className="mt-1">Made with ❤️ for Myanmar SMEs</p>
        </div>
      </div>

      {/* PIN Setup Dialog */}
      <Dialog open={showPinSetup} onOpenChange={setShowPinSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set PIN</DialogTitle>
            <DialogDescription>Enter a 4-6 digit PIN for transaction security</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="mt-1"
                placeholder="Enter PIN"
              />
            </div>
            <div>
              <Label>Confirm PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="mt-1"
                placeholder="Confirm PIN"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPinSetup(false);
              setPin('');
              setConfirmPin('');
            }}>
              Cancel
            </Button>
            <Button onClick={handlePinSetup} disabled={pin.length < 4 || pin !== confirmPin}>
              <Lock className="h-4 w-4 mr-2" />
              Set PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN Change/Remove Dialog */}
      <Dialog open={showPinChange} onOpenChange={setShowPinChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change or Remove PIN</DialogTitle>
            <DialogDescription>Enter your current PIN to change or remove it</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                className="mt-1"
                placeholder="Enter current PIN"
              />
            </div>
            <div>
              <Label>New PIN (leave empty to remove)</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="mt-1"
                placeholder="Enter new PIN (optional)"
              />
            </div>
            {pin && (
              <div>
                <Label>Confirm New PIN</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="mt-1"
                  placeholder="Confirm new PIN"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handlePinRemove}
              disabled={!oldPin}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove PIN
            </Button>
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPinChange(false);
                  setPin('');
                  setConfirmPin('');
                  setOldPin('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePinChange}
                disabled={!oldPin || (pin && (pin.length < 4 || pin !== confirmPin))}
              >
                <Edit className="h-4 w-4 mr-2" />
                {pin ? 'Change PIN' : 'Verify'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Limit Dialog */}
      <Dialog open={showTransactionLimitDialog} onOpenChange={setShowTransactionLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Limit</DialogTitle>
            <DialogDescription>
              Set the minimum amount that requires PIN verification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-base font-semibold">
                {(securitySettings.transactionLimit / 1000000).toFixed(1)}M MMK
              </Label>
              <Slider
                value={[securitySettings.transactionLimit]}
                onValueChange={handleTransactionLimitChange}
                min={100000}
                max={10000000}
                step={100000}
                className="mt-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>100K</span>
                <span>10M</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTransactionLimitDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Lock Timer Dialog */}
      <Dialog open={showAutoLockDialog} onOpenChange={setShowAutoLockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-Lock Timer</DialogTitle>
            <DialogDescription>
              Set how long before the app automatically locks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-base font-semibold">
                {securitySettings.autoLockMinutes} {securitySettings.autoLockMinutes === 1 ? 'minute' : 'minutes'}
              </Label>
              <Slider
                value={[securitySettings.autoLockMinutes]}
                onValueChange={handleAutoLockChange}
                min={1}
                max={60}
                step={1}
                className="mt-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1 min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAutoLockDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QuickTransactionForm
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        initialType={transactionType}
        lastTransaction={repeatTransaction}
        transactions={transactions}
        onSubmit={(data) => {
          createTransaction({
            date: data.date || new Date(),
            amount: data.amount,
            type: data.type,
            category: data.category,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            partyId: data.partyId,
          });
        }}
      />

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.language')}</DialogTitle>
            <DialogDescription>
              {t('settings.languageDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <button
              onClick={() => {
                setLanguage('en');
                setShowLanguageDialog(false);
                toast({
                  title: 'Language Changed',
                  description: 'Language set to English',
                });
              }}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                language === 'en'
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">English</div>
                  <div className="text-sm text-muted-foreground">English</div>
                </div>
                {language === 'en' && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setLanguage('my');
                setShowLanguageDialog(false);
                toast({
                  title: 'ဘာသာစကား ပြောင်းလဲပြီး',
                  description: 'မြန်မာဘာသာသို့ ပြောင်းလဲပြီး',
                });
              }}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                language === 'my'
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">မြန်မာ</div>
                  <div className="text-sm text-muted-foreground">Myanmar</div>
                </div>
                {language === 'my' && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLanguageDialog(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}

const Settings = memo(function Settings() {
  return (
    <CurrencyProvider>
      <SettingsContent />
    </CurrencyProvider>
  );
});

export default Settings;
