import { Form, Head } from '@inertiajs/react';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import Heading from '@/components/heading';
import { ProductFormFields } from '@/components/product-form-fields';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/products';

export default function ProductsCreate({ units }: { units: string[] }) {
    return (
        <>
            <Head title="New product" />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading
                    title="New product"
                    description="Add a material, component, or finished good"
                />

                <Form
                    {...ProductController.store.form()}
                    options={{ preserveScroll: true }}
                    invalidateCacheTags="products"
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <ProductFormFields units={units} errors={errors} />

                            <Button type="submit" disabled={processing}>
                                Create product
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ProductsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: index(),
        },
        {
            title: 'New product',
            href: create(),
        },
    ],
};
