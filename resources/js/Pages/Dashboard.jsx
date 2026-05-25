import { Head, usePage } from '@inertiajs/react';
import { ClipboardList, FileText, ReceiptText, ShieldCheck, TrendingUp, Users, Wallet } from 'lucide-react';
import AppLayout from '../Layouts/AppLayout';

const moduleIcons = [ReceiptText, Wallet, TrendingUp, FileText];

export default function Dashboard({ mode, stats, recentLogs, userModules = [], mockTrips = [] }) {
    const { auth } = usePage().props;
    const isAdmin = mode === 'admin';
    const cards = isAdmin ? [
        { label: 'Users', value: stats.users, icon: Users },
        { label: 'Admins', value: stats.admins, icon: ShieldCheck },
        { label: 'Activity Logs', value: stats.logs, icon: ClipboardList },
    ] : [];

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />
            <div style={{ display: 'grid', gap: 18 }}>
                <div className="hero-panel">
                    <div>
                        <p className="nav-label">{isAdmin ? 'Administrator overview' : 'User workspace'}</p>
                        <h1 style={{ margin: 0, color: '#0f172a' }}>
                            {isAdmin ? 'Secure Login and User Management Module' : `Welcome, ${auth.user.fullname}`}
                        </h1>
                        <p style={{ color: '#475569', maxWidth: 780 }}>
                            {isAdmin
                                ? 'This dashboard demonstrates authentication, authorization, accounting logs, secure sessions, password hashing, SQL injection resistance, and admin-only user management.'
                                : 'These placeholders represent the financial decision support features described in the research paper. A standard user can only access their own workspace and account activity.'}
                        </p>
                    </div>
                    <div className="hero-accent">
                        <span>{isAdmin ? 'SEC' : 'DSS'}</span>
                        <small>{isAdmin ? 'Access Control' : 'Financial Mock Data'}</small>
                    </div>
                </div>

                {isAdmin ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        {cards.map((card) => (
                            <div className="metric-card" key={card.label}>
                                <card.icon color="#0f766e" />
                                <div style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', marginTop: 10 }}>{card.value}</div>
                                <div style={{ color: '#64748b', fontWeight: 700 }}>{card.label}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                        {userModules.map((module, index) => {
                            const Icon = moduleIcons[index] ?? FileText;

                            return (
                                <div className="metric-card" key={module.title}>
                                    <Icon color="#0f766e" />
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
                                        <h2 style={{ color: '#0f172a', fontSize: 18, margin: 0 }}>{module.title}</h2>
                                        <span className="badge">{module.status}</span>
                                    </div>
                                    <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', marginTop: 12 }}>{module.value}</div>
                                    <div style={{ color: '#64748b', fontWeight: 800, fontSize: 13 }}>{module.meta}</div>
                                    <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{module.description}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isAdmin && (
                    <div className="panel panel-pad">
                        <div className="section-title-row">
                            <div>
                                <h2 style={{ margin: 0, color: '#0f172a' }}>Mock Trip Performance</h2>
                                <p style={{ margin: '4px 0 0', color: '#64748b' }}>Sample records connected to the research paper modules.</p>
                            </div>
                            <span className="badge">User view only</span>
                        </div>
                        <div style={{ overflowX: 'auto', marginTop: 14 }}>
                            <table className="table">
                                <thead><tr><th>Trip</th><th>Boat</th><th>Sales</th><th>Expenses</th><th>Net</th><th>Status</th></tr></thead>
                                <tbody>
                                    {mockTrips.map((trip) => (
                                        <tr key={trip.trip}>
                                            <td>{trip.trip}</td>
                                            <td>{trip.boat}</td>
                                            <td>{trip.sales}</td>
                                            <td>{trip.expenses}</td>
                                            <td style={{ fontWeight: 900, color: trip.profit.startsWith('-') ? '#b91c1c' : '#0f766e' }}>{trip.profit}</td>
                                            <td><span className={`badge ${trip.status === 'Review' ? 'locked' : ''}`}>{trip.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="panel panel-pad">
                    <h2 style={{ marginTop: 0, color: '#0f172a' }}>{isAdmin ? 'Recent Activity' : 'My Recent Activity'}</h2>
                    <table className="table">
                        <thead><tr><th>Activity</th><th>User</th><th>Time</th></tr></thead>
                        <tbody>
                            {recentLogs.length ? recentLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.activity}</td>
                                    <td>{log.user?.fullname ?? 'Unknown'}</td>
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" style={{ color: '#64748b' }}>No account activity yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
