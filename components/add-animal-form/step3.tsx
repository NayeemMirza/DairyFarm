import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { ExtendedNewAnimalFormData } from "@/types/updatedTypes";

interface Step3PregnancyInfoProps {
    formData: ExtendedNewAnimalFormData;
    setFormData: React.Dispatch<React.SetStateAction<ExtendedNewAnimalFormData>>;
    errors: { [key: string]: string };
    showDatePicker: (field: keyof ExtendedNewAnimalFormData) => void;
}

const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function Step3PregnancyInfo({
                                               formData,
                                               setFormData,
                                               errors,
                                               showDatePicker,
                                           }: Step3PregnancyInfoProps) {
    const togglePregnant = () => {
        setFormData((prev) => ({
            ...prev,
            isPregnant: !prev.isPregnant,
            conceive_date: !prev.isPregnant
                ? new Date().toISOString().split("T")[0]
                : undefined,
        }));
    };

    const toggleDry = () => {
        setFormData((prev) => ({
            ...prev,
            isDry: !prev.isDry,
            dry_date: !prev.isDry
                ? new Date().toISOString().split("T")[0]
                : undefined,
        }));
    };

    return (
        <View className="space-y-4 gap-3">
            {/* Pregnant */}
            <TouchableOpacity
                onPress={togglePregnant}
                className="border border-gray-300 flex-row justify-between items-center bg-white rounded-xl px-4 py-4"
            >
                <Text className="text-gray-700 font-rubik-medium">Pregnant</Text>
                <View
                    className={`px-3 py-1 rounded-full ${
                        formData.isPregnant ? "bg-green-100" : "bg-red-100"
                    }`}
                >
                    <Text
                        className={`font-rubik font-medium ${
                            formData.isPregnant ? "text-green-700" : "text-red-600"
                        }`}
                    >
                        {formData.isPregnant ? "✔ Yes" : "✕ No"}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Conceive Date (only if Pregnant) */}
            {formData.isPregnant && (
                <TouchableOpacity
                    onPress={() => showDatePicker("conceive_date")}
                    className="border border-gray-300 flex-row justify-between items-center bg-white rounded-xl px-4 py-4"
                >
                    <Text className="text-gray-700 font-rubik-medium">Conceive Date</Text>
                    <Text
                        className={`font-rubik font-medium ${
                            formData.conceive_date ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                        {formData.conceive_date
                            ? formatDisplayDate(formData.conceive_date)
                            : "Add Conceive Date"}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Dry */}
            <TouchableOpacity
                onPress={toggleDry}
                className="border border-gray-300 flex-row justify-between items-center bg-white rounded-xl px-4 py-4"
            >
                <Text className="text-gray-700 font-rubik-medium">Dry</Text>
                <View
                    className={`px-3 py-1 rounded-full ${
                        formData.isDry ? "bg-green-100" : "bg-red-100"
                    }`}
                >
                    <Text
                        className={`font-rubik font-medium ${
                            formData.isDry ? "text-green-700" : "text-red-600"
                        }`}
                    >
                        {formData.isDry ? "✔ Yes" : "✕ No"}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}
