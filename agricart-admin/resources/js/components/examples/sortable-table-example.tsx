import React from 'react';
import { SortableTable, ColumnDefinition } from '@/components/ui/sortable-table';
import { TableRow, TableCell } from '@/components/ui/table';

// Example data structure
interface ExampleData {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

// Example usage component
export function SortableTableExample() {
    const sampleData: ExampleData[] = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", created_at: "2024-01-15" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", created_at: "2024-01-20" },
        { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Moderator", created_at: "2024-01-10" },
    ];

    const columns: ColumnDefinition[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
        { key: 'created_at', label: 'Created', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
    ];

    const handleSort = (column: string, direction: 'asc' | 'desc' | null) => {
        console.log(`Sorting by ${column} in ${direction} direction`);
        // Here you would typically make an API call or update local state
    };

    const renderRow = (item: ExampleData, index: number) => (
        <TableRow key={item.id}>
            <TableCell>{item.id}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>{item.role}</TableCell>
            <TableCell>{item.created_at}</TableCell>
            <TableCell>
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </TableCell>
        </TableRow>
    );

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Sortable Table Example</h2>
            <SortableTable
                data={sampleData}
                columns={columns}
                onSort={handleSort}
                renderRow={renderRow}
                emptyMessage="No users found"
            />
        </div>
    );
}