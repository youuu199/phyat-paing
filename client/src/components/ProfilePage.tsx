import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './Toast';
import { useTranslation } from '../i18n/useTranslation';
import { formatDate } from '../i18n/formatDate';
import { validatePassword } from '../utils/validatePassword';
import './SettingsPage.css';

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, apiFetch } = useAuth();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast(t('profile.errorMismatch'), 'error');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast(t(`profile.error${passwordError === 'length' ? 'Length' : 'Number'}`), 'error');
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
        throw new Error(data.error || t('profile.changeFailed'));
      }

      toast(t('profile.changed'), 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('profile.changeFailed'), 'error');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="page-container">
      <button className="page-container__back" onClick={onBack}>
        ← {t('settings.back')}
      </button>

      <div className="profile-page">
        <h2>👤 {t('profile.title')}</h2>

        <div className="profile-page__info">
          <div className="profile-page__field">
            <span className="profile-page__label">{t('profile.email')}</span>
            <span className="profile-page__value">{user?.email}</span>
          </div>
          {user?.createdAt && (
            <div className="profile-page__field">
              <span className="profile-page__label">{t('profile.memberSince')}</span>
              <span className="profile-page__value">
                {formatDate(user.createdAt, lang)}
              </span>
            </div>
          )}
        </div>

        <h3>🔒 {t('profile.changePassword')}</h3>
        <form className="profile-page__form" onSubmit={handleChangePassword}>
          <div className="profile-page__form-group">
            <label htmlFor="current-password">{t('profile.currentPassword')}</label>
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
            <label htmlFor="new-password">{t('profile.newPassword')}</label>
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
            <label htmlFor="confirm-password">{t('profile.confirmNewPassword')}</label>
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
            {changing ? t('profile.changing') : t('profile.changeBtn')}
          </button>
        </form>
      </div>
    </div>
  );
}
