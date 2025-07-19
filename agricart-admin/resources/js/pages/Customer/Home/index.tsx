import AppHeaderLayout from '@/layouts/app/app-header-layout';
import Heading from '@/components/heading';
import { UserInfo } from '@/components/user-info';
import { Head, usePage, router } from '@inertiajs/react';
import type { SharedData } from '@/types';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
}

interface PageProps {
    flash: {
        message?: string
    }
    products: Product[];
    [key: string]: unknown;
}

export default function CustomerHome() {

    let auth: SharedData['auth'] | undefined;
    try {
        // Defensive: usePage().props may not have auth
        const page = usePage<Partial<SharedData>>();
        auth = page?.props?.auth;

    } catch (e) {
        auth = undefined;
    }

    const { products = [], flash } = usePage<PageProps & SharedData>().props;

    const handleProfileClick = () => {
        if (auth && auth.user) {
            router.visit('/customer/profile');
        } else {
            router.visit('/login');
        }
    };

    return (
        <AppHeaderLayout>
            <Head title="Home" />
            <div className="flex flex-col items-center justify-center min-h-[90vh] gap-8">
                <h1 className="text-2xl font-bold">Available Fruits</h1>
                <Carousel
                    className='w-full max-w-4xl mx-auto'
                    opts={{
                        align: "center",
                        loop: true,
                    }}
                // For autoplay functionality
                // plugins={[
                //     Autoplay({
                //         delay: 2000,
                //     }),
                // ]}
                >
                    <CarouselContent className='-ml-1'>
                        {products.length > 0 ? (
                            products
                                .filter(product => product.category === 'fruit')
                                .map((product) => (
                                <CarouselItem key={product.id} className="pl-1 md:basis-1/2 lg:basis-1/3 flex justify-center">
                                    <Card className='w-70 max-w-sm'>
                                        <div>
                                            <img src={product.image} alt={product.name} />
                                        </div>
                                        <CardHeader>
                                            <CardTitle>{product.name}</CardTitle>
                                            <CardDescription>P{product.price}</CardDescription>
                                            <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                                            <CardAction>
                                                {/* <Button disabled={processing} onClick={() => handleArchive(product.id, product.name)}>
                                                Archive
                                            </Button> */}
                                            </CardAction>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-md break-words">{product.description}</p>
                                        </CardContent>
                                        <CardFooter className="flex-col gap-2">
                                            {/* <Button asChild disabled={processing} className="w-full">
                                                <Link href={route('inventory.addStock', product.id)}>Add Stock</Link>
                                            </Button> */}
                                            <div className="flex justify-betweeen w-full gap-2">
                                                {/* <Button asChild disabled={processing} className='w-1/2'>
                                                    <Link href={route('inventory.edit', product.id)}>Edit</Link>
                                                </Button>
                                                <Button disabled={processing} onClick={() => handleDelete(product.id, product.name)} className='w-1/2'>Delete</Button> */}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </CarouselItem>
                            ))
                        ) : (
                            <CarouselItem className="flex justify-center">
                                <Card className='w-70 max-w-sm'>
                                    <CardContent className="flex items-center justify-center h-40">
                                        <p className="text-gray-500">No products available</p>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        )}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>

                <h1 className="text-2xl font-bold">Available Vegetables</h1>
                <Carousel
                    className='w-full max-w-4xl mx-auto'
                    opts={{
                        align: "center",
                        loop: true,
                    }}
                // For autoplay functionality
                // plugins={[
                //     Autoplay({
                //         delay: 2000,
                //     }),
                // ]}
                >
                    <CarouselContent className='-ml-1'>
                        {products.length > 0 ? (
                            products
                                .filter(product => product.category === 'vegetable')
                                .map((product) => (
                                <CarouselItem key={product.id} className="pl-1 md:basis-1/2 lg:basis-1/3 flex justify-center">
                                    <Card className='w-70 max-w-sm'>
                                        <div>
                                            <img src={product.image} alt={product.name} />
                                        </div>
                                        <CardHeader>
                                            <CardTitle>{product.name}</CardTitle>
                                            <CardDescription>P{product.price}</CardDescription>
                                            <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                                            <CardAction>
                                                {/* <Button disabled={processing} onClick={() => handleArchive(product.id, product.name)}>
                                                Archive
                                            </Button> */}
                                            </CardAction>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-md break-words">{product.description}</p>
                                        </CardContent>
                                        <CardFooter className="flex-col gap-2">
                                            {/* <Button asChild disabled={processing} className="w-full">
                                                <Link href={route('inventory.addStock', product.id)}>Add Stock</Link>
                                            </Button> */}
                                            <div className="flex justify-betweeen w-full gap-2">
                                                {/* <Button asChild disabled={processing} className='w-1/2'>
                                                    <Link href={route('inventory.edit', product.id)}>Edit</Link>
                                                </Button>
                                                <Button disabled={processing} onClick={() => handleDelete(product.id, product.name)} className='w-1/2'>Delete</Button> */}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </CarouselItem>
                            ))
                        ) : (
                            <CarouselItem className="flex justify-center">
                                <Card className='w-70 max-w-sm'>
                                    <CardContent className="flex items-center justify-center h-40">
                                        <p className="text-gray-500">No products available</p>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        )}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>





                {/* {auth && auth.user ? (
                    <>
                        <button
                            className="mt-6 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition"
                            onClick={handleProfileClick}
                        >
                            Go to Profile
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="mt-6 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition"
                            onClick={handleProfileClick}
                        >
                            Login to View Profile
                        </button>
                    </>
                )} */}
                {/* Core Functionalities, products, restricted checkout || profile (included address) || settings (included notifications, request account deletion) 
                || order history (change loc)  */}
            </div>
        </AppHeaderLayout>
    );
}
