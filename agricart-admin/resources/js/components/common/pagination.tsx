import { router } from '@inertiajs/react';
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
    
    // Smooth scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Navigate after a short delay to allow scroll to start
    setTimeout(() => {
      router.visit(url, {
        preserveState: true,
        preserveScroll: false,
        onSuccess: () => {
          if (onPageChange) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const page = parseInt(urlParams.get('page') || '1');
            onPageChange(page);
          }
        }
      });
    }, 100);
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
          <Button
            variant="outline"
            size="icon"
            disabled={!links[0].url}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(links[0].url);
            }}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon"
          disabled={!links[0].url}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(links[0].url);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

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
                <Button
                  key={index}
                  variant={link.active ? 'default' : 'outline'}
                  size="sm"
                  className="min-w-[2.5rem]"
                  disabled={!link.url}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(link.url);
                  }}
                >
                  {link.label}
                </Button>
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
        <Button
          variant="outline"
          size="icon"
          disabled={!links[links.length - 1].url}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(links[links.length - 1].url);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        {currentPage < lastPage - 1 && (
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === lastPage}
            onClick={(e) => {
              e.preventDefault();
              const lastPageUrl = links[0].url?.split('?')[0] + `?page=${lastPage}`;
              handlePageChange(lastPageUrl);
            }}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
