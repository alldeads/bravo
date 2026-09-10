<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * List products, optionally filtered by a search term.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $products = Product::query()
            ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('sku', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%")))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the form to create a new product.
     */
    public function create(): Response
    {
        return Inertia::render('products/create', [
            'units' => config('products.units'),
        ]);
    }

    /**
     * Create a new product.
     */
    public function store(Request $request): RedirectResponse
    {
        $product = Product::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product created.')]);

        return to_route('products.edit', $product);
    }

    /**
     * Show a single product: edit its details and manage its bill of materials.
     */
    public function edit(Product $product): Response
    {
        $product->load([
            'components' => fn ($query) => $query->orderBy('name'),
            'usedIn' => fn ($query) => $query->orderBy('name'),
        ]);

        return Inertia::render('products/edit', [
            'product' => $product,
            'units' => config('products.units'),
            'components' => $product->components->map(fn (Product $component) => [
                'id' => $component->id,
                'sku' => $component->sku,
                'name' => $component->name,
                'quantity' => $component->pivot->quantity,
                'unit' => $component->pivot->unit ?? $component->unit,
            ]),
            'usedIn' => $product->usedIn->map(fn (Product $parent) => [
                'id' => $parent->id,
                'sku' => $parent->sku,
                'name' => $parent->name,
            ]),
            'availableComponents' => Product::query()
                ->where('id', '!=', $product->id)
                ->orderBy('name')
                ->get(['id', 'sku', 'name', 'unit']),
        ]);
    }

    /**
     * Update a product's details.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $product->update($this->validated($request, $product));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product updated.')]);

        return to_route('products.edit', $product);
    }

    /**
     * Delete a product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product deleted.')]);

        return to_route('products.index');
    }

    /**
     * @return array<string, mixed>
     */
    protected function validated(Request $request, ?Product $product = null): array
    {
        $validated = $request->validate([
            'sku' => ['required', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product?->id)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'unit' => ['required', 'string', Rule::in(config('products.units'))],
            'price' => ['nullable', 'numeric', 'min:0'],
            'cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        // Checkboxes are absent from the request entirely when unchecked,
        // so a `boolean` validation rule can't tell "false" from "not sent"
        // — read them explicitly instead of trusting $validated's presence.
        return [
            ...$validated,
            'is_material' => $request->boolean('is_material'),
            'is_sellable' => $request->boolean('is_sellable'),
            'is_purchasable' => $request->boolean('is_purchasable'),
            'is_active' => $request->boolean('is_active'),
        ];
    }
}
