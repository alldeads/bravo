<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    protected function userWithRole(string $role): User
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    protected function payload(array $overrides = []): array
    {
        return [
            'number' => 'BYR-D-004',
            'invoice_date' => '2026-09-03',
            'customer' => 'BOSTON',
            'delivery_terms' => '~75 Days',
            'sections' => [
                [
                    'title' => 'KEYHOLDER MINI',
                    'note' => 'EYELET SCREW ONLY',
                    'items' => [
                        ['code' => 'KYM-TURTLE-011-D1', 'quantity' => 5000, 'unit' => 'pcs', 'description' => 'KEY MINI TURTLE HATCHING IN WTWD RBLS W/ EYELET SCREW'],
                        ['code' => 'KYM-TURTLE-016-D1', 'quantity' => 2000, 'unit' => 'pcs', 'description' => 'KEY MINI TURTLE IN RBLS LAN W/ EYELET SCREW ONLY . W/ print'],
                    ],
                ],
                [
                    'title' => 'MAGNET REGULAR',
                    'items' => [
                        ['code' => 'MAG-TURTLE-029-D1', 'size' => '65x65mm', 'quantity' => 10000, 'unit' => 'pcs', 'description' => 'MAG NEW 3D TURTLE HATCHING IN KMCH WTWD W/ STRNG MGNT.', 'remarks' => 'new enlarge eyes, w/ barcode.'],
                    ],
                ],
            ],
            ...$overrides,
        ];
    }

    public function test_guest_is_redirected_to_login()
    {
        $this->get(route('invoices.index'))->assertRedirect(route('login'));
    }

    public function test_user_without_permission_cannot_view_invoices()
    {
        $this->actingAs($this->userWithRole('user'))
            ->get(route('invoices.index'))
            ->assertForbidden();
    }

    public function test_admin_can_create_an_invoice_with_sections_and_items()
    {
        $admin = $this->userWithRole('admin');

        $response = $this->actingAs($admin)->post(route('invoices.store'), $this->payload());

        $invoice = Invoice::where('number', 'BYR-D-004')->firstOrFail();

        $response->assertSessionHasNoErrors()->assertRedirect(route('invoices.show', $invoice));

        $this->assertSame('BOSTON', $invoice->customer);
        $this->assertSame($admin->id, $invoice->created_by);
        $this->assertSame(['KEYHOLDER MINI', 'MAGNET REGULAR'], $invoice->sections->pluck('title')->all());
        $this->assertSame(17000, (int) $invoice->items()->sum('quantity'));

        $this->actingAs($admin)
            ->get(route('invoices.show', $invoice))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('invoices/show')
                ->where('invoice.total_quantity', 17000)
                ->where('invoice.sections.0.note', 'EYELET SCREW ONLY')
                ->where('invoice.sections.1.items.0.size', '65x65mm')
                ->where('invoice.sections.1.items.0.remarks', 'new enlarge eyes, w/ barcode.')
                ->where('company.name', config('invoices.company.name')));
    }

    public function test_items_can_be_linked_to_a_product()
    {
        $admin = $this->userWithRole('admin');
        $product = Product::factory()->create(['sku' => 'KYM-TURTLE-011-D1']);

        $payload = $this->payload();
        $payload['sections'][0]['items'][0]['product_id'] = $product->id;

        $this->actingAs($admin)->post(route('invoices.store'), $payload)->assertSessionHasNoErrors();

        $this->assertDatabaseHas('invoice_items', ['code' => 'KYM-TURTLE-011-D1', 'product_id' => $product->id]);
    }

    public function test_updating_replaces_sections_and_items()
    {
        $admin = $this->userWithRole('admin');
        $this->actingAs($admin)->post(route('invoices.store'), $this->payload());
        $invoice = Invoice::where('number', 'BYR-D-004')->firstOrFail();

        $response = $this->actingAs($admin)->put(route('invoices.update', $invoice), $this->payload([
            'customer' => 'CHICAGO',
            'sections' => [[
                'title' => 'MAGNET REGULAR',
                'items' => [['code' => 'MAG-CAT-038-D1', 'quantity' => 1000, 'unit' => 'pcs', 'description' => 'MAG CAT IN WTWD']],
            ]],
        ]));

        $response->assertSessionHasNoErrors()->assertRedirect(route('invoices.show', $invoice));

        $invoice->refresh();
        $this->assertSame('CHICAGO', $invoice->customer);
        $this->assertCount(1, $invoice->sections);
        $this->assertSame(['MAG-CAT-038-D1'], $invoice->items()->pluck('code')->all());
        $this->assertDatabaseCount('invoice_items', 1);
    }

    public function test_invoice_requires_at_least_one_section_and_valid_items()
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('invoices.store'), $this->payload(['sections' => []]))
            ->assertSessionHasErrors('sections');

        $this->actingAs($admin)
            ->post(route('invoices.store'), $this->payload(['sections' => [[
                'title' => 'X',
                'items' => [['code' => '', 'quantity' => 0, 'unit' => 'bogus', 'description' => '']],
            ]]]))
            ->assertSessionHasErrors([
                'sections.0.items.0.code',
                'sections.0.items.0.quantity',
                'sections.0.items.0.unit',
                'sections.0.items.0.description',
            ]);
    }

    public function test_invoice_number_must_be_unique()
    {
        $admin = $this->userWithRole('admin');
        Invoice::factory()->create(['number' => 'BYR-D-004']);

        $this->actingAs($admin)
            ->post(route('invoices.store'), $this->payload())
            ->assertSessionHasErrors('number');
    }

    public function test_create_page_suggests_the_next_invoice_number()
    {
        $admin = $this->userWithRole('admin');
        Invoice::factory()->create(['number' => 'BYR-D-004']);
        Invoice::factory()->create(['number' => 'BYR-D-009']);
        Invoice::factory()->create(['number' => 'OTHER-100']);

        $this->actingAs($admin)
            ->get(route('invoices.create'))
            ->assertInertia(fn ($page) => $page
                ->where('defaults.number', 'BYR-D-010')
                ->where('defaults.delivery_terms', '~75 Days'));
    }

    public function test_manager_can_create_but_not_delete_invoices()
    {
        $manager = $this->userWithRole('manager');

        $this->actingAs($manager)->post(route('invoices.store'), $this->payload())->assertSessionHasNoErrors();
        $invoice = Invoice::firstOrFail();

        $this->actingAs($manager)->delete(route('invoices.destroy', $invoice))->assertForbidden();
        $this->assertModelExists($invoice);
    }

    public function test_admin_can_delete_an_invoice_and_its_lines()
    {
        $admin = $this->userWithRole('admin');
        $this->actingAs($admin)->post(route('invoices.store'), $this->payload());
        $invoice = Invoice::firstOrFail();

        $this->actingAs($admin)
            ->delete(route('invoices.destroy', $invoice))
            ->assertRedirect(route('invoices.index'));

        $this->assertModelMissing($invoice);
        $this->assertDatabaseCount('invoice_items', 0);
    }

    public function test_index_lists_invoices_with_total_quantity_and_search()
    {
        $admin = $this->userWithRole('admin');
        $this->actingAs($admin)->post(route('invoices.store'), $this->payload());
        Invoice::factory()->create(['number' => 'BYR-D-099', 'customer' => 'MIAMI']);

        $this->actingAs($admin)
            ->get(route('invoices.index', ['search' => 'boston']))
            ->assertInertia(fn ($page) => $page
                ->has('invoices.data', 1)
                ->where('invoices.data.0.number', 'BYR-D-004')
                ->where('invoices.data.0.total_quantity', fn ($total) => (int) $total === 17000));
    }
}
