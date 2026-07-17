import { useState, useEffect } from 'react';
import {
  Settings, DollarSign, Bell, Palette, Download, Save, Lock,
  FileSpreadsheet, Shield,
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/Toast';
import { useThemeStore } from '../hooks/useTheme';

interface SettingsData {
  currency: string;
  theme: string;
  budgetAlerts: {
    enabled: boolean;
    monthlyLimit: number;
    categoryLimits: Record<string, number>;
  };
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'MMK', label: 'Myanmar Kyat', symbol: 'K' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'THB', label: 'Thai Baht', symbol: '฿' },
];

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: '💻', description: 'Follow your device settings' },
  { value: 'light', label: 'Light', icon: '☀️', description: 'Always use light mode' },
  { value: 'dark', label: 'Dark', icon: '🌙', description: 'Always use dark mode' },
];

const CATEGORIES = ['Electricity', 'Water', 'Internet', 'Phone', 'Shopping', 'Other'];

const TABS = [
  { id: 'currency', label: 'Currency', icon: DollarSign },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'budget', label: 'Budget Alerts', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'export', label: 'Export', icon: Download },
];

export default function SettingsPage() {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  const { setTheme: setGlobalTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState('currency');
  const [settings, setSettings] = useState<SettingsData>({
    currency: 'USD',
    theme: 'system',
    budgetAlerts: { enabled: true, monthlyLimit: 0, categoryLimits: {} },
  });
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Export
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadSettings(); }, [apiFetch]);

  async function loadSettings() {
    try {
      const res = await apiFetch('/api/v1/users/me');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          currency: data.currency || 'USD',
          theme: data.theme || 'system',
          budgetAlerts: {
            enabled: data.budgetAlerts?.enabled ?? true,
            monthlyLimit: data.budgetAlerts?.monthlyLimit ?? 0,
            categoryLimits: data.budgetAlerts?.categoryLimits || {},
          },
        });
        // Apply theme globally
        setGlobalTheme(data.theme || 'system');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await apiFetch('/api/v1/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast('Settings saved', 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || 'Failed to save', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast('Fill in all password fields', 'error');
      return;
    }
    if (newPassword.length < 8) {
      toast('New password must be at least 8 characters', 'error');
      return;
    }
    if (!/\d/.test(newPassword)) {
      toast('New password must contain at least one number', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await apiFetch('/api/v1/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        toast('Password changed successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || 'Failed to change password', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleExportCSV() {
    setExporting(true);
    try {
      const res = await apiFetch('/api/v1/bills?limit=1000');
      if (!res.ok) {
        toast('Failed to fetch bills', 'error');
        return;
      }
      const data = await res.json();
      const bills = data?.bills || data || [];
      if (!bills || bills.length === 0) {
        toast('No bills to export', 'error');
        return;
      }

      const headers = ['Title', 'Amount', 'Category', 'Due Date', 'Paid', 'Recurring', 'Created At'];
      const rows = bills.map((b: any) => [
        `"${(b.title || '').replace(/"/g, '""')}"`,
        b.amount,
        b.category,
        b.dueDate ? new Date(b.dueDate).toISOString().split('T')[0] : '',
        b.isPaid ? 'Yes' : 'No',
        b.isRecurring ? b.recurringInterval : 'No',
        new Date(b.createdAt).toISOString().split('T')[0],
      ]);

      const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bills-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast(`Exported ${bills.length} bills`, 'success');
    } catch (err: any) {
      toast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  }

  const symbol = CURRENCY_OPTIONS.find(c => c.value === settings.currency)?.symbol || '$';

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <h1 className="page-title">
            <Settings size={24} />
            Settings
          </h1>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
        <p className="page-subtitle">Customize your experience</p>
      </div>

      <div className="settings-layout">
        {/* Tabs */}
        <div className="settings-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Currency */}
          {activeTab === 'currency' && (
            <div className="settings-card">
              <h2 className="section-title">
                <DollarSign size={18} />
                Currency
              </h2>
              <p className="section-desc">Choose your preferred currency for displaying amounts</p>
              <div className="currency-grid">
                {CURRENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`currency-option ${settings.currency === opt.value ? 'active' : ''}`}
                    onClick={() => setSettings(prev => ({ ...prev, currency: opt.value }))}
                  >
                    <span className="currency-symbol">{opt.symbol}</span>
                    <span className="currency-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="settings-card">
              <h2 className="section-title">
                <Palette size={18} />
                Theme
              </h2>
              <p className="section-desc">Select your preferred color theme</p>
              <div className="theme-options">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`theme-option ${settings.theme === opt.value ? 'active' : ''}`}
                    onClick={async () => {
                      setSettings(prev => ({ ...prev, theme: opt.value }));
                      setGlobalTheme(opt.value);
                      // Auto-save to backend
                      try {
                        await apiFetch('/api/v1/users/settings', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ theme: opt.value }),
                        });
                      } catch { /* silent */ }
                    }}
                  >
                    <span className="theme-icon">{opt.icon}</span>
                    <span className="theme-label">{opt.label}</span>
                    <span className="theme-desc">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Budget Alerts */}
          {activeTab === 'budget' && (
            <div className="settings-card">
              <h2 className="section-title">
                <Bell size={18} />
                Budget Alerts
              </h2>
              <p className="section-desc">Get notified when spending exceeds your limits</p>

              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={settings.budgetAlerts.enabled}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        budgetAlerts: { ...prev.budgetAlerts, enabled: e.target.checked },
                      }))
                    }
                  />
                  <span className="toggle-switch" />
                  <span>Enable budget alerts</span>
                </label>
              </div>

              {settings.budgetAlerts.enabled && (
                <>
                  <div className="form-group">
                    <label className="form-label">Monthly Budget Limit</label>
                    <div className="input-with-prefix">
                      <span className="input-prefix">{symbol}</span>
                      <input
                        type="number"
                        className="form-input with-prefix"
                        value={settings.budgetAlerts.monthlyLimit || ''}
                        onChange={(e) =>
                          setSettings(prev => ({
                            ...prev,
                            budgetAlerts: {
                              ...prev.budgetAlerts,
                              monthlyLimit: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                        placeholder="0 = no limit"
                        min="0"
                        step="10"
                      />
                    </div>
                    <span className="form-hint">Set to 0 for no monthly limit</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category Limits</label>
                    <div className="category-limits">
                      {CATEGORIES.map((cat) => (
                        <div key={cat} className="category-limit-row">
                          <span className="category-name">{cat}</span>
                          <div className="input-with-prefix small">
                            <span className="input-prefix">{symbol}</span>
                            <input
                              type="number"
                              className="form-input with-prefix"
                              value={settings.budgetAlerts.categoryLimits[cat] || ''}
                              onChange={(e) => {
                                const num = parseFloat(e.target.value) || 0;
                                setSettings(prev => ({
                                  ...prev,
                                  budgetAlerts: {
                                    ...prev.budgetAlerts,
                                    categoryLimits: {
                                      ...prev.budgetAlerts.categoryLimits,
                                      [cat]: num,
                                    },
                                  },
                                }));
                              }}
                              placeholder="No limit"
                              min="0"
                              step="5"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <span className="form-hint">Set to 0 or leave empty for no category limit</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="settings-card">
              <h2 className="section-title">
                <Lock size={18} />
                Change Password
              </h2>
              <p className="section-desc">Update your password regularly to keep your account secure</p>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters with 1 number"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  <Lock size={16} />
                  {changingPassword ? 'Changing...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Export */}
          {activeTab === 'export' && (
            <div className="settings-card">
              <h2 className="section-title">
                <Download size={18} />
                Data Export
              </h2>
              <p className="section-desc">Export your bill data for external use</p>

              <div className="export-options">
                <div className="export-card">
                  <div className="export-icon csv">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div className="export-info">
                    <h3>Export as CSV</h3>
                    <p>Download all your bill data as a CSV spreadsheet file</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleExportCSV}
                    disabled={exporting}
                  >
                    <Download size={16} />
                    {exporting ? 'Exporting...' : 'Download CSV'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
