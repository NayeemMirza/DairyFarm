import { GalleryImage, MilkingRecord, Vaccination } from "@/types/types";
import { AnimalObject, ExtendedNewAnimalFormData, Picture } from "@/types/updatedTypes";
import Constants from "expo-constants";

/** Format expected delivery date by adding 283 days to the conceive date */
export const getFormattedExpectedDeliveryDate = (conceiveDate: string) => {
    const [day, month, year] = conceiveDate.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    const conceive = new Date(formattedDate);

    if (isNaN(conceive.getTime())) return 'Invalid Date';

    conceive.setDate(conceive.getDate() + 283);

    return conceive.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/** Format a given date string into "MMM dd, yyyy" */
export const formatDate = (dateString: string) => {
    if (!dateString) return 'Not purchased';

    try {
        const date = dateString.includes('/')
            ? new Date(dateString.split('/').reverse().join('-'))
            : new Date(dateString);

        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return 'Invalid date';
    }
};

/** Calculate expected dry date by adding 212 days to conceive date */
export const getFormattedExpectedDryDate = (conceiveDate: string) => {
    const [day, month, year] = conceiveDate.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    const conceive = new Date(formattedDate);

    if (isNaN(conceive.getTime())) return 'Invalid Date';

    conceive.setDate(conceive.getDate() + 212);

    return conceive.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/** Parse milking records stored as JSON strings */
export const parseMilkingRecords = (jsonString: string): MilkingRecord[] => {
    try {
        const cleanedString = jsonString.replace(/\\r\\n/g, '').replace(/\s+/g, '').replace(/^"+|"+$/g, '');
        if (cleanedString.startsWith('[[')) return JSON.parse(cleanedString);

        const fixedString = cleanedString.replace(/\]\,\[/g, '],[').replace(/\],$/g, ']');
        return JSON.parse(`[${fixedString}]`);
    } catch {
        return [];
    }
};

/** Parse vaccination records safely */
export const parseVaccinationRecords = (vaccinationsData: string | Vaccination[]): Vaccination[] => {
    if (Array.isArray(vaccinationsData)) return vaccinationsData;

    if (typeof vaccinationsData === 'string') {
        try {
            const parsed = JSON.parse(vaccinationsData);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
};

/** Parse gallery JSON string into array of GalleryImage */
export const formatGallery = (galleryString: string): GalleryImage[] => {
    try {
        const parsed = JSON.parse(galleryString);
        if (Array.isArray(parsed)) return parsed.filter(item => typeof item.img_url === 'string');
        return [];
    } catch {
        return [];
    }
};

/** Calculate pregnancy duration in months and days */
export const getPregnancyDuration = (conceiveDate: string) => {
    const [day, month, year] = conceiveDate.split('/');
    const startDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();

    if (isNaN(startDate.getTime())) return { months: 'Invalid', days: 'Invalid' };

    const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;

    return { months, days };
};

/** Safely parse AnimalObject into ExtendedNewAnimalFormData */
export const parseAnimalToFormData = (animal: AnimalObject): ExtendedNewAnimalFormData => {
    return {
        id: animal.id,
        name: animal.acf.name || "",
        color: animal.acf.color || "",
        breed: animal.acf.breeds || "",
        milkingCapacity: animal.acf.milking_capacity?.toString() || "",
        purchaseDate: animal.acf.buy_date ? new Date(animal.acf.buy_date) : new Date(),
        purchaseAmount: animal.acf.purchase_amount || "",
        animalType: animal.acf.animal_type || "",
        calving: animal.acf.calving?.toString() || "",
        isPregnant: animal.acf.pregnant || false,
        isDry: animal.acf.dry_cow || false,
        hasCalf: animal.acf.hasCalf || false,
        buy_date:animal.acf.buy_date || null,
        pictures: [],
        calves: [],
        pictureGallery: (() => {
            try {
                return animal.acf.pictureGallery ? JSON.parse(animal.acf.pictureGallery) : [];
            } catch {
                return [];
            }
        })(),

        source: animal.acf.source,
        calf_tag_no: animal.acf.calf_tag_no,
        tagno: animal.acf.tagno,
        calfgender: animal.acf.calfgender,
        parenttagno: animal.acf.parenttagno,
        conceive_date: animal.acf.conceive_date ? new Date(animal.acf.conceive_date) : undefined,
        expected_delivery_date: animal.acf.expected_delivery_date ? new Date(animal.acf.expected_delivery_date) : undefined,
        expecteddeliverydate: animal.acf.expecteddeliverydate ? new Date(animal.acf.expecteddeliverydate) : undefined,
        milking_records_json: animal.acf.milking_records_json,
        medicalHistory: animal.acf.medicalHistory,
        vaccinations: animal.acf.vaccinations,

        picture_: (() => {
            if (animal.acf.picture_ && typeof animal.acf.picture_ === "object") {
                return animal.acf.picture_ as Picture;
            }

            if (typeof animal.acf.picture_ === "string") {
                return {
                    ID: 0,
                    id: 0,
                    title: "",
                    filename: "",
                    filesize: 0,
                    url: animal.acf.picture_,
                    link: animal.acf.picture_,
                    alt: "",
                    author: "",
                    description: "",
                    caption: "",
                    name: "",
                    status: "",
                    uploaded_to: 0,
                    date: "",
                    modified: "",
                    menu_order: 0,
                    mime_type: "image/jpeg",
                    type: "image",
                    subtype: "jpeg",
                    icon: "",
                    width: 0,
                    height: 0,
                    sizes: {} as any,
                };
            }

            return {
                ID: 0,
                id: 0,
                title: "",
                filename: "",
                filesize: 0,
                url: "",
                link: "",
                alt: "",
                author: "",
                description: "",
                caption: "",
                name: "",
                status: "",
                uploaded_to: 0,
                date: "",
                modified: "",
                menu_order: 0,
                mime_type: "image/jpeg",
                type: "image",
                subtype: "jpeg",
                icon: "",
                width: 0,
                height: 0,
                sizes: {} as any,
            };
        })(),
    };
};


export const getDateValue = (
    field: keyof ExtendedNewAnimalFormData | null,
    formData: ExtendedNewAnimalFormData
): Date => {
    if (!field) return new Date();

    const value = formData[field];

    // Only attempt conversion if value is Date or string
    if (value instanceof Date) {
        return value;
    } else if (typeof value === "string" && value) {
        const date = new Date(value);
        return isNaN(date.getTime()) ? new Date() : date;
    }

    // Fallback for undefined or invalid types
    return new Date();
};


export const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
};



