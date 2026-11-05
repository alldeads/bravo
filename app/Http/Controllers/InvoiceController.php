<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceSection;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * List invoices, optionally filtered by number or customer.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $invoices = Invoice::query()
            ->withSum('items as total_quantity', 'quantity')
            ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('number', 'like', "%{$search}%")
                ->orWhere('customer', 'like', "%{$search}%")))
            ->latest('invoice_date')
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the form to create a new invoice.
     */
    public function create(): Response
    {
        return Inertia::render('invoices/create', [
            ...$this->formOptions(),
            'defaults' => [
                'number' => Invoice::nextNumber(),
                'invoice_date' => now()->toDateString(),
                'delivery_terms' => config('invoices.default_delivery_terms'),
            ],
        ]);
    }

    /**
     * Create a new invoice with its sections and line items.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $invoice = DB::transaction(function () use ($validated, $request) {
            $invoice = Invoice::create([
                ...collect($validated)->except('sections')->all(),
                'created_by' => $request->user()?->id,
            ]);

            $this->syncSections($invoice, $validated['sections']);

            return $invoice;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invoice created.')]);

        return to_route('invoices.show', $invoice);
    }

    /**
     * Show the printable invoice.
     */
    public function show(Invoice $invoice): Response
    {
        return Inertia::render('invoices/show', [
            'invoice' => $this->present($invoice),
            'company' => config('invoices.company'),
        ]);
    }

    /**
     * Show the form to edit an invoice.
     */
    public function edit(Invoice $invoice): Response
    {
        return Inertia::render('invoices/edit', [
            ...$this->formOptions(),
            'invoice' => $this->present($invoice),
        ]);
    }

    /**
     * Update an invoice, replacing its sections and line items.
     */
    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        $validated = $this->validated($request, $invoice);

        DB::transaction(function () use ($invoice, $validated) {
            $invoice->update(collect($validated)->except('sections')->all());

            $invoice->sections()->delete();

            $this->syncSections($invoice, $validated['sections']);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invoice updated.')]);

        return to_route('invoices.show', $invoice);
    }

    /**
     * Delete an invoice.
     */
    public function destroy(Invoice $invoice): RedirectResponse
    {
        $invoice->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invoice deleted.')]);

        return to_route('invoices.index');
    }

    /**
     * @return array<string, mixed>
     */
    protected function formOptions(): array
    {
        return [
            'units' => config('products.units'),
            'products' => Product::query()
                ->where('is_active', true)
                ->orderBy('sku')
                ->get(['id', 'sku', 'name', 'description', 'unit']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function present(Invoice $invoice): array
    {
        $invoice->load('sections.items');

        return [
            'id' => $invoice->id,
            'number' => $invoice->number,
            'invoice_date' => $invoice->invoice_date->toDateString(),
            'customer' => $invoice->customer,
            'customer_details' => $invoice->customer_details,
            'delivery_terms' => $invoice->delivery_terms,
            'total_quantity' => $invoice->sections->sum(fn (InvoiceSection $section) => $section->items->sum('quantity')),
            'sections' => $invoice->sections->map(fn (InvoiceSection $section) => [
                'title' => $section->title,
                'note' => $section->note,
                'items' => $section->items->map(fn (InvoiceItem $item) => [
                    'product_id' => $item->product_id,
                    'code' => $item->code,
                    'size' => $item->size,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit,
                    'description' => $item->description,
                    'remarks' => $item->remarks,
                ])->all(),
            ])->all(),
        ];
    }

    /**
     * Sections arrive from the request in display order; their array keys
     * are not guaranteed to be sequential, so positions come from order.
     *
     * @param  array<array-key, array<string, mixed>>  $sections
     */
    protected function syncSections(Invoice $invoice, array $sections): void
    {
        foreach (array_values($sections) as $sectionPosition => $sectionData) {
            $section = $invoice->sections()->create([
                'title' => $sectionData['title'],
                'note' => $sectionData['note'] ?? null,
                'position' => $sectionPosition,
            ]);

            foreach (array_values($sectionData['items']) as $itemPosition => $itemData) {
                $section->items()->create([
                    ...$itemData,
                    'position' => $itemPosition,
                ]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function validated(Request $request, ?Invoice $invoice = null): array
    {
        return $request->validate([
            'number' => ['required', 'string', 'max:50', Rule::unique('invoices', 'number')->ignore($invoice?->id)],
            'invoice_date' => ['required', 'date'],
            'customer' => ['required', 'string', 'max:255'],
            'customer_details' => ['nullable', 'string', 'max:2000'],
            'delivery_terms' => ['nullable', 'string', 'max:255'],
            'sections' => ['required', 'array', 'min:1'],
            'sections.*.title' => ['required', 'string', 'max:255'],
            'sections.*.note' => ['nullable', 'string', 'max:255'],
            'sections.*.items' => ['required', 'array', 'min:1'],
            'sections.*.items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'sections.*.items.*.code' => ['required', 'string', 'max:100'],
            'sections.*.items.*.size' => ['nullable', 'string', 'max:100'],
            'sections.*.items.*.quantity' => ['required', 'integer', 'min:1'],
            'sections.*.items.*.unit' => ['required', 'string', Rule::in(config('products.units'))],
            'sections.*.items.*.description' => ['required', 'string', 'max:2000'],
            'sections.*.items.*.remarks' => ['nullable', 'string', 'max:255'],
        ], [
            'sections.required' => __('Add at least one section.'),
            'sections.*.items.required' => __('Each section needs at least one item.'),
        ]);
    }
}
