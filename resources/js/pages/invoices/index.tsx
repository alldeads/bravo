import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
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
import { create, destroy, edit, index, show } from '@/routes/invoices';
import type { Auth } from '@/types';

type InvoiceRow = {
    id: number;
    number: string;
    invoice_date: string;
    customer: string;
    total_quantity: number | string | null;
};

type Paginated<T> = {
    data: T[];
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function InvoicesIndex({
    invoices,
    filters,
}: {
    invoices: Paginated<InvoiceRow>;
    filters: { search: string };
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const can = (permission: string) => auth.permissions.includes(permission);

    const [search, setSearch] = useState(filters.search);
    const [deleteTarget, setDeleteTarget] = useState<InvoiceRow | null>(null);

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
            invalidateCacheTags: 'invoices',
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <Head title="Invoices" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Invoices"
                        description="Proforma invoices sent to customers"
                    />

                    {can('invoices.create') && (
                        <Button asChild>
                            <Link href={create()}>New invoice</Link>
                        </Button>
                    )}
                </div>

                <Input
                    placeholder="Search by P.I. no. or customer..."
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
                                <TableHead>P.I. No.</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">
                                    Total qty
                                </TableHead>
                                <TableHead className="w-0" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-mono text-sm">
                                        <Link
                                            href={show(invoice.id)}
                                            className="hover:underline"
                                        >
                                            {invoice.number}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {invoice.invoice_date}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {invoice.customer}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {Number(
                                            invoice.total_quantity ?? 0,
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={show(invoice.id)}>
                                                    View
                                                </Link>
                                            </Button>
                                            {can('invoices.edit') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(invoice.id)}
                                                    >
                                                        Edit
                                                    </Link>
                                                </Button>
                                            )}
                                            {can('invoices.delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteTarget(invoice)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {invoices.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-muted-foreground py-8 text-center"
                                    >
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {(invoices.prev_page_url || invoices.next_page_url) && (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!invoices.prev_page_url}
                            onClick={() =>
                                invoices.prev_page_url &&
                                router.get(
                                    invoices.prev_page_url,
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
                            disabled={!invoices.next_page_url}
                            onClick={() =>
                                invoices.next_page_url &&
                                router.get(
                                    invoices.next_page_url,
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
                    <DialogTitle>Delete invoice?</DialogTitle>
                    <DialogDescription>
                        {deleteTarget &&
                            `Invoice ${deleteTarget.number} for ${deleteTarget.customer} will be permanently deleted.`}
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

InvoicesIndex.layout = {
    breadcrumbs: [{ title: 'Invoices', href: index() }],
};
