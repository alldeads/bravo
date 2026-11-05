<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * The next value used to keep generated invoice numbers unique.
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
            'number' => 'TEST-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT),
            'invoice_date' => now()->toDateString(),
            'customer' => 'Customer '.$sequence,
            'customer_details' => null,
            'delivery_terms' => '~75 Days',
        ];
    }
}
