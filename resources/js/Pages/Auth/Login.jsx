import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import PasswordInput from '../../Components/PasswordInput';

export default function Login() {
    const [inputsLocked, setInputsLocked] = useState(true);
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        reset('username', 'password', 'remember');
        const clearAutofill = window.setTimeout(() => {
            setData({
                username: '',
                password: '',
                remember: false,
            });
        }, 150);

        return () => window.clearTimeout(clearAutofill);
    }, []);

    const unlockInputs = () => setInputsLocked(false);

    const submit = (event) => {
        event.preventDefault();
        post('/login');
    };

    const loginError = errors.username || errors.password;

    return (
        <>
            <Head title="Login" />
            <main className="login-page">
                <section className="login-hero">
                    <div className="brand">
                        <div className="brand-mark">FD</div>
                        <div>
                            <div>Financial DSS</div>
                            <small style={{ color: '#64748b' }}>Secure Login and User Management</small>
                        </div>
                    </div>
                    <div className="auth-hero-copy">
                       
                        <h1>
                            Financial Decision Support System for Fishing Trawl Businesses
                        </h1>
                        
                    </div>
                </section>

                <section className="login-card">
                    <div className="auth-card">
                        <div className="auth-icon"><LockKeyhole size={28} /></div>
                        <h2 style={{ color: '#0f172a', marginBottom: 6 }}>Sign in</h2>
                        <p style={{ color: '#64748b', marginTop: 0 }}>Use your assigned username and password.</p>
                        {loginError && (
                            <div className="auth-alert" role="alert">
                                <AlertTriangle size={18} />
                                <span>{loginError}</span>
                            </div>
                        )}
                        <form onSubmit={submit} autoComplete="off" style={{ display: 'grid', gap: 16, marginTop: 24 }}>
                            <div className="field">
                                <label htmlFor="login_identifier">Username</label>
                                <input
                                    id="login_identifier"
                                    name="login_identifier_field"
                                    className="input"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    autoComplete="new-password"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    data-bwignore="true"
                                    data-form-type="other"
                                    readOnly={inputsLocked}
                                    onFocus={unlockInputs}
                                    onMouseDown={unlockInputs}
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="login_secret">Password</label>
                                <PasswordInput id="login_secret" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" lockAutofill={inputsLocked} />
                            </div>
                            <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#475569' }}>
                                <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                                Remember this session
                            </label>
                            <button className="btn" disabled={processing}>Login</button>
                        </form>
                       
                        <p style={{ color: '#64748b', marginTop: 18 }}>
                            Need an account? <Link href="/register" style={{ color: '#0f766e', fontWeight: 800 }}>Register as user</Link>
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
