import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import PasswordInput from '../../Components/PasswordInput';
import PasswordRequirements from '../../Components/PasswordRequirements';

export default function Register() {
    const [inputsLocked, setInputsLocked] = useState(true);
    const { data, setData, post, processing, errors, reset } = useForm({
        fullname: '',
        username: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        reset('fullname', 'username', 'password', 'password_confirmation');
        const clearAutofill = window.setTimeout(() => {
            setData({
                fullname: '',
                username: '',
                password: '',
                password_confirmation: '',
            });
        }, 150);

        return () => window.clearTimeout(clearAutofill);
    }, []);

    const unlockInputs = () => setInputsLocked(false);

    const submit = (event) => {
        event.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Register" />
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
                        <p className="nav-label">User registration</p>
                        <h1>
                            Create a protected user account
                        </h1>
                        <p>
                            New accounts are created with the user role. Only administrators can manage users, roles, lockouts, and activity logs.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span className="badge"><ShieldCheck size={14} /> Validated inputs</span>
                        <span className="badge"><ShieldCheck size={14} /> Password hashing</span>
                        <span className="badge"><ShieldCheck size={14} /> User role by default</span>
                    </div>
                </section>

                <section className="login-card">
                    <div className="auth-card">
                        <div className="auth-icon"><UserPlus size={28} /></div>
                        <h2 style={{ color: '#0f172a', marginBottom: 6 }}>Register</h2>
                        <p style={{ color: '#64748b', marginTop: 0 }}>Create a standard user account.</p>
                        <form onSubmit={submit} autoComplete="off" style={{ display: 'grid', gap: 16, marginTop: 24 }}>
                            <div className="field">
                                <label htmlFor="register_fullname">Full name</label>
                                <input id="register_fullname" name="register_fullname_field" className="input" value={data.fullname} onChange={(e) => setData('fullname', e.target.value)} autoComplete="new-password" autoCorrect="off" spellCheck="false" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other" readOnly={inputsLocked} onFocus={unlockInputs} onMouseDown={unlockInputs} />
                                {errors.fullname && <div className="error">{errors.fullname}</div>}
                            </div>
                            <div className="field">
                                <label htmlFor="register_identifier">Username</label>
                                <input id="register_identifier" name="register_identifier_field" className="input" value={data.username} onChange={(e) => setData('username', e.target.value)} autoComplete="new-password" autoCorrect="off" spellCheck="false" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other" readOnly={inputsLocked} onFocus={unlockInputs} onMouseDown={unlockInputs} />
                                {errors.username && <div className="error">{errors.username}</div>}
                            </div>
                            <div className="password-section">
                                <div className="password-pair">
                                    <div className="field">
                                        <label htmlFor="register_secret">Password</label>
                                        <PasswordInput id="register_secret" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" lockAutofill={inputsLocked} />
                                        {errors.password && <div className="error">{errors.password}</div>}
                                    </div>
                                    <div className="field">
                                        <label htmlFor="register_secret_confirmation">Confirm password</label>
                                        <PasswordInput id="register_secret_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" lockAutofill={inputsLocked} />
                                    </div>
                                </div>
                                <PasswordRequirements password={data.password} confirmation={data.password_confirmation} showMatch />
                            </div>
                            <button className="btn" disabled={processing}>Create account</button>
                        </form>
                        <p style={{ color: '#64748b', marginTop: 18 }}>
                            Already registered? <Link href="/login" style={{ color: '#0f766e', fontWeight: 800 }}>Sign in</Link>
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
