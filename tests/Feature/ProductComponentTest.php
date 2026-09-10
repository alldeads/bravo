<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductComponentTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_add_a_component_to_a_product()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $chair = Product::factory()->create();
        $screw = Product::factory()->material()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('products.components.store', $chair), [
                'component_id' => $screw->id,
                'quantity' => 4,
                'unit' => 'pcs',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertTrue($chair->fresh()->components->contains($screw));
        $this->assertSame('4.000', $chair->fresh()->components->first()->pivot->quantity);
    }

    public function test_attaching_a_product_to_itself_is_rejected()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $product = Product::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('products.components.store', $product), [
                'component_id' => $product->id,
                'quantity' => 1,
            ]);

        $response->assertSessionHasErrors('component_id');
        $this->assertCount(0, $product->fresh()->components);
    }

    public function test_a_transitive_circular_bill_of_materials_is_rejected()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $chair = Product::factory()->create(['name' => 'Chair']);
        $frame = Product::factory()->create(['name' => 'Frame']);
        $steel = Product::factory()->material()->create(['name' => 'Steel']);

        $frame->components()->attach($steel->id, ['quantity' => 1]);
        $chair->components()->attach($frame->id, ['quantity' => 1]);

        // Steel is already (transitively) a component of chair, via frame.
        // Making chair a component of steel would close the loop.
        $response = $this
            ->actingAs($admin)
            ->post(route('products.components.store', $steel), [
                'component_id' => $chair->id,
                'quantity' => 1,
            ]);

        $response->assertSessionHasErrors('component_id');
        $this->assertCount(0, $steel->fresh()->components);
    }

    public function test_admin_can_update_a_components_quantity()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $product = Product::factory()->create();
        $component = Product::factory()->material()->create();
        $product->components()->attach($component->id, ['quantity' => 1]);

        $response = $this
            ->actingAs($admin)
            ->put(route('products.components.update', [$product, $component]), [
                'quantity' => 10,
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame('10.000', $product->fresh()->components->first()->pivot->quantity);
    }

    public function test_admin_can_remove_a_component_from_a_product()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $product = Product::factory()->create();
        $component = Product::factory()->material()->create();
        $product->components()->attach($component->id, ['quantity' => 1]);

        $response = $this
            ->actingAs($admin)
            ->delete(route('products.components.destroy', [$product, $component]));

        $response->assertSessionHasNoErrors();
        $this->assertCount(0, $product->fresh()->components);
    }

    public function test_non_admin_without_products_edit_permission_cannot_manage_components()
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('user');

        $product = Product::factory()->create();
        $component = Product::factory()->material()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('products.components.store', $product), [
                'component_id' => $component->id,
                'quantity' => 1,
            ]);

        $response->assertForbidden();
    }
}
