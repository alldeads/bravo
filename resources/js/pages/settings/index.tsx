import { Head, Link, usePage } from '@inertiajs/react';
import { Lock, Palette, ShieldCheck, User, Users } from 'lucide-react';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { edit as editAppearance } from '@/routes/appearance';
import { index as permissionsIndex } from '@/routes/permissions';
import { edit as editProfile } from '@/routes/profile';
import { index as rolesIndex } from '@/routes/roles';
import { edit as editSecurity } from '@/routes/security';
import { index as settingsIndex } from '@/routes/settings';
import type { Auth, NavItem } from '@/types';

type Section = NavItem & { description: string };

export default function SettingsIndex() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const sections: Section[] = [
        {
            title: 'Profile',
            description: 'Update your name and email address',
            href: editProfile(),
            icon: User,
        },
        {
            title: 'Security',
            description:
                'Manage your password, two-factor authentication, and passkeys',
            href: editSecurity(),
            icon: ShieldCheck,
        },
        {
            title: 'Appearance',
            description: 'Customize how the app looks on your device',
            href: editAppearance(),
            icon: Palette,
        },
        ...(auth.roles.includes('admin')
            ? [
                  {
                      title: 'Roles',
                      description: 'Create roles and see who has each one',
                      href: rolesIndex(),
                      icon: Users,
                  },
                  {
                      title: 'Permissions',
                      description:
                          'See and toggle every permission across all roles at once',
                      href: permissionsIndex(),
                      icon: Lock,
                  },
              ]
            : []),
    ];

    return (
        <>
            <Head title="Settings" />

            <h1 className="sr-only">Settings</h1>

            <div className="grid gap-4 sm:grid-cols-2">
                {sections.map((section) => (
                    <Link key={section.title} href={section.href}>
                        <Card className="hover:bg-muted/50 h-full transition-colors">
                            <CardHeader className="flex-row items-center gap-3 space-y-0">
                                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                                    {section.icon && (
                                        <section.icon className="size-5" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <CardTitle>{section.title}</CardTitle>
                                    <CardDescription>
                                        {section.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </>
    );
}

SettingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Settings',
            href: settingsIndex(),
        },
    ],
};
