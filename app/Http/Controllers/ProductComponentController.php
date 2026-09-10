<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductComponentController extends Controller
{
    /**
     * Add a component (material or sub-assembly) to a product's bill of materials.
     */
    public function store(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'component_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'unit' => ['nullable', 'string', 'max:50'],
        ]);

        $component = Product::findOrFail((int) $validated['component_id']);

        if ($product->wouldCreateCycle($component)) {
            throw ValidationException::withMessages([
                'component_id' => __('Adding this component would create a circular bill of materials.'),
            ]);
        }

        $product->components()->syncWithoutDetaching([
            $component->id => [
                'quantity' => $validated['quantity'],
                'unit' => $validated['unit'] ?? null,
            ],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Component added.')]);

        return back();
    }

    /**
     * Update the quantity of a component already on a product's bill of materials.
     */
    public function update(Request $request, Product $product, Product $component): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'unit' => ['nullable', 'string', 'max:50'],
        ]);

        $product->components()->updateExistingPivot($component->id, $validated);

        return back();
    }

    /**
     * Remove a component from a product's bill of materials.
     */
    public function destroy(Product $product, Product $component): RedirectResponse
    {
        $product->components()->detach($component->id);

        return back();
    }
}
