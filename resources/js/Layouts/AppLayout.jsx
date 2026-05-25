import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, ClipboardList, Clock, LogOut, ShieldCheck, UserCircle, Users, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Avatar from '../Components/Avatar';

const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/profile', label: 'My Profile', icon: UserCircle },
];

const adminNav = [
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/logs', label: 'Activity Logs', icon: ClipboardList },
];

const timeoutMs = Number(import.meta.env.VITE_INACTIVITY_TIMEOUT_MS ?? 300000);
const warningMs = Number(import.meta.env.VITE_INACTIVITY_WARNING_MS ?? 60000);
const warningDelayMs = Math.max(timeoutMs - warningMs, 1000);

export default function AppLayout({ title, children }) {
    const page = usePage();
    const { auth, flash } = page.props;
    const url = page.url || '';
    const user = auth.user;
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(Math.ceil(warningMs / 1000));
    const warningTimer = useRef(null);
    const logoutTimer = useRef(null);
    const countdownTimer = useRef(null);
    const warningVisible = useRef(false);

    const logout = () => {
        router.post('/logout');
    };

    const clearInactivityTimers = useCallback(() => {
        window.clearTimeout(warningTimer.current);
        window.clearTimeout(logoutTimer.current);
        window.clearInterval(countdownTimer.current);
    }, []);

    const timeoutLogout = useCallback(() => {
        clearInactivityTimers();
        router.post('/session/timeout');
    }, [clearInactivityTimers]);

    const startTimers = useCallback(() => {
        clearInactivityTimers();
        setShowTimeoutWarning(false);
        warningVisible.current = false;
        setSecondsLeft(Math.ceil(warningMs / 1000));

        warningTimer.current = window.setTimeout(() => {
            setShowTimeoutWarning(true);
            warningVisible.current = true;
            setSecondsLeft(Math.ceil(warningMs / 1000));

            countdownTimer.current = window.setInterval(() => {
                setSecondsLeft((current) => Math.max(current - 1, 0));
            }, 1000);
        }, warningDelayMs);

        logoutTimer.current = window.setTimeout(timeoutLogout, timeoutMs);
    }, [clearInactivityTimers, timeoutLogout]);

    const stayLoggedIn = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        fetch('/session/keep-alive', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': token ?? '',
                'X-Requested-With': 'XMLHttpRequest',
            },
        }).finally(startTimers);
    };

    useEffect(() => {
        if (!user) {
            return undefined;
        }

        const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
        const handleActivity = () => {
            if (!warningVisible.current) {
                startTimers();
            }
        };

        startTimers();
        activityEvents.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

        return () => {
            clearInactivityTimers();
            activityEvents.forEach((event) => window.removeEventListener(event, handleActivity));
        };
    }, [clearInactivityTimers, startTimers, user]);

    return (
        <div className="app-shell">
            <aside className="sidebar">
                    <div className="brand">
                        <div className="brand-mark">FD</div>
                        <div>
                            <div>Financial DSS</div>
                            <small style={{ color: '#64748b' }}>Secure Login Module</small>
                        </div>
                    </div>

                <div className="nav-group">
                    <p className="nav-label">Workspace</p>
                    {nav.map((item) => (
                        <Link key={item.href} href={item.href} className={`nav-link ${url.startsWith(item.href) ? 'active' : ''}`}>
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </div>

                {user?.role === 'admin' && (
                    <div className="nav-group">
                        <p className="nav-label">Administration</p>
                        {adminNav.map((item) => (
                            <Link key={item.href} href={item.href} className={`nav-link ${url.startsWith(item.href) ? 'active' : ''}`}>
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </aside>

            <main className="main">
                <header className="topbar">
                    <div>
                        <strong style={{ color: '#0f172a' }}>{title}</strong>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Secure login and user management</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={`badge ${user?.role === 'admin' ? 'admin' : ''}`}>
                            <ShieldCheck size={14} />
                            {user?.role}
                        </span>
                        <Avatar src={user?.avatar_url} name={user?.fullname} className="topbar-avatar" fallbackClassName="avatar-fallback" />
                        <span style={{ color: '#334155', fontWeight: 700 }}>{user?.fullname}</span>
                        <button className="btn secondary" onClick={() => setShowLogoutModal(true)} type="button" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <section className="content">
                    {flash.success && <div className="panel panel-pad" style={{ borderColor: '#99f6e4', marginBottom: 16 }}>{flash.success}</div>}
                    {flash.error && <div className="panel panel-pad" style={{ borderColor: '#fecaca', marginBottom: 16 }}>{flash.error}</div>}
                    {children}
                </section>
            </main>

            {showTimeoutWarning && (
                <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="timeout-modal-title">
                    <div className="modal modal-sm">
                        <div className="modal-header">
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span className="warning-icon"><Clock size={20} /></span>
                                <div>
                                    <p className="nav-label" style={{ margin: 0 }}>Session security</p>
                                    <h2 id="timeout-modal-title" style={{ margin: '4px 0 0', color: '#0f172a' }}>Still there?</h2>
                                </div>
                            </div>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                You will be logged out in <strong>{secondsLeft}</strong> seconds due to inactivity.
                            </p>
                            <div className="modal-actions">
                                <button className="btn secondary" type="button" onClick={timeoutLogout}>Log out now</button>
                                <button className="btn" type="button" onClick={stayLoggedIn}>Stay logged in</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showLogoutModal && (
                <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
                    <div className="modal modal-sm">
                        <div className="modal-header">
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span className="warning-icon"><LogOut size={20} /></span>
                                <div>
                                    <p className="nav-label" style={{ margin: 0 }}>Confirm logout</p>
                                    <h2 id="logout-modal-title" style={{ margin: '4px 0 0', color: '#0f172a' }}>End your session?</h2>
                                </div>
                            </div>
                            <button className="icon-btn" type="button" onClick={() => setShowLogoutModal(false)} title="Close">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                You will be signed out and must log in again to access the secure dashboard.
                            </p>
                            <div className="modal-actions">
                                <button className="btn secondary" type="button" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                                <button className="btn danger" type="button" onClick={logout}>Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
