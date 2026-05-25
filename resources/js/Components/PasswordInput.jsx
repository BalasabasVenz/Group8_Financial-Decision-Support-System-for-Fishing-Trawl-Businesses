import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function PasswordInput({ id, value, onChange, autoComplete = 'off', lockAutofill = false }) {
    const [visible, setVisible] = useState(false);
    const [readOnly, setReadOnly] = useState(lockAutofill);
    const unlock = () => setReadOnly(false);

    return (
        <div className="password-input-wrap">
            <input
                id={id}
                name={`${id}_field`}
                className="input password-input"
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                autoCorrect="off"
                spellCheck="false"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                readOnly={readOnly}
                onFocus={unlock}
                onMouseDown={unlock}
            />
            <button
                className="password-toggle"
                type="button"
                onClick={() => setVisible((current) => !current)}
                title={visible ? 'Hide password' : 'Show password'}
                aria-label={visible ? 'Hide password' : 'Show password'}
            >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}
