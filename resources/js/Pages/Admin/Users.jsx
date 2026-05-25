import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Edit3, Lock, Plus, Trash2, Unlock, X } from 'lucide-react';
import { useState } from 'react';
import Pagination from '../../Components/Pagination';
import PasswordInput from '../../Components/PasswordInput';
import PasswordRequirements from '../../Components/PasswordRequirements';
import AppLayout from '../../Layouts/AppLayout';

export default function Users({ users }) {
    const { auth } = usePage().props;
    const rows = users.data ?? users;
    const [editing, setEditing] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const { data, setData, post, put, reset, processing, errors } = useForm({
        fullname: '',
        username: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        is_locked: false,
    });

    const startCreate = () => {
        setEditing(null);
        reset();
        setShowFormModal(true);
    };

    const startEdit = (user) => {
        setEditing(user);
        setData({
            fullname: user.fullname,
            username: user.username,
            password: '',
            password_confirmation: '',
            role: user.role,
            is_locked: user.is_locked,
        });
        setShowFormModal(true);
    };

    const clearForm = () => {
        setEditing(null);
        reset();
        setShowFormModal(false);
    };

    const submit = (event) => {
        event.preventDefault();
        if (editing) {
            put(`/admin/users/${editing.id}`, { onSuccess: clearForm });
        } else {
            post('/admin/users', { onSuccess: clearForm });
        }
    };

    const confirmDelete = () => {
        if (!deleting) {
            return;
        }

        router.delete(`/admin/users/${deleting.id}`, {
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <AppLayout title="User Management">
            <Head title="User Management" />
            <section className="panel panel-pad" style={{ overflowX: 'auto' }}>
                <div className="section-title-row" style={{ marginBottom: 18 }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a' }}>Users</h2>
                        <p style={{ margin: '4px 0 0', color: '#64748b' }}>Create, view, update, and delete user accounts with role and lockout controls.</p>
                    </div>
                    <button className="btn" type="button" onClick={startCreate}><Plus size={18} /> Add User</button>
                </div>
                <table className="table">
                    <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {rows.map((user) => (
                            <tr key={user.id}>
                                <td>{user.fullname}</td>
                                <td>{user.username}</td>
                                <td><span className={`badge ${user.role === 'admin' ? 'admin' : ''}`}>{user.role}</span></td>
                                <td>
                                    <span className={`badge ${user.is_locked ? 'locked' : ''}`}>
                                        {user.is_locked ? <Lock size={14} /> : <Unlock size={14} />}
                                        {user.is_locked ? 'Locked' : 'Active'}
                                    </span>
                                </td>
                                <td style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn secondary" type="button" onClick={() => startEdit(user)} title="Edit"><Edit3 size={16} /></button>
                                    <button className="btn danger" type="button" onClick={() => setDeleting(user)} disabled={auth.user.id === user.id} title="Delete"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination paginator={users} />
            </section>

            {showFormModal && (
                <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <p className="nav-label" style={{ margin: 0 }}>{editing ? 'Update account' : 'Create account'}</p>
                                <h2 id="user-modal-title" style={{ margin: '4px 0 0', color: '#0f172a' }}>{editing ? 'Edit User' : 'Add User'}</h2>
                            </div>
                            <button className="icon-btn" type="button" onClick={clearForm} title="Close"><X size={18} /></button>
                        </div>
                        <form onSubmit={submit} className="modal-body" autoComplete="off">
                            <div className="field">
                                <label>Full name</label>
                                <input className="input" value={data.fullname} onChange={(e) => setData('fullname', e.target.value)} autoComplete="off" autoCorrect="off" spellCheck="false" data-lpignore="true" data-form-type="other" autoFocus />
                                {errors.fullname && <div className="error">{errors.fullname}</div>}
                            </div>
                            <div className="field">
                                <label>Username</label>
                                <input className="input" value={data.username} onChange={(e) => setData('username', e.target.value)} autoComplete="off" autoCorrect="off" spellCheck="false" data-lpignore="true" data-form-type="other" />
                                {errors.username && <div className="error">{errors.username}</div>}
                            </div>
                            <div className="password-section">
                                <div className="password-pair">
                                    <div className="field">
                                        <label>{editing ? 'New password' : 'Password'}</label>
                                        <PasswordInput id="admin-password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" />
                                        {errors.password && <div className="error">{errors.password}</div>}
                                    </div>
                                    <div className="field">
                                        <label>Confirm password</label>
                                        <PasswordInput id="admin-password-confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                                        {errors.password_confirmation && <div className="error">{errors.password_confirmation}</div>}
                                    </div>
                                </div>
                                <PasswordRequirements password={data.password} confirmation={data.password_confirmation} showMatch optional={Boolean(editing)} />
                            </div>
                            <div className="field">
                                <label>Role</label>
                                <select className="select" value={data.role} onChange={(e) => {
                                    const role = e.target.value;
                                    setData({
                                        ...data,
                                        role,
                                        is_locked: role === 'admin' ? false : data.is_locked,
                                    });
                                }}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && <div className="error">{errors.role}</div>}
                            </div>
                            {editing && data.role !== 'admin' && (
                                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700 }}>
                                    <input type="checkbox" checked={data.is_locked} onChange={(e) => setData('is_locked', e.target.checked)} />
                                    Account locked
                                </label>
                            )}
                            {editing && data.role === 'admin' && (
                                <div className="badge admin" style={{ justifySelf: 'start' }}>Admin accounts cannot be locked</div>
                            )}
                            <div className="modal-actions">
                                <button className="btn secondary" type="button" onClick={clearForm}>Cancel</button>
                                <button className="btn" disabled={processing} type="submit"><Plus size={18} /> {editing ? 'Save Changes' : 'Create User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleting && (
                <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
                    <div className="modal modal-sm">
                        <div className="modal-header">
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span className="danger-icon"><AlertTriangle size={20} /></span>
                                <div>
                                    <p className="nav-label" style={{ margin: 0 }}>Delete user</p>
                                    <h2 id="delete-modal-title" style={{ margin: '4px 0 0', color: '#0f172a' }}>Confirm Delete</h2>
                                </div>
                            </div>
                            <button className="icon-btn" type="button" onClick={() => setDeleting(null)} title="Close"><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: '#475569', lineHeight: 1.6, marginTop: 0 }}>
                                Delete <strong>{deleting.fullname}</strong>? This removes the account and keeps past logs as historical records.
                            </p>
                            <div className="modal-actions">
                                <button className="btn secondary" type="button" onClick={() => setDeleting(null)}>Cancel</button>
                                <button className="btn danger" type="button" onClick={confirmDelete}>Delete User</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
