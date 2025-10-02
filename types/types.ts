export type ResponseData<T> = {
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
    meta: Record<string, any>;
    class_list: string[];
    acf?: T | null,
    _links: {
        self: { href: string; targetHints?: { allow: string[] } }[];
        collection: { href: string }[];
        about: { href: string }[];
        "wp:attachment": { href: string }[];
        curies: { name: string; href: string; templated: boolean }[];
    };

}
export interface Animal {
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
    meta: Record<string, any>;
    class_list: string[];
    acf?: {
        name?: string;
        buy_date?: string;
        pregnant?: boolean;
        color?: string;
        breeds?: string;
        purchase_amount?: string;
        conceive_date?: string;
        milking_capacity?: string;
        milking_records_json?: string;
        picture_?: {
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
            sizes: {
                [key: string]: string | number;
            };
        };
        dry_cow?: boolean;
        animal_type?: string;
        expected_delivery_date?: string;
        hasCalf?: boolean;
        calf_tag_no?: string;
        tagno?: string;
        source?: string;
        expecteddeliverydate?: string;
        calfgender?: string;
        parenttagno?: string;
        calving?: string;
        medicalHistory?: string;
        vaccinations?: string;
        pictureGallery?: string[];
    };
    _links: {
        self: { href: string; targetHints?: { allow: string[] } }[];
        collection: { href: string }[];
        about: { href: string }[];
        "wp:attachment": { href: string }[];
        curies: { name: string; href: string; templated: boolean }[];
    };
}

export interface MilkingRecord {
    date: string;
    yield: string;
    time: string;
    quality?: string;
    animalType?: string | undefined;
    animalId?: string | number | null;
}

export interface Vaccination {
    date: string;
    vaccine: string;
    nextDueDate?: string;
    notes?: string;
    cost?: string;
    animalType?: string | undefined;
    animalId?: string | number | null;
}
export interface AnimalCardObject {
    id?: number;
    name?: string;
    breeds?: string;
    buy_date?: string;
    color?: string;
    pregnant?: boolean;
    purchase_amount?: string;
    milking_capacity?: string;
    picture_url?: string;
    medicalHistory?: string | null;
    milking_records?: MilkingRecord[];
    vaccinations?: Vaccination[];
    link?: string;
    pictureGallery: string[];
}

export interface LoginResponse {
    token: string;
    user_email: string;
    user_nicename: string;
    user_display_name: string;
    profile_picture?: string;
    user_can?: Record<string, boolean>;
}
export interface CurrentUserResponse {
    $id: string;
    name: string;
    email: string;
    avatar: string;
}

export interface AnimalFormData {
    name: string;
    color?: string;
    breed?: string;
    milkingCapacity?: string;
    purchaseDate?: Date;
    purchaseAmount?: string;
    animalType?: string;
    calving?: string;           // Optional to avoid TS errors
    isPregnant?: boolean;
    isDry?: boolean;
    conceiveDate?: Date;
    hasCalf?: boolean;
    calfGender?: string;
    image?: string;
}

// Extended form data with additional fields
export interface ExtendedAnimalFormData extends AnimalFormData {
    pictures?: string[];              // multiple images
    calves?: {
        tagNo?: string;
        gender?: string;
    }[];
    milkingRecords?: MilkingRecord[];
    vaccinations?: Vaccination[];
    pictureGallery?: string[];

    // Original fields from WP or API
    buy_date?: string;
    pregnant?: boolean;
    purchase_amount?: string;
    milking_capacity?: string;
    picture_url?: string;
    medicalHistory?: string | null;
    milking_records_json?: string;
    vaccinations_json?: string;
    pictureGallery_json?: string;
    calves_json?: string;
    conceive_date?: string;
    calf_tag_no?: string;
    calf_gender?: string;
    parent_tag_no?: string;
    sire_tag_no?: string;
    expected_delivery_date?: string;
    picture_id?: number;
    picture_filename?: string;
    dry_cow?: boolean;
    animal_type?: string;
    breeds?: string;
}



export interface AnimalInfo {
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
}

export interface GalleryImage {
    img_url: string;
}