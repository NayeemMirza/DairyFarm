import {clearToken, getToken, saveToken} from "@/utils/authToken";
import Constants from 'expo-constants';
import {
    Animal,
    AnimalInfo,
    CurrentUserResponse,
    ExtendedAnimalFormData,
    LoginResponse,
    MilkingRecord, Vaccination
} from "@/types/types";
import {ExtendedNewAnimalFormData, Picture, PictureSizes} from "@/types/updatedTypes";
import {addMilkRecord} from "@/utils/milkRecordsUtils";
import {WordPressExpenseObject} from "@/types/expanceTypes";
import {CreateExpensePayload, ExpenseType} from "@/types/expance";

const baseUrl = Constants.expoConfig?.extra?.API_BASE_URL;
const apiNamespaceV1 = Constants.expoConfig?.extra?.API_NAMESPACE_V1;
const apiNamespaceV2 = Constants.expoConfig?.extra?.API_NAMESPACE_V2;
interface Stats {
    totalAnimals: number;
    lactatingAnimals: number;
    totalMilkThisMonth: number;
    totalExpensesThisMonth: number;
}

export async function loginUser({username, password}: { username: string; password: string; }): Promise<LoginResponse> {
    const url = `${baseUrl}${apiNamespaceV1}/token`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Login failed: ${text}`);
    }

    const data: LoginResponse = await response.json();
    await saveToken(data.token); // ✅ optional here, can save later
    return data; // ✅ Make sure you return the response
}

export async function logoutUser(): Promise<void> {
    try {
        const token = await getToken();
        if (!token) return;

        const url = `${baseUrl}${apiNamespaceV1}/logout`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        // Optional: handle non-OK responses
        if (!response.ok) {
            console.warn("Server logout failed");
        }

        // Clear local token regardless
        await clearToken();
    } catch (error) {
        console.error("Failed to logout:", error);
        await clearToken(); // ensure token is cleared even on error
    }
}

export async function getCurrentUser(): Promise<CurrentUserResponse | null> {
    try {
        const token = await getToken();
        if (!token) return null;
        const url = `${baseUrl}${apiNamespaceV2}/users/me`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });


        if (!response.ok) return null;

        const data = await response.json();

        if (!data?.email) return null; // check for email property

        return {
            $id: String(data.id),
            name: data.name || `${data.first_name || ""} ${data.last_name || ""}`,
            email: data.email,
            avatar: data.avatar_urls?.["96"] || "",
        };

    } catch (error) {
        console.error("Failed to get current user:", error);
        return null;
    }
}

export async function getAnimals({ filter, query, limit, }: { filter?: string; query?: string; limit?: number; } = {}): Promise<Animal[]> {
    try {
        const currentUser = await getCurrentUser(); // get logged-in user
        if (!currentUser) return [];

        const url = new URL(`${baseUrl}${apiNamespaceV2}/animals`);

        if (filter && filter !== "All") {
            url.searchParams.append("filter", filter);
        }
        if (limit) url.searchParams.append("limit", limit.toString());

        const token = await getToken();
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch animals:", response.status, response.statusText);
            return [];
        }

        let animals: Animal[] = await response.json();

        // Filter by logged-in user
        animals = animals.filter((a) => a.author === Number(currentUser.$id));

        // Extra filtering by query (name)
        if (query && query.trim() !== "") {
            const lowerQuery = query.toLowerCase();
            animals = animals.filter(
                (a) =>
                    a.acf?.name?.toLowerCase().includes(lowerQuery) ||
                    a.title?.rendered?.toLowerCase().includes(lowerQuery)
            );
        }

        // Extra filtering by special categories
        if (filter && filter !== "All") {
            const lowerFilter = filter.toLowerCase();
            animals = animals.filter((a) => {
                switch (filter) {
                    case "Pregnant":
                        return a.acf?.pregnant === true;
                    case "Dry":
                        return a.acf?.dry_cow === true;
                    case "HighMilk":
                        return Number(a.acf?.milking_capacity) > 20;
                    case "MediumMilk":
                        return Number(a.acf?.milking_capacity) > 10 && Number(a.acf?.milking_capacity) <= 20;
                    case "LowMilk":
                        return Number(a.acf?.milking_capacity) <= 10;
                    default:
                        return (
                            a.acf?.animal_type?.toLowerCase() === lowerFilter ||
                            a.acf?.breeds?.toLowerCase() === lowerFilter
                        );
                }
            });
        }

        return animals;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getLatestAnimals(params?: { limit?: number }) {
    const limit = params?.limit ?? 5;
    const animals = await getAnimals({ filter: "All" });

    const sortedAnimals = animals.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
    });

    return sortedAnimals.slice(0, limit);
}

export async function addNewAnimal(animalInfo: ExtendedNewAnimalFormData) {
    try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        // Helper: Upload single image to WordPress
        const uploadImage = async (uri: string): Promise<string> => {
            const fileName = uri.split("/").pop() || `image_${Date.now()}.jpg`;

            const formData = new FormData();
            formData.append("file", {
                uri,
                type: "image/jpeg",
                name: fileName,
            } as any);

            const response = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Image upload failed: ${errorData}`);
            }

            const data = await response.json();
            return data.source_url;
        };

        // Upload main image if exists
        let uploadedImageUrl: string | null = null;
        if (animalInfo.picture_) {
            if (typeof animalInfo.picture_ === "string") {
                uploadedImageUrl = await uploadImage(animalInfo.picture_);
            } else if ("url" in animalInfo.picture_) {
                uploadedImageUrl = animalInfo.picture_.url;
            }
        }

        // Upload gallery images if exists
        let uploadedGallery: string[] = [];
        if (animalInfo.pictures?.length > 0) {
            uploadedGallery = await Promise.all(
                animalInfo.pictures.map((uri) => uploadImage(uri))
            );
        }

        // Determine main picture
        let mainPictureUrl: string | null = uploadedImageUrl || uploadedGallery[0] || null;

        // Prepare picture_ object for WordPress
        const mainPicture: Picture | null = mainPictureUrl
            ? {
                ID: 0,
                id: 0,
                title: animalInfo.name,
                filename: mainPictureUrl.split("/").pop() || "",
                filesize: 0,
                url: mainPictureUrl,
                link: mainPictureUrl,
                alt: animalInfo.name,
                author: "",
                description: "",
                caption: "",
                name: animalInfo.name,
                status: "inherit",
                uploaded_to: 0,
                date: new Date().toISOString(),
                modified: new Date().toISOString(),
                menu_order: 0,
                mime_type: "image/jpeg",
                type: "image",
                subtype: "jpeg",
                icon: "",
                width: 0,
                height: 0,
                sizes: {} as PictureSizes,
            }
            : null;

        // Prepare payload for WordPress
        const animalData = {
            status: "publish",
            title: animalInfo.name,
            meta: { _acf_changed: true },
            acf: {
                name: animalInfo.name,
                buy_date: animalInfo.buy_date || "",
                pregnant: animalInfo.isPregnant || false,
                animal_type: animalInfo.animalType,
                color: animalInfo.color,
                breeds: animalInfo.breed,
                purchase_amount: animalInfo.purchaseAmount,
                conceive_date: animalInfo.conceive_date || "",
                milking_capacity: animalInfo.milkingCapacity,
                calving: animalInfo.calving,
                dry_cow: animalInfo.isDry || false,
                hasCalf: animalInfo.hasCalf || false,
                calfgender: animalInfo.calfgender || null,
                picture_: mainPicture,
                pictureGallery: uploadedGallery,
                calves: animalInfo.calves || [],
                milking_records_json: animalInfo.milking_records_json || undefined,
                vaccinations: animalInfo.vaccinations || undefined,
                source: animalInfo.source || "",
                calf_tag_no: animalInfo.calf_tag_no || "",
                tagno: animalInfo.tagno || "",
                parenttagno: animalInfo.parenttagno || "",
                expected_delivery_date: animalInfo.expected_delivery_date || "",
                expecteddeliverydate: animalInfo.expecteddeliverydate || "",
            },
        };
        // Send data to WordPress
        const response = await fetch(`${baseUrl}${apiNamespaceV2}/animals`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(animalData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.message || "Failed to add animal");
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error adding animal:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

export async function getAnimalById(params?: { id: string }) {
    const id = params?.id;
    if (!id) throw new Error("No animal ID provided");
    try {
        const token = await getToken();
        if (!token) {
            throw new Error("No authentication token found");
        }


        const response = await fetch(`${baseUrl}${apiNamespaceV2}/animals/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch animal details: ${response.statusText}`);
        }

        return await response.json();

    } catch (error: any) {
        console.error("Error adding animal:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

export async function updateAnimal(id: number, animalInfo: ExtendedNewAnimalFormData) {
    if (!id) throw new Error("No animal ID provided");

    try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        // Helper function for image upload
        const uploadImageToWordPress = async (uri: string): Promise<any> => {
            const fileName = uri.split("/").pop() || `image_${Date.now()}.jpg`;
            const formData = new FormData();
            formData.append("file", {
                uri,
                type: "image/jpeg",
                name: fileName,
            } as any);

            const response = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Image upload failed: ${errorData}`);
            }

            return await response.json();
        };

        // Handle main picture - upload if it's a local file
        let mainPicture: any = false;

        if (animalInfo.picture_ && typeof animalInfo.picture_ === "object") {
            const picture = animalInfo.picture_;
            if (picture.url && picture.url.startsWith("file://")) {
                // Upload local file to WordPress
                try {
                    const uploadedImage = await uploadImageToWordPress(picture.url);
                    // Replace local URI with WordPress URL in the picture object
                    mainPicture = {
                        ...picture,
                        ID: uploadedImage.id,
                        id: uploadedImage.id,
                        url: uploadedImage.source_url, // ✅ This becomes: https://inbisons.com/dfarm/wp-content/uploads/...
                        link: uploadedImage.source_url,
                        filename: uploadedImage.media_details?.file || picture.filename,
                        filesize: uploadedImage.media_details?.filesize || picture.filesize,
                        uploaded_to: id, // Set the parent post ID
                    };
                } catch (error) {
                    console.error("Failed to upload main picture:", error);
                    mainPicture = false;
                }
            } else {
                // Already a WordPress media object
                mainPicture = picture;
            }
        }

        // Handle gallery images - upload local files
        let pictureGallery: any = "";

        if (animalInfo.pictureGallery && animalInfo.pictureGallery.length > 0) {
            const galleryItems: any[] = [];

            for (const galleryItem of animalInfo.pictureGallery) {
                if (galleryItem.img_url && galleryItem.img_url.startsWith("file://")) {
                    try {
                        // Upload local gallery image to WordPress
                        const uploadedImage = await uploadImageToWordPress(galleryItem.img_url);

                        // Create WordPress media object for gallery
                        galleryItems.push({
                            ID: uploadedImage.id,
                            id: uploadedImage.id,
                            title: galleryItem.title || "Gallery Image",
                            filename: uploadedImage.media_details?.file || galleryItem.filename,
                            filesize: uploadedImage.media_details?.filesize || 0,
                            url: uploadedImage.source_url, // ✅ WordPress URL
                            link: uploadedImage.source_url,
                            alt: galleryItem.alt || "",
                            author: galleryItem.author || "",
                            description: galleryItem.description || "",
                            caption: galleryItem.caption || "",
                            name: galleryItem.name || "gallery-image",
                            status: "inherit",
                            uploaded_to: id,
                            date: new Date().toISOString(),
                            modified: new Date().toISOString(),
                            menu_order: 0,
                            mime_type: "image/jpeg",
                            type: "image",
                            subtype: "jpeg",
                            icon: uploadedImage.media_details?.sizes?.thumbnail || "",
                            width: uploadedImage.media_details?.width || 0,
                            height: uploadedImage.media_details?.height || 0,
                            sizes: uploadedImage.media_details?.sizes || {}
                        });
                    } catch (error) {
                        console.error("Failed to upload gallery image:", error);
                        // Skip this image if upload fails
                    }
                } else if (galleryItem.img_url) {
                    // Already a WordPress URL, keep as is
                    galleryItems.push(galleryItem);
                }
            }

            // Set gallery based on your ACF field type requirements
            pictureGallery = galleryItems.length > 0 ? galleryItems : "";
        }

        // Format dates to match your WordPress format (DD/MM/YYYY)
        const formatDateForWordPress = (dateString: string | undefined): string => {
            if (!dateString) return "";

            try {
                const date = new Date(dateString);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            } catch {
                return dateString;
            }
        };

        // Prepare payload
        const animalData = {
            status: "publish",
            title: animalInfo.name,
            meta: { _acf_changed: true },
            acf: {
                name: animalInfo.name,
                buy_date: animalInfo.buy_date || "",
                pregnant: animalInfo.isPregnant || false,
                animal_type: animalInfo.animalType || "",
                color: animalInfo.color || "",
                breeds: animalInfo.breed || "",
                purchase_amount: animalInfo.purchaseAmount || "",
                conceive_date: animalInfo.conceive_date || "",
                milking_capacity: animalInfo.milkingCapacity || "",
                calving: animalInfo.calving || "",
                dry_cow: animalInfo.isDry || false,
                hasCalf: animalInfo.hasCalf || false,
                calfgender: animalInfo.calfgender || "",
                picture_: mainPicture, // ✅ Now contains WordPress media object with proper URLs
                pictureGallery: pictureGallery, // ✅ Array of WordPress media objects
                calves: animalInfo.calves || [],
                milking_records_json: animalInfo.milking_records_json || "",
                vaccinations: animalInfo.vaccinations || "",
                source: animalInfo.source || "",
                calf_tag_no: animalInfo.calf_tag_no || "",
                tagno: animalInfo.tagno || "",
                parenttagno: animalInfo.parenttagno || "",
                expected_delivery_date: animalInfo.expected_delivery_date || "",
                expecteddeliverydate: animalInfo.expecteddeliverydate || "",
            },
        };
        // Call WordPress REST API to update
        const response = await fetch(`${baseUrl}${apiNamespaceV2}/animals/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(animalData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.message || "Failed to update animal");
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error updating animal:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

export async function deleteAnimal(id: number) {
    if (!id) throw new Error("No animal ID provided");

    try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${baseUrl}${apiNamespaceV2}/animals/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.message || "Failed to delete animal");
        }

        // WordPress usually returns deleted post object or {deleted: true, previous: {...}}
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error deleting animal:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

export async function addMilkProduction( animalId: number, milkData: MilkingRecord) {
    if (!animalId) throw new Error("No animal ID provided");

    try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        const formatDateForWordPress = (dateString: string | undefined): string => {
            if (!dateString) return "";
            try {
                const date = new Date(dateString);
                const day = date.getDate().toString().padStart(2, "0");
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            } catch {
                return dateString;
            }
        };

        const milkRecord: MilkingRecord = {
            date: formatDateForWordPress(milkData.date),
            yield: milkData.yield,
            time: milkData.time,
            quality: milkData.quality || "",
        };

        // Fetch current animal data
        const getResponse = await fetch(`${baseUrl}${apiNamespaceV2}/animals/${animalId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!getResponse.ok) {
            const errorData = await getResponse.json();
            throw new Error(errorData?.message || "Failed to fetch animal details");
        }

        const animalData = await getResponse.json();

        // Normalize existing records to array-of-arrays
        let currentRecords: MilkingRecord[][] = [];
        if (animalData.acf?.milking_records_json) {
            try {
                const parsed = typeof animalData.acf.milking_records_json === "string"
                    ? JSON.parse(animalData.acf.milking_records_json)
                    : animalData.acf.milking_records_json;

                currentRecords = Array.isArray(parsed[0]) ? parsed : [parsed];
            } catch {
                currentRecords = [];
            }
        }

        // Add new record safely
        const updatedRecords = addMilkRecord(currentRecords, milkRecord);

        // Update animal
        const updateResponse = await fetch(`${baseUrl}${apiNamespaceV2}/animals/${animalId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                meta: { _acf_changed: true },
                acf: {
                    milking_records_json: JSON.stringify(updatedRecords),
                },
            }),
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData?.message || "Failed to add milk production record");
        }

        return await updateResponse.json();
    } catch (error: any) {
        console.error("Error adding milk production:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

export async function addVaccination(animalId: number, vaccination: Vaccination) {
    if (!animalId) throw new Error("No animal ID provided");

    try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        // Format date into DD/MM/YYYY for WordPress
        const formatDateForWordPress = (date: Date): string => {
            try {
                const day = date.getDate().toString().padStart(2, "0");
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            } catch {
                return "";
            }
        };

        const vaccinationRecord = {
            vaccine: vaccination.vaccine,
            date: formatDateForWordPress(new Date(vaccination.date)),
            nextDueDate: vaccination.nextDueDate
                ? formatDateForWordPress(new Date(vaccination.nextDueDate))
                : "",
            notes: vaccination.notes,
            cost: vaccination.cost,
        };

        // Fetch current animal data
        const getResponse = await fetch(`${baseUrl}${apiNamespaceV2}/animals/${animalId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!getResponse.ok) {
            const errorData = await getResponse.json();
            throw new Error(errorData?.message || "Failed to fetch animal details");
        }

        const animalData = await getResponse.json();

        // Normalize existing records
        let currentRecords: Vaccination[] = [];
        if (animalData.acf?.vaccinations) {
            try {
                const parsed = typeof animalData.acf.vaccinations === "string"
                    ? JSON.parse(animalData.acf.vaccinations)
                    : animalData.acf.vaccinations;

                currentRecords = Array.isArray(parsed) ? parsed : [];
            } catch {
                currentRecords = [];
            }
        }

        // Add new record
        const updatedRecords = [...currentRecords, vaccinationRecord];

        // Update animal
        const updateResponse = await fetch(`${baseUrl}${apiNamespaceV2}/animals/${animalId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                meta: { _acf_changed: true },
                acf: {
                    vaccinations: JSON.stringify(updatedRecords), // ✅ correct key
                },
            }),
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData?.message || "Failed to add vaccination record");
        }

        return await updateResponse.json();
    } catch (error: any) {
        console.error("Error adding vaccination:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

export function mapWordPressExpenseToApp(e: any): ExpenseType {
    const validCategories = ["Feed", "Medicine", "Equipment", "Labor", "Utilities", "Maintenance", "Transport", "Other"] as const;

    const category = validCategories.includes(e.acf?.category)
        ? (e.acf?.category as ExpenseType["category"])
        : "Other";

    // Parse the date, fallback to raw date string
    let parsedDate = e.date;
    if (e.acf?.date) {
        try {
            parsedDate = new Date(e.acf.date).toISOString().split("T")[0]; // yyyy-MM-dd
        } catch {}
    }

    return {
        id: e.id.toString(),
        date: parsedDate,
        category,
        description: e.acf?.description || "",
        amount: Number(e.acf?.amount || 0),
        vendor: e.acf?.vendor || "",
        payment_method: e.acf?.payment_method || "",
        receipt_number: e.acf?.receipt_number || "",
        notes: e.acf?.notes || "",
    };
}

export async function getUserStats(): Promise<Stats> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return {
            totalAnimals: 0,
            lactatingAnimals: 0,
            totalMilkThisMonth: 0,
            totalExpensesThisMonth: 0,
        };

        const animals = await getAnimals();


        const totalAnimals = animals.length;

        const lactatingAnimals = animals.filter((a) => {
            const capacity = Number(a.acf?.milking_capacity) || 0;
            const isDry = String(a.acf?.dry_cow) === "true"; // normalize
            return capacity > 0 && !isDry;
        }).length;

        const now = new Date();
        const currentMonth = now.getMonth() + 1; // JS month is 0-indexed
        const currentYear = now.getFullYear();

        const totalMilkThisMonth = animals.reduce((sum, a) => {
            if (!a.acf?.milking_records_json) return sum;
            let records;
            try {
                records = JSON.parse(a.acf.milking_records_json);
            } catch {
                return sum;
            }
            const monthlySum = records.reduce((s: number, r: any) => {
                if (!r.date) return s;
                const [day, month, year] = r.date.split("/").map(Number);
                const date = new Date(year, month - 1, day);
                if (
                    date.getMonth() + 1 === currentMonth &&
                    date.getFullYear() === currentYear
                ) {
                    return s + Number(r.yield || 0);
                }
                return s;
            }, 0);

            return sum + monthlySum;
        }, 0);

        const allExpenses = await getExpenses();
        const totalExpensesThisMonth = allExpenses
            .filter(e => Number(e.author) === Number(currentUser.$id))
            .reduce((sum, e) => {
                const date = new Date(e.date);
                if (date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear) {
                    return sum + Number(e.acf?.amount || 0);
                }
                return sum;
            }, 0);


        return {
            totalAnimals,
            lactatingAnimals,
            totalMilkThisMonth,
            totalExpensesThisMonth,
        };
    } catch (error) {
        console.error("Failed to fetch user stats:", error);
        return {
            totalAnimals: 0,
            lactatingAnimals: 0,
            totalMilkThisMonth: 0,
            totalExpensesThisMonth: 0,
        };
    }
}

export async function getExpenses(): Promise<WordPressExpenseObject[]> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return [];

        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        const url = new URL(`${baseUrl}${apiNamespaceV2}/expenses`);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: WordPressExpenseObject[] = await response.json();

        // Filter only current user's expenses
        const userExpenses = data.filter(
            (expense) => Number(expense.author) === Number(currentUser.$id)
        );


        return userExpenses;

    } catch (error: any) {
        console.error("Error fetching user expenses:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

export async function addExpense(payload: CreateExpensePayload): Promise<WordPressExpenseObject> {
    try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        const url = `${baseUrl}${apiNamespaceV2}/expenses`;

        const body = {
            title: payload.description || "Expense",
            status: "publish",
            acf: {
                date: payload.date,
                category: payload.category,
                description: payload.description,
                amount: payload.amount.toString(),
                vendor: payload.vendor || "",
                payment_method: payload.payment_method || "",
                receipt_number: payload.receipt_number || "",
                notes: payload.notes || "",
            },
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error(`Failed to add expense: ${response.status}`);

        const data: WordPressExpenseObject = await response.json();
        return data;
    } catch (error: any) {
        console.error("Error adding expense:", error);
        throw new Error(error.message || "Unexpected error adding expense");
    }
}

export async function updateExpense(expense: ExpenseType) {
    const token = await getToken(); // JWT or App Password
    if (!token) throw new Error("No authentication token found");

    if (!expense.id) throw new Error("Expense ID is required for update");

    const url = `${baseUrl}${apiNamespaceV2}/expenses/${expense.id}`;

    const body = {
        title: expense.description || "Expense",
        status: "publish",
        acf: {
            date: expense.date,
            category: expense.category,
            description: expense.description,
            amount: expense.amount.toString(),
            vendor: expense.vendor,
            payment_method: expense.payment_method,
            receipt_number: expense.receipt_number,
            notes: expense.notes,
        }
        // author field usually does not need to be updated
    };

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(`Failed to update expense: ${res.status}`);
    }

    return await res.json();
}

export async function deleteExpense(expenseId: string) {
    try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

        const url = `${baseUrl}${apiNamespaceV2}/expenses/${expenseId}`;

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete expense. Status: ${response.status}`);
        }

        return true; // Successfully deleted
    } catch (error: any) {
        console.error("Error deleting expense:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}