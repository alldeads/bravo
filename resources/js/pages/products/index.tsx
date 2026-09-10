import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { create, destroy, edit, index } from '@/routes/products';

type Product = {
    id: number;
    sku: string;
    name: string;
    unit: string;
    is_material: boolean;
    is_sellable: boolean;
    is_purchasable: boolean;
    is_active: boolean;
};

type Paginated<T> = {
    data: T[];
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function ProductsIndex({
    products,
    filters,
}: {
    products: Paginated<Product>;
    filters: { search: string };
}) {
    const [search, setSearch] = useState(filters.search);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    const runSearch = (value: string) => {
        router.get(
            index.url(),
            { search: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(destroy.url(deleteTarget.id), {
            invalidateCacheTags: 'products',
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <Head title="Products" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Products"
                        description="Manage materials, components, and finished goods"
                    />

                    <Button asChild>
                        <Link href={create()}>New product</Link>
                    </Button>
                </div>

                <Input
                    placeholder="Search by SKU or name..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        runSearch(e.target.value);
                    }}
                    className="max-w-sm"
                />

                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Flags</TableHead>
                                <TableHead className="w-0" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-mono text-sm">
                                        {product.sku}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell>{product.unit}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {product.is_material && (
                                                <Badge variant="secondary">
                                                    Material
                                                </Badge>
                                            )}
                                            {product.is_sellable && (
                                                <Badge variant="secondary">
                                                    Sellable
                                                </Badge>
                                            )}
                                            {product.is_purchasable && (
                                                <Badge variant="secondary">
                                                    Purchasable
                                                </Badge>
                                            )}
                                            {!product.is_active && (
                                                <Badge variant="outline">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={edit(product.id)}>
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteTarget(product)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {products.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {(products.prev_page_url || products.next_page_url) && (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!products.prev_page_url}
                            onClick={() =>
                                products.prev_page_url &&
                                router.get(
                                    products.prev_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!products.next_page_url}
                            onClick={() =>
                                products.next_page_url &&
                                router.get(
                                    products.next_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogTitle>Delete product?</DialogTitle>
                    <DialogDescription>
                        {deleteTarget &&
                            `"${deleteTarget.name}" will be permanently deleted, along with its bill of materials.`}
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: index(),
        },
    ],
};
