export interface AnimalObject {
    id: number;
    title: { rendered: string };
    slug: string;
    status: string;
    type: string;
    date: string;
    date_gmt: string;
    modified: string;
    modified_gmt: string;
    link: string;
    content: {
        rendered: string;
        protected: boolean;
    };
    acf: {
        // Image field
        picture_?: number | string | null; // WordPress image ID or URL

        // Text fields
        name: string;
        color?: string;
        breeds?: string;
        source?: string;
        calf_tag_no?: string;
        tagno?: string;
        calfgender?: string;
        parenttagno?: string;

        // Date fields
        buy_date?: string; // Date in "dd/MM/yyyy" or "yyyy-MM-dd" format
        conceive_date?: string;
        expected_delivery_date?: string;
        expecteddeliverydate?: string;

        // Number fields
        purchase_amount?: string; // Stored as string but represents number
        milking_capacity?: number;
        calving?: number;

        // True/False fields
        pregnant?: boolean;
        dry_cow?: boolean;
        hasCalf?: boolean;

        // Text Area fields (JSON strings)
        milking_records_json?: string;
        medicalHistory?: string;
        vaccinations?: string;
        pictureGallery?: string;

        // Radio Button field
        animal_type?: string;
    };
    // WordPress metadata
    meta?: {
        _acf_changed: boolean;
        inline_featured_image: boolean;
    };
    featured_media?: number;
    guid?: {
        rendered: string;
    };
    class_list?: string[];
    _links?: {
        about: Array<{ href: string }>;
        collection: Array<{ href: string }>;
        curies: Array<{ href: string }>;
        self: Array<{ href: string }>;
        "wp:attachment": Array<{ href: string }>;
    };
}

// Additional interfaces for parsed JSON data
export interface MilkingRecord {
    date: string;
    yield: string;
    time: string;
    quality?: string;
}

export interface VaccinationRecord {
    date: string;
    vaccine: string;
    nextDueDate: string;
    notes: string;
    cost: string;
}

export interface PictureGalleryItem {
    img_url: string;
}


export interface ExtendedNewAnimalFormData {
    id?: number;
    name: string;
    color: string;
    breed: string;
    milkingCapacity: string;
    buy_date: string | null;
    purchaseAmount: string;
    animalType: string;
    calving: string;
    isPregnant: boolean;
    isDry: boolean;
    hasCalf: boolean;
    pictures: any[];
    calves: any[];
    pictureGallery: any[];
    milk_quantity: string;
    // Additional ACF fields
    source?: string;
    calf_tag_no?: string;
    tagno?: string;
    calfgender?: string;
    parenttagno?: string;
    conceive_date?: string | null;
    expected_delivery_date?: string | null;
    expecteddeliverydate?: string | null;
    milking_records_json?: string;
    medicalHistory?: string;
    vaccinations?: string;
    picture_: Picture | string;
}
export interface Picture {
    ID: number;
    id: number;
    title: string;
    filename: string;
    filesize: number;
    url: string;
    link: string;
    alt: string;
    author: string;
    description: string;
    caption: string;
    name: string;
    status: string;
    uploaded_to: number;
    date: string;
    modified: string;
    menu_order: number;
    mime_type: string;
    type: string;
    subtype: string;
    icon: string;
    width: number;
    height: number;
    sizes: PictureSizes;
}

export interface PictureSizes {
    thumbnail: string;
    "thumbnail-width": number;
    "thumbnail-height": number;
    medium: string;
    "medium-width": number;
    "medium-height": number;
    medium_large: string;
    "medium_large-width": number;
    "medium_large-height": number;
    large: string;
    "large-width": number;
    "large-height": number;
    "1536x1536": string;
    "1536x1536-width": number;
    "1536x1536-height": number;
    "2048x2048": string;
    "2048x2048-width": number;
    "2048x2048-height": number;
}
