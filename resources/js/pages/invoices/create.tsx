import { Head } from '@inertiajs/react';
import InvoiceController from '@/actions/App/Http/Controllers/InvoiceController';
import Heading from '@/components/heading';
import { InvoiceForm } from '@/components/invoice-form';
import { create, index } from '@/routes/invoices';
import type { InvoiceFormData, InvoiceProductOption } from '@/types';

export default function InvoicesCreate({
    defaults,
    units,
    products,
}: {
    defaults: Pick<
        InvoiceFormData,
        'number' | 'invoice_date' | 'delivery_terms'
    >;
    units: string[];
    products: InvoiceProductOption[];
}) {
    return (
        <>
            <Head title="New invoice" />

            <div className="max-w-5xl p-4">
                <Heading
                    title="New invoice"
                    description="Create a proforma invoice"
                />

                <InvoiceForm
                    initial={defaults}
                    units={units}
                    products={products}
                    submitLabel="Create invoice"
                    onSubmit={(form) =>
                        form.submit(InvoiceController.store(), {
                            preserveScroll: true,
                            invalidateCacheTags: 'invoices',
                        })
                    }
                />
            </div>
        </>
    );
}

InvoicesCreate.layout = {
    breadcrumbs: [
        { title: 'Invoices', href: index() },
        { title: 'New invoice', href: create() },
    ],
};
