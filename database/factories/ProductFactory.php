<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => strtoupper(fake()->unique()->bothify('??-####')),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'unit' => fake()->randomElement(config('products.units')),
            'is_material' => fake()->boolean(),
            'is_sellable' => fake()->boolean(),
            'is_purchasable' => fake()->boolean(),
            'is_active' => true,
            'price' => fake()->optional()->randomFloat(2, 1, 1000),
            'cost' => fake()->optional()->randomFloat(2, 1, 800),
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
