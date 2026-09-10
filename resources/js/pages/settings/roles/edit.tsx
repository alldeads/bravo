import { Form, Head, router } from '@inertiajs/react';
import { Fragment, useState } from 'react';
import RolesController from '@/actions/App/Http/Controllers/Settings/RolesController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/roles';
import { update as updatePermission } from '@/routes/roles/permissions';
import { index as settingsIndex } from '@/routes/settings';

type Role = {
    id: number;
    name: string;
    users_count: number;
};

type Permission = {
    id: number;
    name: string;
    label: string;
    attached: boolean;
};

type PermissionGroup = {
    module: string;
    label: string;
    permissions: Permission[];
};

export default function RolesEdit({
    role,
    permissionGroups,
}: {
    role: Role;
    permissionGroups: PermissionGroup[];
}) {
    const [pending, setPending] = useState<Set<number>>(new Set());

    const toggle = (permission: Permission, attached: boolean) => {
        setPending((current) => new Set(current).add(permission.id));

        router.put(
            updatePermission.url({ role: role.id, permission: permission.id }),
            { attached },
            {
                preserveScroll: true,
                onFinish: () =>
                    setPending((current) => {
                        const next = new Set(current);
                        next.delete(permission.id);
                        return next;
                    }),
            },
        );
    };

    return (
        <>
            <Head title={`Edit role: ${role.name}`} />

            <h1 className="sr-only">Edit role: {role.name}</h1>

            <div className="space-y-8">
                <div>
                    <Heading
                        variant="small"
                        title="Rename role"
                        description={`${role.users_count} ${role.users_count === 1 ? 'user has' : 'users have'} this role`}
                    />

                    <Form
                        {...RolesController.update.form(role.id)}
                        options={{ preserveScroll: true }}
                        resetOnError
                        className="mt-4 flex items-start gap-2"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="sr-only">
                                        Role name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={role.name}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Save
                                </Button>
                            </>
                        )}
                    </Form>
                </div>

                <div>
                    <Heading
                        variant="small"
                        title="Permissions"
                        description="Toggle which permissions this role has"
                    />

                    <div className="mt-4 overflow-hidden rounded-lg border">
                        {permissionGroups.map((group) => (
                            <Fragment key={group.module}>
                                <div className="bg-muted/50 border-b px-4 py-2 text-sm font-semibold last:border-b-0">
                                    {group.label}
                                </div>
                                {group.permissions.map((permission) => (
                                    <label
                                        key={permission.id}
                                        htmlFor={`permission-${permission.id}`}
                                        className="hover:bg-muted/30 flex cursor-pointer items-center justify-between border-b px-4 py-3 text-sm last:border-b-0"
                                    >
                                        {permission.label}
                                        <Checkbox
                                            id={`permission-${permission.id}`}
                                            checked={permission.attached}
                                            disabled={pending.has(
                                                permission.id,
                                            )}
                                            onCheckedChange={(checked) =>
                                                toggle(
                                                    permission,
                                                    checked === true,
                                                )
                                            }
                                        />
                                    </label>
                                ))}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

RolesEdit.layout = {
    breadcrumbs: [
        {
            title: 'Settings',
            href: settingsIndex(),
        },
        {
            title: 'Roles',
            href: index(),
        },
    ],
};
