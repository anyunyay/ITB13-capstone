import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PermissionGuard } from '@/components/permission-guard';
import type { SharedData } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

type ProductOption = { id: number; name: string };

interface PageProps {
    products: ProductOption[];
    defaultDays: number;
}

export default function TrendsIndex({ products, defaultDays }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const [selectedProductId, setSelectedProductId] = useState<string>('all');
    const [days, setDays] = useState<number>(defaultDays);
    const [loading, setLoading] = useState<boolean>(false);
    const [series, setSeries] = useState<any[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedProductId && selectedProductId !== 'all') params.append('product_id', selectedProductId);
            params.append('days', String(days));
            const res = await fetch(`/admin/trends/data?${params.toString()}`, { headers: { 'Accept': 'application/json' } });
            const json = await res.json();
            // Flatten grouped data into one array with product name on each point
            const flattened = json.data.flatMap((g: any) =>
                g.series.map((p: any) => ({ ...p, product: g.product || 'Unknown' }))
            );
            setSeries(flattened);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const chartData = useMemo(() => {
        // Recharts expects array of objects; we already have timestamps
        return series.map(p => ({
            timestamp: new Date(p.timestamp).toLocaleDateString(),
            price_kilo: p.price_kilo,
            price_pc: p.price_pc,
            price_tali: p.price_tali,
            product: p.product,
        }));
    }, [series]);

    return (
        <PermissionGuard permissions={['view inventory']} pageTitle="Trend Analysis Access Denied">
            <AppLayout>
                <Head title="Trend Analysis" />
                <div className="m-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Short-term Trend Analysis</h1>
                            <p className="text-muted-foreground">Visualize product price fluctuations over recent days</p>
                        </div>
                    </div>

                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Product</Label>
                                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All products" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All products</SelectItem>
                                            {products.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Days</Label>
                                    <Input type="number" min={1} max={90} value={days} onChange={(e) => setDays(Number(e.target.value))} />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={loadData} disabled={loading}>{loading ? 'Loading...' : 'Apply'}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Price Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div style={{ width: '100%', height: 420 }}>
                                <ResponsiveContainer>
                                    <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="timestamp" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="price_kilo" name="Per Kilo" stroke="#8884d8" dot={false} />
                                        <Line type="monotone" dataKey="price_pc" name="Per Piece" stroke="#82ca9d" dot={false} />
                                        <Line type="monotone" dataKey="price_tali" name="Per Tali" stroke="#ff7300" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </PermissionGuard>
    );
}


