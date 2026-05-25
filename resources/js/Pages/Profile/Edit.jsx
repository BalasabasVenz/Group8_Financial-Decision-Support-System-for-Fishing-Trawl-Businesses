import { Head, useForm } from '@inertiajs/react';
import { Camera, KeyRound, Save } from 'lucide-react';
import { useState } from 'react';
import Avatar from '../../Components/Avatar';
import PasswordInput from '../../Components/PasswordInput';
import PasswordRequirements from '../../Components/PasswordRequirements';
import AppLayout from '../../Layouts/AppLayout';

export default function EditProfile({ profile }) {
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url);
    const profileForm = useForm({
        fullname: profile.fullname ?? '',
        contact_number: profile.contact_number ?? '',
        boat_name: profile.boat_name ?? '',
        position: profile.position ?? '',
        address: profile.address ?? '',
        bio: profile.bio ?? '',
        avatar: null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updateAvatar = (event) => {
        const file = event.target.files?.[0] ?? null;
        profileForm.setData('avatar', file);

        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const submitProfile = (event) => {
        event.preventDefault();
        profileForm.post('/profile', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const submitPassword = (event) => {
        event.preventDefault();
        passwordForm.put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <AppLayout title="My Profile">
            <Head title="My Profile" />
            <div style={{ display: 'grid', gap: 18 }}>
                <div className="hero-panel">
                    <div>
                        <p className="nav-label">Account settings</p>
                        <h1 style={{ margin: 0, color: '#0f172a' }}>Manage your profile</h1>
                        <p style={{ color: '#475569', maxWidth: 760 }}>
                            Update your avatar, personal details, and password. These settings apply to both user and admin accounts.
                        </p>
                    </div>
                    <div className="profile-hero-avatar">
                        <Avatar src={avatarPreview} name={profile.fullname} iconSize={86} />
                        <span>{profile.role}</span>
                    </div>
                </div>

                <div className="profile-grid">
                    <section className="panel panel-pad">
                        <div className="section-title-row" style={{ marginBottom: 18 }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#0f172a' }}>Profile Details</h2>
                                <p style={{ margin: '4px 0 0', color: '#64748b' }}>Visible identity and optional trawl business details.</p>
                            </div>
                            <span className="badge">{profile.username}</span>
                        </div>

                        <form onSubmit={submitProfile} className="profile-form" autoComplete="off">
                            <div className="avatar-picker">
                                <div className="avatar-large">
                                    <Avatar src={avatarPreview} name={profileForm.data.fullname} iconSize={64} />
                                </div>
                                <label className="btn secondary" htmlFor="avatar">
                                    <Camera size={18} /> Change Avatar
                                </label>
                                <input id="avatar" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={updateAvatar} hidden />
                                {profileForm.errors.avatar && <div className="error">{profileForm.errors.avatar}</div>}
                            </div>

                            <div className="field">
                                <label htmlFor="fullname">Full name</label>
                                <input id="fullname" className="input" value={profileForm.data.fullname} onChange={(e) => profileForm.setData('fullname', e.target.value)} />
                                {profileForm.errors.fullname && <div className="error">{profileForm.errors.fullname}</div>}
                            </div>

                            <div className="profile-form-2">
                                <div className="field">
                                    <label htmlFor="contact_number">Contact number</label>
                                    <input id="contact_number" className="input" placeholder="Example: 0917 000 0000" value={profileForm.data.contact_number} onChange={(e) => profileForm.setData('contact_number', e.target.value)} />
                                </div>
                                <div className="field">
                                    <label htmlFor="position">Role in operation</label>
                                    <input id="position" className="input" placeholder="Owner, captain, crew, bookkeeper" value={profileForm.data.position} onChange={(e) => profileForm.setData('position', e.target.value)} />
                                </div>
                            </div>

                            <div className="profile-form-2">
                                <div className="field">
                                    <label htmlFor="boat_name">Boat name</label>
                                    <input id="boat_name" className="input" placeholder="Example: FV Cantil 1" value={profileForm.data.boat_name} onChange={(e) => profileForm.setData('boat_name', e.target.value)} />
                                </div>
                                <div className="field">
                                    <label htmlFor="address">Address</label>
                                    <input id="address" className="input" placeholder="Barangay or business address" value={profileForm.data.address} onChange={(e) => profileForm.setData('address', e.target.value)} />
                                </div>
                            </div>

                            <div className="field">
                                <label htmlFor="bio">Profile note</label>
                                <textarea id="bio" className="input textarea" placeholder="Short note about your fishing trawl business role" value={profileForm.data.bio} onChange={(e) => profileForm.setData('bio', e.target.value)} />
                            </div>

                            <div className="modal-actions">
                                <button className="btn" disabled={profileForm.processing} type="submit"><Save size={18} /> Save Profile</button>
                            </div>
                        </form>
                    </section>

                    <section className="panel panel-pad">
                        <div className="section-title-row" style={{ marginBottom: 18 }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#0f172a' }}>Change Password</h2>
                                <p style={{ margin: '4px 0 0', color: '#64748b' }}>Use a strong password to protect your account.</p>
                            </div>
                            <div className="soft-icon"><KeyRound size={22} /></div>
                        </div>

                        <form onSubmit={submitPassword} className="profile-form" autoComplete="off">
                            <div className="field">
                                <label htmlFor="current_password">Current password</label>
                                <PasswordInput id="current_password" value={passwordForm.data.current_password} onChange={(e) => passwordForm.setData('current_password', e.target.value)} />
                                {passwordForm.errors.current_password && <div className="error">{passwordForm.errors.current_password}</div>}
                            </div>

                            <div className="password-section">
                                <div className="password-pair">
                                    <div className="field">
                                        <label htmlFor="new_password">New password</label>
                                        <PasswordInput id="new_password" value={passwordForm.data.password} onChange={(e) => passwordForm.setData('password', e.target.value)} />
                                        {passwordForm.errors.password && <div className="error">{passwordForm.errors.password}</div>}
                                    </div>
                                    <div className="field">
                                        <label htmlFor="new_password_confirmation">Confirm new password</label>
                                        <PasswordInput id="new_password_confirmation" value={passwordForm.data.password_confirmation} onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)} />
                                    </div>
                                </div>
                                <PasswordRequirements password={passwordForm.data.password} confirmation={passwordForm.data.password_confirmation} showMatch />
                            </div>

                            <div className="modal-actions">
                                <button className="btn" disabled={passwordForm.processing} type="submit"><KeyRound size={18} /> Change Password</button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
