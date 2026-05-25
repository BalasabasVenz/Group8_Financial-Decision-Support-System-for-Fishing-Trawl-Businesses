import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react';

export const passwordRules = [
    { label: '8 or more characters', test: (value) => value.length >= 8 },
    { label: 'Uppercase letter', test: (value) => /[A-Z]/.test(value) },
    { label: 'Lowercase letter', test: (value) => /[a-z]/.test(value) },
    { label: 'Number', test: (value) => /[0-9]/.test(value) },
    { label: 'Symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export function passwordScore(password) {
    return passwordRules.filter((rule) => rule.test(password)).length;
}

function strengthLabel(score) {
    if (score >= passwordRules.length) {
        return 'Strong';
    }

    if (score >= 3) {
        return 'Good';
    }

    if (score > 0) {
        return 'Weak';
    }

    return 'Required';
}

export default function PasswordRequirements({ password, confirmation = '', showMatch = false, optional = false }) {
    const score = passwordScore(password);
    const hasPassword = password.length > 0;
    const matches = hasPassword && confirmation.length > 0 && password === confirmation;

    return (
        <div className={`password-helper ${hasPassword ? 'active' : ''}`}>
            <div className="password-helper-head">
                <div>
                    <div className="password-helper-title">Password strength</div>
                    <div className="password-helper-subtitle">
                        {optional && !hasPassword ? 'Leave blank to keep the current password.' : 'Use all requirements below.'}
                    </div>
                </div>
                <span className={`password-strength-badge score-${score}`}>
                    <ShieldCheck size={14} />
                    {strengthLabel(score)}
                </span>
            </div>
            <div className="password-meter" aria-hidden="true">
                {passwordRules.map((rule, bar) => (
                    <span key={rule.label} className={score > bar ? 'filled' : ''} />
                ))}
            </div>
            <div className="password-rules-grid">
                {passwordRules.map((rule) => {
                    const passed = rule.test(password);
                    const Icon = passed ? CheckCircle2 : Circle;

                    return (
                        <div className={`password-rule ${passed ? 'passed' : ''}`} key={rule.label}>
                            <Icon size={15} />
                            {rule.label}
                        </div>
                    );
                })}
                {showMatch && (
                    <div className={`password-rule ${matches ? 'passed' : ''}`}>
                        {matches ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                        Passwords match
                    </div>
                )}
            </div>
        </div>
    );
}
