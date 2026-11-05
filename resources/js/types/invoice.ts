export type InvoiceItem = {
    product_id: number | null;
    code: string;
    size: string | null;
    quantity: number | string;
    unit: string;
    description: string;
    remarks: string | null;
};

export type InvoiceSection = {
    title: string;
    note: string | null;
    items: InvoiceItem[];
};

export type InvoiceFormData = {
    number: string;
    invoice_date: string;
    customer: string;
    customer_details: string | null;
    delivery_terms: string | null;
    sections: InvoiceSection[];
};

export type Invoice = InvoiceFormData & {
    id: number;
    total_quantity: number;
};

export type InvoiceProductOption = {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    unit: string;
};

export type InvoiceCompany = {
    name: string;
    address: string;
    phone: string;
    whatsapp: string;
};
