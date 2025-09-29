import { Stack } from "expo-router";

export default function AnimalLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // your [id].tsx already has custom header

            }}
        />
    );
}