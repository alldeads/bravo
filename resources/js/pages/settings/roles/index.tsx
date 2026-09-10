import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import RolesController from '@/actions/App/Http/Controllers/Settings/RolesController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as permissionsIndex } from '@/routes/permissions';
import { edit, index } from '@/routes/roles';
import { index as settingsIndex } from '@/routes/settings';

type Role = {
    id: number;
    name: string;
    users_count: number;
};

export default function RolesIndex({ roles }: { roles: Role[] }) {
    const [newRoleOpen, setNewRoleOpen] = useState(false);

    return (
        <>
            <Head title="Roles" />

            <h1 className="sr-only">Roles</h1>

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Roles"
                        description="Create roles and see who has each one"
                    />

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={permissionsIndex()}>
                                View permissions matrix
                            </Link>
                        </Button>

                        <Dialog
                            open={newRoleOpen}
                            onOpenChange={setNewRoleOpen}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm">New role</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>Add a new role</DialogTitle>
                                <DialogDescription>
                                    Give the role a name, then attach
                                    permissions to it from its edit page.
                                </DialogDescription>

                                <Form
                                    {...RolesController.store.form()}
                                    options={{ preserveScroll: true }}
                                    onSuccess={() => setNewRoleOpen(false)}
                                    resetOnSuccess
                                    className="space-y-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">
                                                    Role name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    placeholder="e.g. editor"
                                                    autoFocus
                                                />
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>

                                            <DialogFooter className="gap-2">
                                                <DialogClose asChild>
                                                    <Button variant="secondary">
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    Create role
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-center">
                                    Users
                                </TableHead>
                                <TableHead className="w-0" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium capitalize">
                                        {role.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {role.users_count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={edit(role.id)}>
                                                Edit
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

RolesIndex.layout = {
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
