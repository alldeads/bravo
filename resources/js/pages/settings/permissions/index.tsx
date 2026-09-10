import { Head, Link, router } from '@inertiajs/react';
import { Fragment, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index } from '@/routes/permissions';
import { index as rolesIndex } from '@/routes/roles';
import { update as updatePermission } from '@/routes/roles/permissions';
import { index as settingsIndex } from '@/routes/settings';

type Role = {
    id: number;
    name: string;
};

type Permission = {
    id: number;
    name: string;
    label: string;
    roles: string[];
};

type PermissionGroup = {
    module: string;
    label: string;
    permissions: Permission[];
};

export default function PermissionsIndex({
    roles,
    permissionGroups,
}: {
    roles: Role[];
    permissionGroups: PermissionGroup[];
}) {
    const [pending, setPending] = useState<Set<string>>(new Set());

    const toggle = (role: Role, permission: Permission, attached: boolean) => {
        const key = `${role.id}-${permission.id}`;
        setPending((current) => new Set(current).add(key));

        router.put(
            updatePermission.url({ role: role.id, permission: permission.id }),
            { attached },
            {
                preserveScroll: true,
                onFinish: () =>
                    setPending((current) => {
                        const next = new Set(current);
                        next.delete(key);
                        return next;
                    }),
            },
        );
    };

    return (
        <>
            <Head title="Permissions" />

            <h1 className="sr-only">Permissions</h1>

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Permissions"
                        description="See and toggle every permission across all roles at once"
                    />

                    <Button variant="outline" size="sm" asChild>
                        <Link href={rolesIndex()}>Manage roles</Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Permission</TableHead>
                                {roles.map((role) => (
                                    <TableHead
                                        key={role.id}
                                        className="text-center capitalize"
                                    >
                                        {role.name}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissionGroups.map((group) => (
                                <Fragment key={group.module}>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableCell
                                            colSpan={roles.length + 1}
                                            className="font-semibold"
                                        >
                                            {group.label}
                                        </TableCell>
                                    </TableRow>
                                    {group.permissions.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell className="text-muted-foreground pl-6">
                                                {permission.label}
                                            </TableCell>
                                            {roles.map((role) => {
                                                const key = `${role.id}-${permission.id}`;

                                                return (
                                                    <TableCell
                                                        key={role.id}
                                                        className="text-center"
                                                    >
                                                        <Checkbox
                                                            checked={permission.roles.includes(
                                                                role.name,
                                                            )}
                                                            disabled={pending.has(
                                                                key,
                                                            )}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                toggle(
                                                                    role,
                                                                    permission,
                                                                    checked ===
                                                                        true,
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

PermissionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Settings',
            href: settingsIndex(),
        },
        {
            title: 'Permissions',
            href: index(),
        },
    ],
};
