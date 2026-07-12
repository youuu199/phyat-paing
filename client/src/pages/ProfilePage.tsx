import { useState, useEffect, useRef } from 'react';
import { User, Camera, Lock, Save, Trash2, CheckCircle, XCircle, Calendar, FileText, DollarSign } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/Toast';
import { useCurrency } from '../hooks/useCurrency';

interface ProfileData {
  email: string;
  displayName: string;
  avatarUrl: string;
  currency: string;
  theme: string;
  budgetAlerts: {
    enabled: boolean;
    monthlyLimit: number;
    categoryLimits: Record<string, number>;
  };
  createdAt: string;
}

interface AccountStats {
  memberSince: string;
  totalBills: number;
  totalPaid: number;
  totalUnpaid: number;
  totalSpent: number;
}

export default function ProfilePage() {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrency();

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Avatar state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Stats
  const [stats, setStats] = useState<AccountStats | null>(null);

  // Load profile
  useEffect(() => {
    loadProfile();
    loadStats();
  }, [apiFetch]);

  async function loadProfile() {
    try {
      const res = await apiFetch('/api/v1/users/me');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setDisplayName(data.displayName || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }

  async function loadStats() {
    try {
      const res = await apiFetch('/api/v1/users/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  // Save display name
  async function handleSaveName() {
    if (!displayName.trim()) {
      toast('Display name cannot be empty', 'error');
      return;
    }

    setSavingName(true);
    try {
      const res = await apiFetch('/api/v1/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      if (res.ok) {
        toast('Display name updated', 'success');
        loadProfile();
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || 'Failed to update name', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to update name', 'error');
    } finally {
      setSavingName(false);
    }
  }

  // Upload avatar
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('Image must be under 5MB', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await apiFetch('/api/v1/users/avatar', {
        method: 'PATCH',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev);
        toast('Avatar updated', 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || 'Failed to upload avatar', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to upload avatar', 'error');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }

  // Remove avatar
  async function handleRemoveAvatar() {
    try {
      const res = await apiFetch('/api/v1/users/avatar', { method: 'DELETE' });
      if (res.ok) {
        setProfile((prev) => prev ? { ...prev, avatarUrl: '' } : prev);
        toast('Avatar removed', 'success');
      } else {
        toast('Failed to remove avatar', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to remove avatar', 'error');
    }
  }

  // Change password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast('Please fill in all password fields', 'error');
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
      toast('New passwords do not match', 'error');
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

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <User size={24} />
          Profile
        </h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      <div className="profile-grid">
        {/* Avatar Section */}
        <div className="profile-card">
          <h2 className="section-title">Profile Picture</h2>
          <div className="avatar-section">
            <div className="avatar-container">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <User size={48} />
                </div>
              )}
              {uploadingAvatar && (
                <div className="avatar-uploading">
                  <div className="spinner" />
                </div>
              )}
            </div>

            <div className="avatar-actions">
              <button
                className="btn btn-primary"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Camera size={16} />
                {profile?.avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              {profile?.avatarUrl && (
                <button
                  className="btn btn-danger-outline"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                hidden
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-card">
          <h2 className="section-title">Personal Information</h2>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={profile?.email || ''}
              disabled
            />
            <span className="form-hint">Email cannot be changed</span>
          </div>

          <div className="form-group">
            <label className="form-label">Display Name</label>
            <div className="input-row">
              <input
                type="text"
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
              <button
                className="btn btn-primary"
                onClick={handleSaveName}
                disabled={savingName || displayName === (profile?.displayName || '')}
              >
                <Save size={16} />
                {savingName ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Member Since</label>
            <div className="info-field">
              <Calendar size={16} />
              <span>{profile?.createdAt ? formatDate(profile.createdAt) : '...'}</span>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="profile-card">
          <h2 className="section-title">Account Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <FileText size={20} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{stats?.totalBills ?? '...'}</span>
                <span className="stat-label">Total Bills</span>
              </div>
            </div>
            <div className="stat-item">
              <CheckCircle size={20} className="stat-icon text-success" />
              <div className="stat-info">
                <span className="stat-value">{stats?.totalPaid ?? '...'}</span>
                <span className="stat-label">Paid</span>
              </div>
            </div>
            <div className="stat-item">
              <XCircle size={20} className="stat-icon text-danger" />
              <div className="stat-info">
                <span className="stat-value">{stats?.totalUnpaid ?? '...'}</span>
                <span className="stat-label">Unpaid</span>
              </div>
            </div>
            <div className="stat-item">
              <DollarSign size={20} className="stat-icon text-primary" />
              <div className="stat-info">
                <span className="stat-value">
                  {stats?.totalSpent != null
                    ? formatCurrency(stats.totalSpent)
                    : '...'}
                </span>
                <span className="stat-label">Total Spent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="profile-card">
          <h2 className="section-title">
            <Lock size={18} />
            Change Password
          </h2>
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
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
