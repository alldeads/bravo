<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login()
    {
        $response = $this->get(route('products.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_without_permission_cannot_view_products()
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('user');

        $response = $this
            ->actingAs($user)
            ->get(route('products.index'));

        $response->assertForbidden();
    }

    public function test_manager_can_view_and_create_products()
    {
        $this->seed(RolePermissionSeeder::class);

        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $this
            ->actingAs($manager)
            ->get(route('products.index'))
            ->assertOk();

        $response = $this
            ->actingAs($manager)
            ->post(route('products.store'), [
                'sku' => 'MAT-001',
                'name' => 'Steel Sheet',
                'unit' => 'kg',
                'is_material' => true,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('products.edit', Product::where('sku', 'MAT-001')->firstOrFail()));

        $product = Product::where('sku', 'MAT-001')->firstOrFail();
        $this->assertTrue($product->is_material);
        $this->assertFalse($product->is_sellable);
    }

    public function test_manager_cannot_delete_products()
    {
        $this->seed(RolePermissionSeeder::class);

        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $product = Product::factory()->create();

        $response = $this
            ->actingAs($manager)
            ->delete(route('products.destroy', $product));

        $response->assertForbidden();
        $this->assertModelExists($product);
    }

    public function test_admin_can_delete_a_product()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $product = Product::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->delete(route('products.destroy', $product));

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('products.index'));

        $this->assertModelMissing($product);
    }

    public function test_sku_must_be_unique()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Product::factory()->create(['sku' => 'DUP-001']);

        $response = $this
            ->actingAs($admin)
            ->post(route('products.store'), [
                'sku' => 'DUP-001',
                'name' => 'Duplicate',
                'unit' => 'pcs',
            ]);

        $response->assertSessionHasErrors('sku');
    }

    public function test_unit_must_be_one_of_the_preloaded_units()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this
            ->actingAs($admin)
            ->post(route('products.store'), [
                'sku' => 'UNIT-001',
                'name' => 'Bad Unit Product',
                'unit' => 'not-a-real-unit',
            ]);

        $response->assertSessionHasErrors('unit');
    }

    public function test_create_and_edit_pages_receive_the_preloaded_units()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $product = Product::factory()->create();

        $this
            ->actingAs($admin)
            ->get(route('products.create'))
            ->assertInertia(fn ($page) => $page
                ->where('units', config('products.units')));

        $this
            ->actingAs($admin)
            ->get(route('products.edit', $product))
            ->assertInertia(fn ($page) => $page
                ->where('units', config('products.units')));
    }

    public function test_unchecking_a_flag_on_update_actually_clears_it()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $product = Product::factory()->create([
            'is_material' => true,
            'is_sellable' => true,
        ]);

        $response = $this
            ->actingAs($admin)
            ->put(route('products.update', $product), [
                'sku' => $product->sku,
                'name' => $product->name,
                'unit' => $product->unit,
                // is_material and is_sellable intentionally omitted, as an
                // unchecked HTML checkbox would omit them.
            ]);

        $response->assertSessionHasNoErrors();

        $product->refresh();
        $this->assertFalse($product->is_material);
        $this->assertFalse($product->is_sellable);
    }

    public function test_products_can_be_searched_by_sku_or_name()
    {
        $this->seed(RolePermissionSeeder::class);

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Product::factory()->create(['sku' => 'FIND-001', 'name' => 'Widget']);
        Product::factory()->create(['sku' => 'OTHER-001', 'name' => 'Gadget']);

        $response = $this
            ->actingAs($admin)
            ->get(route('products.index', ['search' => 'Widget']));

        $response->assertInertia(fn ($page) => $page
            ->where('products.data', fn ($data) => collect($data)->pluck('sku')->all() === ['FIND-001']));
    }
}
