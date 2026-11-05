<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A single invoice line. `size` prints under the code (e.g. "65x65mm") and
 * `remarks` prints highlighted after the description.
 *
 * @property int $id
 * @property int $invoice_section_id
 * @property int|null $product_id
 * @property string $code
 * @property string|null $size
 * @property int $quantity
 * @property string $unit
 * @property string $description
 * @property string|null $remarks
 * @property int $position
 */
#[Fillable(['product_id', 'code', 'size', 'quantity', 'unit', 'description', 'remarks', 'position'])]
class InvoiceItem extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<InvoiceSection, $this>
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(InvoiceSection::class, 'invoice_section_id');
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
