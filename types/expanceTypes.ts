export interface WordPressExpenseObject {
    id: number;
    date: string;
    date_gmt: string;
    guid: {
        rendered: string;
    };
    modified: string;
    modified_gmt: string;
    slug: string;
    status: string;
    type: string;
    link: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
        protected: boolean;
    };
    featured_media: number;
    template: string;
    class_list: string[];
    acf: ExpenseACFFields;
    _links: WordPressLinks;
}

export interface ExpenseACFFields {
    date: string; // "September 9, 2025" - you might want to change format to YYYY-MM-DD in WordPress
    category: "Feed" | "Medicine" | "Equipment" | "Labor" | "Utilities" | "Maintenance" | "Transport" | "Other";
    description: string;
    amount: string; // WordPress returns this as string "1500.00"
    vendor?: string;
    payment_method?: "Cash" | "Bank Transfer" | "Credit Card" | "Check";
    receipt_number?: string;
    notes?: string;
}

export interface WordPressLinks {
    self: Array<{
        href: string;
        targetHints?: {
            allow: string[];
        };
    }>;
    collection: Array<{
        href: string;
    }>;
    about: Array<{
        href: string;
    }>;
    "wp:attachment": Array<{
        href: string;
    }>;
    curies: Array<{
        name: string;
        href: string;
        templated: boolean;
    }>;
}