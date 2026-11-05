<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Issuing Company
    |--------------------------------------------------------------------------
    |
    | Printed in the header of every proforma invoice.
    |
    */

    'company' => [
        'name' => env('INVOICE_COMPANY_NAME', 'BRAVO WORLD INC.'),
        'address' => env('INVOICE_COMPANY_ADDRESS', '246-1 Englis V. Rama Ave.'),
        'phone' => env('INVOICE_COMPANY_PHONE', '+63-32-2364891'),
        'whatsapp' => env('INVOICE_COMPANY_WHATSAPP', '+63 917 178-3057'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Numbering & Defaults
    |--------------------------------------------------------------------------
    |
    | New invoices are pre-filled with the next number in this series
    | (e.g. BYR-D-004 → BYR-D-005) and the default delivery terms.
    |
    */

    'number_prefix' => env('INVOICE_NUMBER_PREFIX', 'BYR-D-'),

    'number_padding' => 3,

    'default_delivery_terms' => '~75 Days',

];
