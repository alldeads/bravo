import { Head } from '@inertiajs/react';
import InvoiceController from '@/actions/App/Http/Controllers/InvoiceController';
import Heading from '@/components/heading';
import { InvoiceForm } from '@/components/invoice-form';
import { index } from '@/routes/invoices';
import type { Invoice, InvoiceProductOption } from '@/types';

export default function InvoicesEdit({
    invoice,
    units,
    products,
}: {
    invoice: Invoice;
    units: string[];
    products: InvoiceProductOption[];
}) {
    return (
        <>
            <Head title={`Edit invoice ${invoice.number}`} />

            <div className="max-w-5xl p-4">
                <Heading
                    title="Edit invoice"
                    description={`P.I. No. ${invoice.number}`}
                />

                <InvoiceForm
                    initial={invoice}
                    units={units}
                    products={products}
                    submitLabel="Save changes"
                    onSubmit={(form) =>
                        form.submit(InvoiceController.update(invoice.id), {
                            preserveScroll: true,
                            invalidateCacheTags: 'invoices',
                        })
                    }
                />
            </div>
        </>
    );
}

InvoicesEdit.layout = {
    breadcrumbs: [{ title: 'Invoices', href: index() }],
};
