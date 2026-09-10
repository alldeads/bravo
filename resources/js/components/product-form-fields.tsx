import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
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

type Product = {
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

export function ProductFormFields({
    product,
    units,
    errors,
}: {
    product?: Partial<Product>;
    units: string[];
    errors: Partial<Record<string, string>>;
}) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                        id="sku"
                        name="sku"
                        defaultValue={product?.sku}
                        required
                    />
                    <InputError message={errors.sku} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select name="unit" defaultValue={product?.unit ?? 'pcs'}>
                        <SelectTrigger id="unit" className="w-full">
                            <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {units.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                    {unit}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.unit} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={product?.name}
                    required
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={product?.description ?? ''}
                />
                <InputError message={errors.description} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="price">Selling price</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={product?.price ?? ''}
                    />
                    <InputError message={errors.price} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cost">Purchase cost</Label>
                    <Input
                        id="cost"
                        name="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={product?.cost ?? ''}
                    />
                    <InputError message={errors.cost} />
                </div>
            </div>

            <div className="grid gap-3">
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        name="is_material"
                        defaultChecked={product?.is_material}
                    />
                    This product is a raw material
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        name="is_sellable"
                        defaultChecked={product?.is_sellable}
                    />
                    Sellable to customers
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        name="is_purchasable"
                        defaultChecked={product?.is_purchasable}
                    />
                    Purchasable from suppliers
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        name="is_active"
                        defaultChecked={product?.is_active ?? true}
                    />
                    Active
                </label>
            </div>
        </>
    );
}
