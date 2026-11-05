<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A titled group of invoice lines, e.g. "KEYHOLDER MINI – EYELET SCREW ONLY".
 *
 * @property int $id
 * @property int $invoice_id
 * @property string $title
 * @property string|null $note
 * @property int $position
 */
#[Fillable(['title', 'note', 'position'])]
class InvoiceSection extends Model
{
    /**
     * @return BelongsTo<Invoice, $this>
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * @return HasMany<InvoiceItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('position');
    }
}
