import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { BellDot } from 'lucide-react';
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

interface Product {
    id: number;
    name: string;
    price: number;
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
    products: Product[];
    stocks: Stock[];
    [key: string]: unknown;
}

export default function Index() {

    const { products, stocks, flash, auth } = usePage<PageProps & SharedData>().props;
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
            destroy(route('inventory.removeStock', { product: stock.product_id, stock: stock.id }));
        }
    };

    const handleArchive = (id: number, name: string) => {
        if (confirm(`Archive product - ${name}?`)) {
            post(route('inventory.archive', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Inventory" />
            <div className="m-4">
                <Link href={route('inventory.create')}><Button>Create Product</Button></Link>
                <Link href={route('inventory.archived.index')}><Button>Archived Products</Button></Link>

                <div className='m-4'>
                    <div>
                        {flash.message && (
                            <Alert>
                                <BellDot className='h-4 w-4 text-blue-500' />
                                <AlertTitle>Notification!</AlertTitle>
                                <AlertDescription>{flash.message}</AlertDescription>
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
                                <CardDescription>P{product.price}</CardDescription>
                                <div className="text-xs text-gray-500 mb-1">{product.produce_type}</div>
                                <CardAction>
                                    <Button disabled={processing} onClick={() => handleArchive(product.id, product.name)}>
                                        Archive
                                    </Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <p className="text-md break-words">{product.description}</p>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                                <Button asChild disabled={processing} className="w-full">
                                    <Link href={route('inventory.addStock', product.id)}>Add Stock</Link>
                                </Button>
                                <div className="flex justify-betweeen w-full gap-2">
                                    <Button asChild disabled={processing} className='w-1/2'>
                                        <Link href={route('inventory.edit', product.id)}>Edit</Link>
                                    </Button>
                                    <Button disabled={processing} onClick={() => handleDelete(product.id, product.name)} className='w-1/2'>Delete</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="all">
                    <Button asChild disabled={processing} className="w-1/8">
                        <Link href={route('inventory.stockTrail.index')}>Removed Stocks</Link>
                    </Button>
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
                                                    <Link href={route('inventory.editStock', { product: stock.product_id, stock: stock.id })}><Button disabled={processing} className=''>Edit</Button></Link>
                                                    <Button disabled={processing} onClick={() => handleDeleteStock(stock)} className=''>Remove</Button>
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
                                                        <Link href={route('inventory.editStock', { product: stock.product_id, stock: stock.id })}><Button disabled={processing} className=''>Edit</Button></Link>
                                                        <Button disabled={processing} onClick={() => handleDeleteStock(stock)} className=''>Remove</Button>
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
                                                        <Link href={route('inventory.editStock', { product: stock.product_id, stock: stock.id })}><Button disabled={processing} className=''>Edit</Button></Link>
                                                        <Button disabled={processing} onClick={() => handleDeleteStock(stock)} className=''>Remove</Button>
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
                                                        <Link href={route('inventory.editStock', { product: stock.product_id, stock: stock.id })}><Button disabled={processing} className=''>Edit</Button></Link>
                                                        <Button disabled={processing} onClick={() => handleDeleteStock(stock)} className=''>Remove</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}</TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
