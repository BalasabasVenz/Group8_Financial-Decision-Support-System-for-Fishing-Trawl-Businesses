import { Link } from '@inertiajs/react';

export default function Pagination({ paginator }) {
    if (!paginator || paginator.last_page <= 1) {
        return null;
    }

    return (
        <nav className="pagination" aria-label="Pagination">
            <div className="pagination-summary">
                Showing {paginator.from ?? 0} to {paginator.to ?? 0} of {paginator.total} records
            </div>
            <div className="pagination-links">
                {paginator.links.map((link, index) => (
                    link.url ? (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            className={`page-link ${link.active ? 'active' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={`${link.label}-${index}`}
                            className="page-link disabled"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                ))}
            </div>
        </nav>
    );
}
