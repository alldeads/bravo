import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ProductComponentController from '@/actions/App/Http/Controllers/ProductComponentController';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { ProductFormFields } from '@/components/product-form-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { edit, index } from '@/routes/products';

type Product = {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    unit: string;
    price: string | null;
    cost: string | null;
    is_material: boolean;
    is_sellable: boolean;
    is_purchasable: boolean;
    is_active: boolean;
};

type Component = {
    id: number;
    sku: string;
    name: string;
    quantity: string;
    unit: string;
};

type UsedInProduct = {
    id: number;
    sku: string;
    name: string;
};

type AvailableComponent = {
    id: number;
    sku: string;
    name: string;
    unit: string;
};

export default function ProductsEdit({
    product,
    units,
    components,
    usedIn,
    availableComponents,
}: {
    product: Product;
    units: string[];
    components: Component[];
    usedIn: UsedInProduct[];
    availableComponents: AvailableComponent[];
}) {
    const [componentId, setComponentId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [componentError, setComponentError] = useState<string | undefined>();
    const [removing, setRemoving] = useState<Set<number>>(new Set());

    const addComponent = () => {
        if (!componentId || !quantity) {
            return;
        }

        router.post(
            ProductComponentController.store.url(product.id),
            { component_id: componentId, quantity },
            {
                preserveScroll: true,
                onError: (errors) =>
                    setComponentError(errors.component_id ?? errors.quantity),
                onSuccess: () => {
                    setComponentId('');
                    setQuantity('');
                    setComponentError(undefined);
                },
            },
        );
    };

    const removeComponent = (componentIdToRemove: number) => {
        setRemoving((current) => new Set(current).add(componentIdToRemove));

        router.delete(
            ProductComponentController.destroy.url({
                product: product.id,
                component: componentIdToRemove,
            }),
            {
                preserveScroll: true,
                onFinish: () =>
                    setRemoving((current) => {
                        const next = new Set(current);
                        next.delete(componentIdToRemove);
                        return next;
                    }),
            },
        );
    };

    return (
        <>
            <Head title={`Edit product: ${product.name}`} />

            <div className="max-w-6xl space-y-6 p-4">
                <Heading
                    title="Edit product"
                    description={`SKU ${product.sku}`}
                />

                <div className="grid gap-10 lg:grid-cols-2">
                    <div>
                        <Form
                            {...ProductController.update.form(product.id)}
                            options={{ preserveScroll: true }}
                            invalidateCacheTags="products"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <ProductFormFields
                                        product={product}
                                        units={units}
                                        errors={errors}
                                    />

                                    <Button type="submit" disabled={processing}>
                                        Save changes
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>

                    <div className="space-y-10">
                        <div>
                            <Heading
                                variant="small"
                                title="Bill of materials"
                                description="Materials or components this product is built from"
                            />

                            <div className="mt-4 space-y-4">
                                {components.length > 0 && (
                                    <div className="overflow-hidden rounded-lg border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Component
                                                    </TableHead>
                                                    <TableHead>
                                                        Quantity
                                                    </TableHead>
                                                    <TableHead className="w-0" />
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {components.map((component) => (
                                                    <TableRow
                                                        key={component.id}
                                                    >
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {component.name}
                                                            </div>
                                                            <div className="text-muted-foreground text-xs">
                                                                {component.sku}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {component.quantity}{' '}
                                                            {component.unit}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive"
                                                                disabled={removing.has(
                                                                    component.id,
                                                                )}
                                                                onClick={() =>
                                                                    removeComponent(
                                                                        component.id,
                                                                    )
                                                                }
                                                            >
                                                                Remove
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="grid gap-2">
                                        <label
                                            className="text-sm font-medium"
                                            htmlFor="component_id"
                                        >
                                            Add component
                                        </label>
                                        <Select
                                            value={componentId}
                                            onValueChange={setComponentId}
                                        >
                                            <SelectTrigger
                                                id="component_id"
                                                className="w-64"
                                            >
                                                <SelectValue placeholder="Select a product..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableComponents.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.id}
                                                            value={String(
                                                                option.id,
                                                            )}
                                                        >
                                                            {option.name} (
                                                            {option.sku})
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <label
                                            className="text-sm font-medium"
                                            htmlFor="quantity"
                                        >
                                            Quantity
                                        </label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            className="w-28"
                                            value={quantity}
                                            onChange={(e) =>
                                                setQuantity(e.target.value)
                                            }
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={addComponent}
                                        disabled={!componentId || !quantity}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <InputError message={componentError} />
                            </div>
                        </div>

                        {usedIn.length > 0 && (
                            <div>
                                <Heading
                                    variant="small"
                                    title="Used in"
                                    description="Products that use this one as a component"
                                />

                                <ul className="mt-4 space-y-1 text-sm">
                                    {usedIn.map((parent) => (
                                        <li key={parent.id}>
                                            <Link
                                                href={edit(parent.id)}
                                                className="text-foreground underline underline-offset-4"
                                            >
                                                {parent.name}
                                            </Link>{' '}
                                            <span className="text-muted-foreground">
                                                ({parent.sku})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ProductsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: index(),
        },
        {
            title: 'Edit product',
            href: index(),
        },
    ],
};
