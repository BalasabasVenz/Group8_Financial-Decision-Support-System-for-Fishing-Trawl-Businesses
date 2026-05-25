import { Head, router } from '@inertiajs/react';
import { AlertTriangle, ClipboardList, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Pagination from '../../Components/Pagination';
import AppLayout from '../../Layouts/AppLayout';

export default function Logs({ logs }) {
    const rows = logs.data ?? logs;
    const [showClearModal, setShowClearModal] = useState(false);
    const hasLogs = rows.length > 0;

    const clearLogs = () => {
        router.delete('/admin/logs', {
            preserveScroll: true,
            onSuccess: () => setShowClearModal(false),
        });
    };

    return (
        <AppLayout title="Activity Logs">
            <Head title="Activity Logs" />
            <section className="panel panel-pad">
                <div className="section-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="soft-icon"><ClipboardList size={22} /></div>
                        <div>
                            <h1 style={{ margin: 0, color: '#0f172a' }}>Accounting Audit Trail</h1>
                            <p style={{ margin: 0, color: '#64748b' }}>Login, logout, failed login, and user-management events.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span className="badge">Paginated</span>
                        <button className="btn danger" type="button" onClick={() => setShowClearModal(true)} disabled={!hasLogs}>
                            <Trash2 size={18} /> Clear Logs
                        </button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto', marginTop: 20 }}>
                    <table className="table">
                        <thead><tr><th>Activity</th><th>User</th><th>IP</th><th>User Agent</th><th>Time</th></tr></thead>
                        <tbody>
                            {rows.length > 0 ? rows.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.activity}</td>
                                    <td>{log.user ? `${log.user.fullname} (${log.user.username})` : 'Unknown'}</td>
                                    <td>{log.ip_address}</td>
                                    <td style={{ maxWidth: 360, color: '#64748b' }}>{log.user_agent}</td>
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ color: '#64748b', textAlign: 'center', padding: 28 }}>No activity logs yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination paginator={logs} />
            </section>

            {showClearModal && (
                <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="clear-logs-modal-title">
                    <div className="modal modal-sm">
                        <div className="modal-header">
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span className="danger-icon"><AlertTriangle size={20} /></span>
                                <div>
                                    <p className="nav-label" style={{ margin: 0 }}>Clear audit trail</p>
                                    <h2 id="clear-logs-modal-title" style={{ margin: '4px 0 0', color: '#0f172a' }}>Confirm Clear Logs</h2>
                                </div>
                            </div>
                            <button className="icon-btn" type="button" onClick={() => setShowClearModal(false)} title="Close">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                This will permanently remove the current activity logs. The system will keep one new audit record showing that you cleared them.
                            </p>
                            <div className="modal-actions">
                                <button className="btn secondary" type="button" onClick={() => setShowClearModal(false)}>Cancel</button>
                                <button className="btn danger" type="button" onClick={clearLogs}>Clear Logs</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
