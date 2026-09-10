<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $sku
 * @property string $name
 * @property string|null $description
 * @property string $unit
 * @property bool $is_material
 * @property bool $is_sellable
 * @property bool $is_purchasable
 * @property bool $is_active
 * @property string|null $price
 * @property string|null $cost
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ProductComponentPivot $pivot
 */
#[Fillable(['sku', 'name', 'description', 'unit', 'is_material', 'is_sellable', 'is_purchasable', 'is_active', 'price', 'cost'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_material' => 'boolean',
            'is_sellable' => 'boolean',
            'is_purchasable' => 'boolean',
            'is_active' => 'boolean',
            'price' => 'decimal:2',
            'cost' => 'decimal:2',
        ];
    }

    /**
     * The materials/components this product is built from.
     *
     * @return BelongsToMany<Product, $this, ProductComponentPivot, 'pivot'>
     */
    public function components(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_components', 'product_id', 'component_id')
            ->using(ProductComponentPivot::class)
            ->withPivot('quantity', 'unit')
            ->withTimestamps();
    }

    /**
     * The products that use this product as a component.
     *
     * @return BelongsToMany<Product, $this, ProductComponentPivot, 'pivot'>
     */
    public function usedIn(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_components', 'component_id', 'product_id')
            ->using(ProductComponentPivot::class)
            ->withPivot('quantity', 'unit')
            ->withTimestamps();
    }

    /**
     * Determine whether attaching $component to this product's bill of
     * materials would create a circular reference, directly or transitively.
     */
    public function wouldCreateCycle(Product $component): bool
    {
        if ($component->is($this)) {
            return true;
        }

        return static::componentTreeContains($component, $this);
    }

    /**
     * Determine whether $needle appears anywhere in $product's component subtree.
     *
     * @param  list<int>  $visited
     */
    protected static function componentTreeContains(Product $product, Product $needle, array $visited = []): bool
    {
        if (in_array($product->id, $visited, true)) {
            return false;
        }

        $visited[] = $product->id;

        foreach ($product->components as $child) {
            if ($child->is($needle) || static::componentTreeContains($child, $needle, $visited)) {
                return true;
            }
        }

        return false;
    }
}
