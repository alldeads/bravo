import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
    InvoiceFormData,
    InvoiceItem,
    InvoiceProductOption,
    InvoiceSection,
} from '@/types';

const emptyItem = (): InvoiceItem => ({
    product_id: null,
    code: '',
    size: '',
    quantity: '',
    unit: 'pcs',
    description: '',
    remarks: '',
});

const emptySection = (): InvoiceSection => ({
    title: '',
    note: '',
    items: [emptyItem()],
});

export function InvoiceForm({
    initial,
    units,
    products,
    submitLabel,
    onSubmit,
}: {
    initial: Partial<InvoiceFormData>;
    units: string[];
    products: InvoiceProductOption[];
    submitLabel: string;
    onSubmit: (form: ReturnType<typeof useForm<InvoiceFormData>>) => void;
}) {
    const form = useForm<InvoiceFormData>({
        number: initial.number ?? '',
        invoice_date: initial.invoice_date ?? '',
        customer: initial.customer ?? '',
        customer_details: initial.customer_details ?? '',
        delivery_terms: initial.delivery_terms ?? '',
        sections: initial.sections?.length
            ? initial.sections
            : [emptySection()],
    });

    const errors = form.errors as Partial<Record<string, string>>;

    const updateSection = (
        sectionIndex: number,
        changes: Partial<InvoiceSection>,
    ) =>
        form.setData((data) => ({
            ...data,
            sections: data.sections.map((section, i) =>
                i === sectionIndex ? { ...section, ...changes } : section,
            ),
        }));

    const updateItem = (
        sectionIndex: number,
        itemIndex: number,
        changes: Partial<InvoiceItem>,
    ) =>
        form.setData((data) => ({
            ...data,
            sections: data.sections.map((section, i) =>
                i === sectionIndex
                    ? {
                          ...section,
                          items: section.items.map((item, j) =>
                              j === itemIndex ? { ...item, ...changes } : item,
                          ),
                      }
                    : section,
            ),
        }));

    const changeCode = (
        sectionIndex: number,
        itemIndex: number,
        code: string,
    ) => {
        const item = form.data.sections[sectionIndex].items[itemIndex];
        const product = products.find((p) => p.sku === code);

        // Picking a known product SKU links the line to it and pre-fills
        // the description and unit, without overwriting anything typed.
        updateItem(sectionIndex, itemIndex, {
            code,
            product_id: product?.id ?? null,
            ...(product && {
                description:
                    item.description || product.description || product.name,
                unit: product.unit,
            }),
        });
    };

    const addItem = (sectionIndex: number) =>
        updateSection(sectionIndex, {
            items: [...form.data.sections[sectionIndex].items, emptyItem()],
        });

    const removeItem = (sectionIndex: number, itemIndex: number) =>
        updateSection(sectionIndex, {
            items: form.data.sections[sectionIndex].items.filter(
                (_, j) => j !== itemIndex,
            ),
        });

    const addSection = () =>
        form.setData('sections', [...form.data.sections, emptySection()]);

    const removeSection = (sectionIndex: number) =>
        form.setData(
            'sections',
            form.data.sections.filter((_, i) => i !== sectionIndex),
        );

    const totalQuantity = form.data.sections.reduce(
        (total, section) =>
            total +
            section.items.reduce(
                (sum, item) => sum + (Number(item.quantity) || 0),
                0,
            ),
        0,
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={submit} className="space-y-8">
            <datalist id="invoice-product-skus">
                {products.map((product) => (
                    <option key={product.id} value={product.sku}>
                        {product.name}
                    </option>
                ))}
            </datalist>

            <section className="space-y-4">
                <Heading
                    variant="small"
                    title="Invoice details"
                    description="Printed in the invoice header"
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="number">P.I. No.</Label>
                        <Input
                            id="number"
                            value={form.data.number}
                            onChange={(e) =>
                                form.setData('number', e.target.value)
                            }
                            required
                        />
                        <InputError message={errors.number} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="invoice_date">P.I. Date</Label>
                        <Input
                            id="invoice_date"
                            type="date"
                            value={form.data.invoice_date}
                            onChange={(e) =>
                                form.setData('invoice_date', e.target.value)
                            }
                            required
                        />
                        <InputError message={errors.invoice_date} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="delivery_terms">Delivery date</Label>
                        <Input
                            id="delivery_terms"
                            placeholder="~75 Days"
                            value={form.data.delivery_terms ?? ''}
                            onChange={(e) =>
                                form.setData('delivery_terms', e.target.value)
                            }
                        />
                        <InputError message={errors.delivery_terms} />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="customer">Customer</Label>
                        <Input
                            id="customer"
                            placeholder="BOSTON"
                            value={form.data.customer}
                            onChange={(e) =>
                                form.setData('customer', e.target.value)
                            }
                            required
                        />
                        <InputError message={errors.customer} />
                    </div>

                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="customer_details">
                            Customer details (optional)
                        </Label>
                        <Textarea
                            id="customer_details"
                            rows={2}
                            placeholder="Address, contact person…"
                            value={form.data.customer_details ?? ''}
                            onChange={(e) =>
                                form.setData('customer_details', e.target.value)
                            }
                        />
                        <InputError message={errors.customer_details} />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <Heading
                    variant="small"
                    title="Line items"
                    description="Group items under section headings, e.g. KEYHOLDER MINI or MAGNET REGULAR. Type a product SKU in Code to pre-fill it."
                />

                <InputError message={errors.sections} />

                {form.data.sections.map((section, sectionIndex) => (
                    <div
                        key={sectionIndex}
                        className="space-y-4 rounded-lg border p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="grid flex-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`section-${sectionIndex}-title`}
                                    >
                                        Section title
                                    </Label>
                                    <Input
                                        id={`section-${sectionIndex}-title`}
                                        placeholder="KEYHOLDER MINI"
                                        value={section.title}
                                        onChange={(e) =>
                                            updateSection(sectionIndex, {
                                                title: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                    <InputError
                                        message={
                                            errors[
                                                `sections.${sectionIndex}.title`
                                            ]
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`section-${sectionIndex}-note`}
                                    >
                                        Highlighted note (printed in red)
                                    </Label>
                                    <Input
                                        id={`section-${sectionIndex}-note`}
                                        placeholder="EYELET SCREW ONLY"
                                        value={section.note ?? ''}
                                        onChange={(e) =>
                                            updateSection(sectionIndex, {
                                                note: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive mt-6"
                                disabled={form.data.sections.length === 1}
                                onClick={() => removeSection(sectionIndex)}
                                aria-label="Remove section"
                            >
                                <Trash2 />
                            </Button>
                        </div>

                        <InputError
                            message={errors[`sections.${sectionIndex}.items`]}
                        />

                        <div className="space-y-3">
                            {section.items.map((item, itemIndex) => {
                                const key = `sections.${sectionIndex}.items.${itemIndex}`;
                                const itemError =
                                    errors[`${key}.code`] ??
                                    errors[`${key}.quantity`] ??
                                    errors[`${key}.unit`] ??
                                    errors[`${key}.description`] ??
                                    errors[`${key}.size`] ??
                                    errors[`${key}.remarks`] ??
                                    errors[`${key}.product_id`];

                                return (
                                    <div
                                        key={itemIndex}
                                        className="bg-muted/40 space-y-2 rounded-md p-3"
                                    >
                                        <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                                            <Input
                                                aria-label="Code"
                                                placeholder="Code, e.g. KYM-TURTLE-011-D1"
                                                list="invoice-product-skus"
                                                value={item.code}
                                                onChange={(e) =>
                                                    changeCode(
                                                        sectionIndex,
                                                        itemIndex,
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <Input
                                                aria-label="Size"
                                                placeholder="Size, e.g. 65x65mm"
                                                value={item.size ?? ''}
                                                onChange={(e) =>
                                                    updateItem(
                                                        sectionIndex,
                                                        itemIndex,
                                                        {
                                                            size: e.target
                                                                .value,
                                                        },
                                                    )
                                                }
                                            />
                                            <Input
                                                aria-label="Quantity"
                                                placeholder="Qty"
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(
                                                        sectionIndex,
                                                        itemIndex,
                                                        {
                                                            quantity:
                                                                e.target.value,
                                                        },
                                                    )
                                                }
                                                required
                                            />
                                            <Select
                                                value={item.unit}
                                                onValueChange={(unit) =>
                                                    updateItem(
                                                        sectionIndex,
                                                        itemIndex,
                                                        { unit },
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    aria-label="Unit"
                                                    className="w-full"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {units.map((unit) => (
                                                        <SelectItem
                                                            key={unit}
                                                            value={unit}
                                                        >
                                                            {unit}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                disabled={
                                                    section.items.length === 1
                                                }
                                                onClick={() =>
                                                    removeItem(
                                                        sectionIndex,
                                                        itemIndex,
                                                    )
                                                }
                                                aria-label="Remove item"
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                                            <Textarea
                                                aria-label="Description"
                                                placeholder="Description"
                                                rows={2}
                                                value={item.description}
                                                onChange={(e) =>
                                                    updateItem(
                                                        sectionIndex,
                                                        itemIndex,
                                                        {
                                                            description:
                                                                e.target.value,
                                                        },
                                                    )
                                                }
                                                required
                                            />
                                            <Textarea
                                                aria-label="Remarks"
                                                placeholder="Remarks, printed in red, e.g. new enlarge eyes, w/ barcode."
                                                rows={2}
                                                value={item.remarks ?? ''}
                                                onChange={(e) =>
                                                    updateItem(
                                                        sectionIndex,
                                                        itemIndex,
                                                        {
                                                            remarks:
                                                                e.target.value,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>

                                        <InputError message={itemError} />
                                    </div>
                                );
                            })}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addItem(sectionIndex)}
                        >
                            <Plus /> Add item
                        </Button>
                    </div>
                ))}

                <Button type="button" variant="secondary" onClick={addSection}>
                    <Plus /> Add section
                </Button>
            </section>

            <div className="flex items-center justify-between gap-4 border-t pt-6">
                <p className="text-sm">
                    <span className="text-muted-foreground">
                        Overall total:{' '}
                    </span>
                    <span className="font-semibold tabular-nums">
                        {totalQuantity.toLocaleString()}
                    </span>
                </p>
                <Button type="submit" disabled={form.processing}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
