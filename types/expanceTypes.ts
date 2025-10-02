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
    author: number;
    featured_media: number;
    template: string;
    meta: {
        _acf_changed: boolean;
        inline_featured_image: boolean;
    };
    class_list: string[];
    acf: {
        date: string;
        category: string;
        description: string;
        amount: string; // stored as string in WP ACF
        vendor: string;
        payment_method: string;
        receipt_number: string;
        notes: string;
    };
    author_name: string;
    _links: {
        self: {
            href: string;
            targetHints?: {
                allow: string[];
            };
        }[];
        collection: {
            href: string;
        }[];
        about: {
            href: string;
        }[];
        author: {
            embeddable: boolean;
            href: string;
        }[];
        "wp:attachment": {
            href: string;
        }[];
        curies: {
            name: string;
            href: string;
            templated: boolean;
        }[];
    };
}
