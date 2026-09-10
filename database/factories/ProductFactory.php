<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * The next value used to keep generated SKUs/names unique.
     */
    protected static int $sequence = 0;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sequence = ++static::$sequence;

        return [
            'sku' => 'SKU-'.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT),
            'name' => 'Product '.$sequence,
            'description' => null,
            'unit' => Arr::random(config('products.units')),
            'is_material' => (bool) random_int(0, 1),
            'is_sellable' => (bool) random_int(0, 1),
            'is_purchasable' => (bool) random_int(0, 1),
            'is_active' => true,
            'price' => random_int(100, 100000) / 100,
            'cost' => random_int(100, 80000) / 100,
        ];
    }

    /**
     * Indicate that the product is a raw material.
     */
    public function material(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_material' => true,
            'is_sellable' => false,
        ]);
    }

    /**
     * Indicate that the product is a finished, sellable good.
     */
    public function finishedGood(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_material' => false,
            'is_sellable' => true,
            'is_purchasable' => false,
        ]);
    }
}
