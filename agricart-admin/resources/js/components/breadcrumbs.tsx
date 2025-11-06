import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Fragment } from 'react';

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    return (
        <>
            {breadcrumbs.length > 0 && (
                <div className="min-w-0 overflow-hidden">
                    <Breadcrumb>
                        <BreadcrumbList className="flex-wrap sm:flex-nowrap">
                            {breadcrumbs.map((item, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                const isFirst = index === 0;
                                
                                // On mobile, only show the last breadcrumb if there are more than 2 items
                                const shouldHideOnMobile = breadcrumbs.length > 2 && !isLast && !isFirst;
                                
                                return (
                                    <Fragment key={index}>
                                        <BreadcrumbItem className={shouldHideOnMobile ? "hidden sm:flex" : "flex"}>
                                            {isLast ? (
                                                <BreadcrumbPage className="truncate max-w-[150px] sm:max-w-none">
                                                    {item.title}
                                                </BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link href={item.href} className="truncate max-w-[100px] sm:max-w-none">
                                                        {item.title}
                                                    </Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {!isLast && (
                                            <BreadcrumbSeparator className={shouldHideOnMobile ? "hidden sm:flex" : "flex"} />
                                        )}
                                        {/* Show ellipsis on mobile when items are hidden */}
                                        {breadcrumbs.length > 2 && isFirst && (
                                            <Fragment>
                                                <BreadcrumbSeparator className="sm:hidden" />
                                                <BreadcrumbItem className="sm:hidden">
                                                    <span className="text-muted-foreground">...</span>
                                                </BreadcrumbItem>
                                                <BreadcrumbSeparator className="sm:hidden" />
                                            </Fragment>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            )}
        </>
    );
}
