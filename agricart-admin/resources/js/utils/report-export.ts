import { ReportFilters } from '@/types/inventory-report';

export function buildExportParams(localFilters: ReportFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (localFilters.start_date) params.append('start_date', localFilters.start_date);
  if (localFilters.end_date) params.append('end_date', localFilters.end_date);
  if (localFilters.category !== 'all') params.append('category', localFilters.category);
  if (localFilters.status !== 'all') params.append('status', localFilters.status);
  if (localFilters.member_ids.length > 0) {
    localFilters.member_ids.forEach(id => params.append('member_ids[]', id));
  }
  if (localFilters.product_type !== 'all') params.append('product_type', localFilters.product_type);
  if (localFilters.min_quantity) params.append('min_quantity', localFilters.min_quantity);
  if (localFilters.max_quantity) params.append('max_quantity', localFilters.max_quantity);
  if (localFilters.search) params.append('search', localFilters.search);
  return params;
}

export function exportReport(format: 'csv' | 'pdf', localFilters: ReportFilters, routeFn: (name: string) => string) {
  const params = buildExportParams(localFilters);
  params.append('format', format);

  if (format === 'csv') {
    const downloadUrl = `${routeFn('inventory.report')}?${params.toString()}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `inventory_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } else {
    const downloadUrl = `${routeFn('inventory.report')}?${params.toString()}`;
    const displayParams = buildExportParams(localFilters);
    displayParams.append('format', format);
    displayParams.append('display', 'true');
    const displayUrl = `${routeFn('inventory.report')}?${displayParams.toString()}`;

    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `inventory_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      window.open(displayUrl, '_blank');
    }, 500);
  }
}
