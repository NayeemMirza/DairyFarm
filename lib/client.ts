import {getToken} from "@/utils/authToken";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = await getToken();

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API error: ${response.status} - ${text}`);
    }

    return response.json();
}