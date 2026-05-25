import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Avatar({ src, name, className, iconSize = 64, fallbackClassName = '' }) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (src && !failed) {
        return <img src={src} alt="" className={className} onError={() => setFailed(true)} />;
    }

    if (fallbackClassName) {
        return <span className={`${className} ${fallbackClassName}`}>{name?.charAt(0) ?? 'U'}</span>;
    }

    return <UserCircle size={iconSize} />;
}
