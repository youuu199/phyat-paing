import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './Toast';

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, apiFetch } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      toast('Password must be at least 8 characters', 'error');
      return;
    }

    if (!/\d/.test(newPassword)) {
      toast('Password must contain at least one number', 'error');
      return;
    }

    setChanging(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }

      toast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to change password', 'error');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="page-container">
      <button className="page-container__back" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="profile-page">
        <h2>👤 Profile</h2>

        <div className="profile-page__info">
          <div className="profile-page__field">
            <span className="profile-page__label">Email</span>
            <span className="profile-page__value">{user?.email}</span>
          </div>
          {user?.createdAt && (
            <div className="profile-page__field">
              <span className="profile-page__label">Member since</span>
              <span className="profile-page__value">
                {new Date(user.createdAt).toLocaleDateString('en', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        <h3>🔒 Change Password</h3>
        <form className="profile-page__form" onSubmit={handleChangePassword}>
          <div className="profile-page__form-group">
            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="profile-page__form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="profile-page__form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <button
            className="profile-page__submit"
            type="submit"
            disabled={changing}
          >
            {changing ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
