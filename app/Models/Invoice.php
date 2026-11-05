<?php

namespace App\Models;

use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Carbon;

/**
 * A proforma invoice: a header (number, date, customer, delivery terms)
 * followed by titled sections of line items.
 *
 * @property int $id
 * @property string $number
 * @property Carbon $invoice_date
 * @property string $customer
 * @property string|null $customer_details
 * @property string|null $delivery_terms
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['number', 'invoice_date', 'customer', 'customer_details', 'delivery_terms', 'created_by'])]
class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'invoice_date' => 'date:Y-m-d',
        ];
    }

    /**
     * @return HasMany<InvoiceSection, $this>
     */
    public function sections(): HasMany
    {
        return $this->hasMany(InvoiceSection::class)->orderBy('position');
    }

    /**
     * @return HasManyThrough<InvoiceItem, InvoiceSection, $this>
     */
    public function items(): HasManyThrough
    {
        return $this->hasManyThrough(InvoiceItem::class, InvoiceSection::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Suggest the next invoice number in the configured series, e.g.
     * BYR-D-004 → BYR-D-005. Falls back to the first number in the series.
     */
    public static function nextNumber(): string
    {
        $prefix = (string) config('invoices.number_prefix');
        $padding = (int) config('invoices.number_padding');

        $highest = static::query()
            ->where('number', 'like', $prefix.'%')
            ->pluck('number')
            ->map(fn (string $number) => substr($number, strlen($prefix)))
            ->filter(fn (string $suffix) => ctype_digit($suffix))
            ->map(fn (string $suffix) => (int) $suffix)
            ->max() ?? 0;

        return $prefix.str_pad((string) ($highest + 1), $padding, '0', STR_PAD_LEFT);
    }
}
