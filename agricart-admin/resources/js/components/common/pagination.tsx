import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  links: PaginationLink[];
  from: number;
  to: number;
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ links, from, to, total, currentPage, lastPage, perPage, onPageChange }: PaginationProps) {
  if (total === 0) return null;

  const handlePageChange = (url: string | null) => {
    if (!url) return;
    
    if (onPageChange) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const page = parseInt(urlParams.get('page') || '1');
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span> to{' '}
        <span className="font-medium text-foreground">{to}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span> results
      </div>

      <div className="flex items-center gap-2">
        {/* First Page */}
        {currentPage > 2 && (
          <Link href={links[0].url || '#'} preserveState preserveScroll>
            <Button
              variant="outline"
              size="icon"
              disabled={!links[0].url}
              onClick={() => handlePageChange(links[0].url)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Previous Page */}
        <Link href={links[0].url || '#'} preserveState preserveScroll>
          <Button
            variant="outline"
            size="icon"
            disabled={!links[0].url}
            onClick={() => handlePageChange(links[0].url)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {links.slice(1, -1).map((link, index) => {
            const pageNumber = parseInt(link.label);
            
            // Show only nearby pages
            if (
              pageNumber === 1 ||
              pageNumber === lastPage ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <Link key={index} href={link.url || '#'} preserveState preserveScroll>
                  <Button
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-[2.5rem]"
                    disabled={!link.url}
                    onClick={() => handlePageChange(link.url)}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            } else if (
              pageNumber === currentPage - 2 ||
              pageNumber === currentPage + 2
            ) {
              return (
                <span key={index} className="px-2 text-muted-foreground">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        {/* Next Page */}
        <Link href={links[links.length - 1].url || '#'} preserveState preserveScroll>
          <Button
            variant="outline"
            size="icon"
            disabled={!links[links.length - 1].url}
            onClick={() => handlePageChange(links[links.length - 1].url)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>

        {/* Last Page */}
        {currentPage < lastPage - 1 && (
          <Link href={`?page=${lastPage}`} preserveState preserveScroll>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === lastPage}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
