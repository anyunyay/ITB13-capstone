import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BellDot, AlertTriangle } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGate } from '@/components/permission-gate';
import { PermissionGuard } from '@/components/permission-guard';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Product {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    description: string;
    image: string;
    produce_type: string;
}

interface Member {
    id: number;
    name: string;
    email: string;
        contact_number?: string;
    address?: string;
    registration_date?: string;
    document?: string;
    type: string;
    [key: string]: unknown;
}

interface Stock {
    id: number;
    product_id: number;
    quantity: number;
    member_id: number;
    product: Product;
    member: Member;
    category: 'Kilo' | 'Pc' | 'Tali';
}

interface PageProps {
    flash: {
        message?: string
    }
    errors: {
        archive?: string
    }
    products: Product[];
    stocks: Stock[];
    [key: string]: unknown;
}

export default function Index() {

    const { products, stocks, flash, errors, auth } = usePage<PageProps & SharedData>().props;
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [removeFormData, setRemoveFormData] = useState({
        stock_id: '',
        reason: '',
        other_reason: '',
    });

    // Check if the user is authenticated || Prevent flash-of-unauthenticated-content
    useEffect(() => {
        if (!auth?.user) {
            router.visit('/login');
        }
    }, [auth]);

    const { processing, delete: destroy, post } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete - ${name}?`)) {
            // Call the delete route
            destroy(route('inventory.destroy', id));
        }
    };

    const handleDeleteStock = (stock: Stock) => {
        if (confirm(`Are you sure you want to delete - Stock #${stock.id}?`)) {
            destroy(route('inventory.deleteStock', { product: stock.product_id, stock: stock.id }));
        }
    };

    const handleRemovePerishedStock = (stock: Stock) => {
        setSelectedProduct(stock.product);
        setRemoveFormData({ stock_id: stock.id.toString(), reason: '', other_reason: '' });
        setRemoveDialogOpen(true);
    };

    const handleRemoveStockSubmit = () => {
        if (!selectedProduct || !removeFormData.stock_id || !removeFormData.reason) {
            return;
        }

        // If "Other" is selected, require other_reason
        if (removeFormData.reason === 'Other' && !removeFormData.other_reason) {
            return;
        }

        // Prepare the data to send
        const submitData = {
            stock_id: removeFormData.stock_id,
            reason: removeFormData.reason === 'Other' ? removeFormData.other_reason : removeFormData.reason,
        };

        router.post(route('inventory.storeRemovePerishedStock', { product: selectedProduct.id }), submitData, {
            onSuccess: () => {
                setRemoveDialogOpen(false);
                setSelectedProduct(null);
                setRemoveFormData({ stock_id: '', reason: '', other_reason: '' });
            },
        });
    };

    const handleArchive = (id: number, name: string) => {
        if (confirm(`Archive product - ${name}?`)) {
            post(route('inventory.archive', id));
        }
    };

    // Check if a product has available stocks
    const hasAvailableStocks = (productId: number) => {
        return stocks.some(stock => stock.product_id === productId && stock.quantity > 0);
    };

    return (
        <PermissionGuard 
            permissions={['view inventory', 'create products', 'edit products', 'view archive', 'view stocks', 'create stocks', 'edit stocks', 'view sold stock', 'view stock trail']}
            pageTitle="Inventory Access Denied"
        >
            <AppLayout>
                <Head title="Inventory" />
                <div className="m-4">
                <PermissionGate permission="create products">
                    <Link href={route('inventory.create')}><Button>Create Product</Button></Link>
                </PermissionGate>
                <PermissionGate permission="view archive">
                    <Link href={route('inventory.archived.index')}><Button>Archived Products</Button></Link>
                </PermissionGate>

                <div className='m-4'>
                    <div>
                        {flash.message && (
                            <Alert>
                                <BellDot className='h-4 w-4 text-blue-500' />
                                <AlertTitle>Notification!</AlertTitle>
                                <AlertDescription>{flash.message}</AlertDescription>
                            </Alert>
                        )}
                        {errors.archive && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertTriangle className='h-4 w-4 text-red-500' />
                                <AlertTitle>Error!</AlertTitle>
                                <AlertDescription>{errors.archive}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                <div className='grid grid-cols-5 gap-2'>
                    {products.map((product) => (
                        <Card key={product.id} className='w-70'>
                            <div>
                                <img src={product.image} alt={product.name} />
                            </div>
                            <CardHeader>
                                <CardTitle>{product.name}</CardTitle>
                                <CardDescription>
                                    <div className="text-sm">
                                        {product.price_kilo && <div>Kilo: P{product.price_kilo}</div>}
                                        {product.price_pc && <div>Pc: P{product.price_pc}</div>}
                                        {product.price_tali && <div>Tali: P{product.price_tali}</div>}
                                        {!product.price_kilo && !product.price_pc && !product.price_tali && <div>No prices set</div>}
                                    </div>
                                </CardDescription>
                                <div className="text-xs text-gray-500 mb-1">{product.produce_type}</div>
                                <PermissionGate permission="archive products">
                                    <CardAction>
                                        <Button 
                                            disabled={processing} 
                                            onClick={() => handleArchive(product.id, product.name)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Archive
                                        </Button>
                                    </CardAction>
                                </PermissionGate>
                            </CardHeader>
                            <CardContent>
                                <p className="text-md break-words">{product.description}</p>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <PermissionGate permission="create stocks">
                                    <Button asChild disabled={processing} className="w-full">
                                        <Link href={route('inventory.addStock', product.id)}>Add Stock</Link>
                                    </Button>
                                </PermissionGate>
                                <div className="flex justify-betweeen w-full gap-2">
                                    <PermissionGate permission="edit products">
                                        <Button asChild disabled={processing} className='w-1/2'>
                                            <Link href={route('inventory.edit', product.id)}>Edit</Link>
                                        </Button>
                                    </PermissionGate>
                                    <PermissionGate permission="delete products">
                                        <Button disabled={processing} onClick={() => handleDelete(product.id, product.name)} className='w-1/2'>Delete</Button>
                                    </PermissionGate>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="all">
                    <PermissionGate permission="view stock trail">
                        <Button asChild disabled={processing} className="w-1/8">
                            <Link href={route('inventory.stockTrail.index')}>Removed Stocks</Link>
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="view sold stock">
                        <Button asChild disabled={processing} className="w-1/8">
                            <Link href={route('inventory.soldStock.index')}>Sold Stocks</Link>
                        </Button>
                    </PermissionGate>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="kilo">By Kilo</TabsTrigger>
                        <TabsTrigger value="pc">By Pc</TabsTrigger>
                        <TabsTrigger value="tali">By Tali</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                        {stocks.length > 0 && (
                            <div className='w-full pt-8'>
                                <Table>
                                    <TableCaption>List of product stocks</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center">Stock ID</TableHead>
                                            <TableHead className="text-center">Product Name</TableHead>
                                            <TableHead className="text-center">Quantity</TableHead>
                                            <TableHead className="text-center">Category</TableHead>
                                            <TableHead className="text-center">Assigned To</TableHead>
                                            <TableHead className="text-center">Stock Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stocks.map((stock) => (
                                            <TableRow className="text-center" key={stock.id}>
                                                <TableCell>{stock.id}</TableCell>
                                                <TableCell>{stock.product?.name}</TableCell>
                                                <TableCell>{
                                                    stock.category === 'Kilo'
                                                        ? stock.quantity
                                                        : Math.floor(stock.quantity)
                                                }</TableCell>
                                                <TableCell>{stock.category}</TableCell>
                                                <TableCell>{stock.member?.name}</TableCell>
                                                <TableCell>
                                                    <PermissionGate permission="edit stocks">
                                                        <Link href={route('inventory.editStock', { product: stock.product_id, stock: stock.id })}><Button disabled={processing} className=''>Edit</Button></Link>
                                                    </PermissionGate>
                                                    <PermissionGate permission="delete stocks">
                                                        <Button disabled={processing} onClick={() => handleDeleteStock(stock)} className=''>Delete</Button>
                                                    </PermissionGate>
                                                    <PermissionGate permission="create stocks">
                                                        <Button 
                                                            disabled={processing} 
                                                            onClick={() => handleRemovePerishedStock(stock)} 
                                                            className='bg-orange-600 hover:bg-orange-700'
                                                        >
                                                            Remove Stock
                                                        </Button>
                                                    </PermissionGate>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}</TabsContent>
                    <TabsContent value="kilo">
                        {stocks.length > 0 && (
                            <div className='w-full pt-8'>
                                <Table>
                                    <TableCaption>List of product stocks</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center">Stock ID</TableHead>
                                            <TableHead className="text-center">Product Name</TableHead>
                                            <TableHead className="text-center">Quantity By Kilo</TableHead>
                                            <TableHead className="text-center">Assigned To</TableHead>
                                            <TableHead className="text-center">Stock Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stocks
                                            .filter((stock) => stock.category === 'Kilo')
                                            .map((stock) => (
                                                <TableRow className="text-center" key={stock.id}>
                                                    <TableCell>{stock.id}</TableCell>
                                                    <TableCell>{stock.product?.name}</TableCell>
                                                    <TableCell>{stock.quantity}</TableCell>
                                                    <TableCell>{stock.member?.name}</TableCell>
                                                    <TableCell>
                                                        <PermissionGate permission="edit stocks">
                                                            <Link href={route('inventory.editStock', { product: stock.product_id, stock: stock.id })}><Button disabled={processing} className=''>Edit</Button></Link>
                                                        </PermissionGate>
                                                        <PermissionGate permission="delete stocks">
                                                            <Button disabled={processing} onClick={() => handleDeleteStock(stock)} className=''>Delete</Button>
                                                        </PermissionGate>
                                                        <PermissionGate permission="create stocks">
                                                            <Button 
                                                                disabled={processing} 
                                                                onClick={() => handleRemovePerishedStock(stock)} 
                                                                className='bg-orange-600 hover:bg-orange-700'
                                                            >
                                                                Remove
                                                            </Button>
                                                        </PermissionGate>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}</TabsContent>
                    <TabsContent value="pc">
                        {stocks.length > 0 && (
                            <div className='w-full pt-8'>
                                <Table>
                                    <TableCaption>List of product stocks</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center">Stock ID</TableHead>
                                            <TableHead className="text-center">Product Name</TableHead>
                                            <TableHead className="text-center">Quantity By Pc</TableHead>
                                            <TableHead className="text-center">Assigned To</TableHead>
                                            <TableHead className="text-center">Stock Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stocks
                                            .filter((stock) => stock.category === 'Pc')
                                            .map((stock) => (
                                                <TableRow className="text-center" key={stock.id}>
                                                    <TableCell>{stock.id}</TableCell>
                                                    <TableCell>{stock.product?.name}</TableCell>
                                                    <TableCell>{Math.floor(stock.quantity)}</TableCell>
                                                    <TableCell>{stock.member?.name}</TableCell>
                                                    <TableCell>
                                                        <PermissionGate permission="edit stocks">
                                                            <Link href={route('inventory.editStock', { product: stock.product_id, stock: stock.id })}><Button disabled={processing} className=''>Edit</Button></Link>
                                                        </PermissionGate>
                                                        <PermissionGate permission="delete stocks">
                                                            <Button disabled={processing} onClick={() => handleDeleteStock(stock)} className=''>Delete</Button>
                                                        </PermissionGate>
                                                        <PermissionGate permission="create stocks">
                                                            <Button 
                                                                disabled={processing} 
                                                                onClick={() => handleRemovePerishedStock(stock)} 
                                                                className='bg-orange-600 hover:bg-orange-700'
                                                            >
                                                                Remove Stock
                                                            </Button>
                                                        </PermissionGate>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}</TabsContent>
                    <TabsContent value="tali">
                        {stocks.length > 0 && (
                            <div className='w-full pt-8'>
                                <Table>
                                    <TableCaption>List of product stocks</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center">Stock ID</TableHead>
                                            <TableHead className="text-center">Product Name</TableHead>
                                            <TableHead className="text-center">Quantity By Tali</TableHead>
                                            <TableHead className="text-center">Assigned To</TableHead>
                                            <TableHead className="text-center">Stock Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stocks
                                            .filter((stock) => stock.category === 'Tali')
                                            .map((stock) => (
                                                <TableRow className="text-center" key={stock.id}>
                                                    <TableCell>{stock.id}</TableCell>
                                                    <TableCell>{stock.product?.name}</TableCell>
                                                    <TableCell>{Math.floor(stock.quantity)}</TableCell>
                                                    <TableCell>{stock.member?.name}</TableCell>
                                                    <TableCell>
                                                        <PermissionGate permission="edit stocks">
                                                            <Link href={route('inventory.editStock', { product: stock.product_id, stock: stock.id })}><Button disabled={processing} className=''>Edit</Button></Link>
                                                        </PermissionGate>
                                                        <PermissionGate permission="delete stocks">
                                                            <Button disabled={processing} onClick={() => handleDeleteStock(stock)} className=''>Delete</Button>
                                                        </PermissionGate>
                                                        <PermissionGate permission="create stocks">
                                                            <Button 
                                                                disabled={processing} 
                                                                onClick={() => handleRemovePerishedStock(stock)} 
                                                                className='bg-orange-600 hover:bg-orange-700'
                                                            >
                                                                Remove
                                                            </Button>
                                                        </PermissionGate>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}</TabsContent>
                </Tabs>
            </div>

            {/* Remove Perished Stock Dialog */}
            <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Remove Stock
                        </DialogTitle>
                        <DialogDescription>
                            Remove stock that is no longer available for sale. 
                            This action will record the removal in the stock trail with your reason.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedProduct && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                {selectedProduct.image && (
                                    <img 
                                        src={selectedProduct.image} 
                                        alt={selectedProduct.name}
                                        className="w-12 h-12 object-cover rounded-lg"
                                    />
                                )}
                                <div>
                                    <h3 className="font-semibold">{selectedProduct.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Available stocks: {stocks.filter(s => s.product_id === selectedProduct.id && s.quantity > 0).length}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock_info">Stock Information</Label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm">
                                        <strong>Quantity:</strong> {stocks.find(s => s.id.toString() === removeFormData.stock_id)?.quantity} {stocks.find(s => s.id.toString() === removeFormData.stock_id)?.category}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Member:</strong> {stocks.find(s => s.id.toString() === removeFormData.stock_id)?.member?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Removal *</Label>
                                <Select 
                                    value={removeFormData.reason} 
                                    onValueChange={(value) => setRemoveFormData(prev => ({ ...prev, reason: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a reason for removal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sold Out">Sold Out</SelectItem>
                                        <SelectItem value="Discontinued">Discontinued</SelectItem>
                                        <SelectItem value="Damaged/Defective">Damaged/Defective</SelectItem>
                                        <SelectItem value="Expired">Expired</SelectItem>
                                        <SelectItem value="Season Ended">Season Ended</SelectItem>
                                        <SelectItem value="Listing Error">Listing Error</SelectItem>
                                        <SelectItem value="Vendor Inactive">Vendor Inactive</SelectItem>
                                        <SelectItem value="Under Update">Under Update</SelectItem>
                                        <SelectItem value="Regulatory Issue">Regulatory Issue</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                {removeFormData.reason === 'Other' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="other_reason">Specify Other Reason *</Label>
                                        <Textarea
                                            id="other_reason"
                                            value={removeFormData.other_reason || ''}
                                            onChange={(e) => setRemoveFormData(prev => ({ ...prev, other_reason: e.target.value }))}
                                            placeholder="Please specify the reason for removal"
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-orange-800 text-sm">Important Notice</h4>
                                        <p className="text-xs text-orange-700 mt-1">
                                            This action will permanently remove the selected stock from inventory. 
                                            The removal will be recorded in the stock trail with your provided reason.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setRemoveDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button"
                            disabled={
                                !removeFormData.stock_id || 
                                !removeFormData.reason || 
                                (removeFormData.reason === 'Other' && !removeFormData.other_reason) ||
                                processing
                            }
                            onClick={handleRemoveStockSubmit}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {processing ? 'Removing...' : 'Remove Stock'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
        </PermissionGuard>
    )
}
