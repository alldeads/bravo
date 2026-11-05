import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { edit, index } from '@/routes/invoices';
import type { Auth, Invoice, InvoiceCompany } from '@/types';

/** Format a Y-m-d date as n/j/y, e.g. 2026-09-03 → 9/3/26. */
function formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);

    return `${month}/${day}/${String(year).slice(-2)}`;
}

const cell = 'border border-black px-1.5 py-0.5 align-bottom';

export default function InvoicesShow({
    invoice,
    company,
}: {
    invoice: Invoice;
    company: InvoiceCompany;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title={`Invoice ${invoice.number}`} />

            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
                    {auth.permissions.includes('invoices.edit') && (
                        <Button variant="outline" asChild>
                            <Link href={edit(invoice.id)}>
                                <Pencil /> Edit
                            </Link>
                        </Button>
                    )}
                    <Button onClick={() => window.print()}>
                        <Printer /> Print
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <article className="invoice-print mx-auto w-[210mm] min-w-[210mm] bg-white p-[10mm] text-[12px] leading-snug text-black shadow-sm print:shadow-none">
                        <header className="flex justify-between gap-6">
                            <div className="space-y-1 font-bold">
                                <div className="text-base">{company.name}</div>
                                <div>{company.address}</div>
                                <div>Tel.: {company.phone}</div>
                                <div>WhatsApp: {company.whatsapp}</div>
                            </div>
                            <table className="h-fit font-bold">
                                <tbody>
                                    <tr>
                                        <td className="pr-3">P.I. NO.</td>
                                        <td className="pr-3">:</td>
                                        <td className="text-right">
                                            {invoice.number}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3">P.I. DATE</td>
                                        <td className="pr-3">:</td>
                                        <td className="text-right">
                                            {formatDate(invoice.invoice_date)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </header>

                        <div className="mt-8 mb-12 grid grid-cols-[38%_42%_20%] items-start">
                            <div />
                            <div className="min-h-24 border-2 border-black px-1.5 py-0.5">
                                <div className="text-base font-bold text-red-900 uppercase">
                                    {invoice.customer}
                                </div>
                                {invoice.customer_details && (
                                    <div className="whitespace-pre-line">
                                        {invoice.customer_details}
                                    </div>
                                )}
                            </div>
                            {invoice.delivery_terms && (
                                <div className="pt-2 pl-3 font-bold whitespace-nowrap">
                                    Delivery date: {invoice.delivery_terms}
                                </div>
                            )}
                        </div>

                        <table className="w-full table-fixed border-collapse">
                            <colgroup>
                                <col className="w-[23%]" />
                                <col className="w-[9%]" />
                                <col className="w-[8%]" />
                                <col />
                            </colgroup>
                            <thead>
                                <tr className="font-bold">
                                    <th className={`${cell} text-center`}>
                                        CODE
                                    </th>
                                    <th className={`${cell} text-center`}>
                                        QTY
                                    </th>
                                    <th className={`${cell} text-center`}>
                                        U/M
                                    </th>
                                    <th className={`${cell} text-center`}>
                                        DESCRIPTION
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.sections.map((section, s) => (
                                    <SectionRows key={s} section={section} />
                                ))}
                                <tr className="font-bold">
                                    <td className={`${cell} text-right`}>
                                        OVERALL TOTAL
                                    </td>
                                    <td className={`${cell} text-center`}>
                                        {invoice.total_quantity}
                                    </td>
                                    <td className={cell} />
                                    <td className={cell} />
                                </tr>
                            </tbody>
                        </table>
                    </article>
                </div>
            </div>
        </>
    );
}

function SectionRows({ section }: { section: Invoice['sections'][number] }) {
    return (
        <>
            <tr>
                <td colSpan={4} className={`${cell} text-center font-bold`}>
                    {section.title}
                    {section.note && (
                        <>
                            {' - '}
                            <span className="text-red-600">{section.note}</span>
                        </>
                    )}
                </td>
            </tr>
            {section.items.map((item, i) => (
                <tr key={i}>
                    <td className={cell}>
                        <div className="whitespace-nowrap">{item.code}</div>
                        {item.size && <div>({item.size})</div>}
                    </td>
                    <td className={`${cell} text-center`}>{item.quantity}</td>
                    <td className={`${cell} text-center`}>{item.unit}</td>
                    <td className={`${cell} whitespace-pre-line`}>
                        {item.description}
                        {item.remarks && (
                            <>
                                {' '}
                                <span className="text-red-600">
                                    {item.remarks}
                                </span>
                            </>
                        )}
                    </td>
                </tr>
            ))}
        </>
    );
}

InvoicesShow.layout = {
    breadcrumbs: [{ title: 'Invoices', href: index() }],
};
