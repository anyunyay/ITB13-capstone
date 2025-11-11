import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/use-translation';
import { Stock } from '@/types/inventory-report';

interface StockTableProps {
  stocks: Stock[];
}

export function StockTable({ stocks }: StockTableProps) {
  const t = useTranslation();
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'id': comparison = a.id - b.id; break;
      case 'product_name': comparison = a.product.name.localeCompare(b.product.name); break;
      case 'quantity': comparison = a.quantity - b.quantity; break;
      case 'category': comparison = a.category.localeCompare(b.category); break;
      case 'member_name': comparison = a.member.name.localeCompare(b.member.name); break;
      case 'status':
        const statusA = a.removed_at ? 'removed' : (a.quantity === 0 ? 'sold' : 'available');
        const statusB = b.removed_at ? 'removed' : (b.quantity === 0 ? 'sold' : 'available');
        comparison = statusA.localeCompare(statusB);
        break;
      case 'created_at': comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
      default: return 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (stock: Stock) => {
    if (stock.removed_at) {
      return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">{t('admin.removed')}</Badge>;
    } else if (stock.quantity == 0) {
      return <Badge variant="default" className="bg-secondary/10 text-secondary border-secondary/20">{t('admin.sold')}</Badge>;
    } else {
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{t('admin.available')}</Badge>;
    }
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {sortedStocks.map((stock) => (
          <div key={stock.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">#{stock.id}</Badge>
                  {getStatusBadge(stock)}
                </div>
                <h3 className="font-semibold text-foreground">{stock.product.name}</h3>
                <p className="text-sm text-muted-foreground">{stock.product.produce_type}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t('admin.quantity')}:</span>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {t('admin.quantity_units', { quantity: stock.quantity })}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">{t('admin.category')}:</span>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                    {stock.category === 'Kilo' ? t('admin.category_kilo') : stock.category === 'Pc' ? t('admin.category_pc') : t('admin.category_tali')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t('admin.member')}:</span>
                <div className="font-medium text-foreground">{stock.member.name}</div>
                <div className="text-xs text-muted-foreground">{stock.member.email}</div>
              </div>
              <div>
                <span className="text-muted-foreground">{t('admin.created')}:</span>
                <div className="text-foreground">{dayjs(stock.created_at).format('MMM DD, YYYY')}</div>
              </div>
              {stock.notes && (
                <div>
                  <span className="text-muted-foreground">{t('admin.notes')}:</span>
                  <p className="text-foreground">{stock.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-center py-3 px-4 font-semibold text-foreground">
                <Button variant="ghost" onClick={() => handleSort('id')} className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full">
                  {t('admin.stock_id')} {getSortIcon('id')}
                </Button>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">
                <Button variant="ghost" onClick={() => handleSort('product_name')} className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full">
                  {t('admin.product')} {getSortIcon('product_name')}
                </Button>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">
                <Button variant="ghost" onClick={() => handleSort('quantity')} className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full">
                  {t('admin.quantity')} {getSortIcon('quantity')}
                </Button>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">
                <Button variant="ghost" onClick={() => handleSort('category')} className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full">
                  {t('admin.category')} {getSortIcon('category')}
                </Button>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">
                <Button variant="ghost" onClick={() => handleSort('member_name')} className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full">
                  {t('admin.member')} {getSortIcon('member_name')}
                </Button>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">
                <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full">
                  {t('admin.status')} {getSortIcon('status')}
                </Button>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">
                <Button variant="ghost" onClick={() => handleSort('created_at')} className="h-auto p-0 font-semibold hover:bg-transparent flex items-center justify-center w-full">
                  {t('admin.created')} {getSortIcon('created_at')}
                </Button>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">{t('admin.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock, index) => (
              <tr key={stock.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">#{stock.id}</Badge>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-foreground">{stock.product.name}</div>
                    <div className="text-sm text-muted-foreground">{stock.product.produce_type}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {t('admin.quantity_units', { quantity: stock.quantity })}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                    {stock.category === 'Kilo' ? t('admin.category_kilo') : stock.category === 'Pc' ? t('admin.category_pc') : t('admin.category_tali')}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-foreground">{stock.member.name}</div>
                    <div className="text-sm text-muted-foreground">{stock.member.email}</div>
                  </div>
                </td>
                <td className="py-3 px-4">{getStatusBadge(stock)}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{dayjs(stock.created_at).format('MMM DD, YYYY')}</td>
                <td className="py-3 px-4">
                  <div className="max-w-xs">
                    {stock.notes ? (
                      <p className="text-sm text-muted-foreground truncate" title={stock.notes}>{stock.notes}</p>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
