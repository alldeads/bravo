import { Link, usePage } from '@inertiajs/react';
import { FileText, LayoutGrid, Package, Settings } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as invoicesIndex } from '@/routes/invoices';
import { index as productsIndex } from '@/routes/products';
import { index as settingsIndex } from '@/routes/settings';
import type { Auth, NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        ...(auth.permissions.includes('products.view')
            ? [
                  {
                      title: 'Products',
                      href: productsIndex(),
                      icon: Package,
                      cacheTags: 'products',
                  },
              ]
            : []),
        ...(auth.permissions.includes('invoices.view')
            ? [
                  {
                      title: 'Invoices',
                      href: invoicesIndex(),
                      icon: FileText,
                      cacheTags: 'invoices',
                  },
              ]
            : []),
        {
            title: 'Settings',
            href: settingsIndex(),
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
