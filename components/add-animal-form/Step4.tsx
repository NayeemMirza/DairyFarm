import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import Dropdown from "@/components/dropdown";
import CustomInput from "@/components/CustomInput";
import { calfGenderList } from "@/constants/data";
import { ExtendedNewAnimalFormData } from "@/types/updatedTypes";

interface StepCalvesInfoProps {
    formData: ExtendedNewAnimalFormData;
    setFormData: React.Dispatch<React.SetStateAction<ExtendedNewAnimalFormData>>;
    errors: { [key: string]: string };
}

export default function StepCalvesInfo({ formData, setFormData, errors }: StepCalvesInfoProps) {
    const toggleHasCalf = () => {
        setFormData(prev => ({
            ...prev,
            hasCalf: !prev.hasCalf,
            calf_tag_no: !prev.hasCalf ? "" : undefined,
            calfgender: !prev.hasCalf ? "" : undefined,
        }));
    };

    const handleInputChange = (field: keyof ExtendedNewAnimalFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <View className="space-y-4 gap-3">
            {/* Has Calf */}
            <TouchableOpacity
                onPress={toggleHasCalf}
                className="border border-gray-300 flex-row justify-between items-center bg-white rounded-xl px-4 py-4"
            >
                <Text className="text-gray-700 font-rubik-medium">Has Calf</Text>
                <View
                    className={`px-3 py-1 rounded-full ${
                        formData.hasCalf ? "bg-green-100" : "bg-red-100"
                    }`}
                >
                    <Text
                        className={`font-rubik font-medium ${
                            formData.hasCalf ? "text-green-700" : "text-red-600"
                        }`}
                    >
                        {formData.hasCalf ? "✔ Yes" : "✕ No"}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Calf Details */}
            {formData.hasCalf && (
                <View className="space-y-4 gap-3">
                    <Dropdown
                        label="Calf Gender"
                        options={calfGenderList}
                        selectedValue={formData.calfgender || ""}
                        onValueChange={(v) => handleInputChange("calfgender", v)}
                    />
                    <CustomInput
                        label="Calf Tag No"
                        value={formData.calf_tag_no || ""}
                        onChangeText={(t) => handleInputChange("calf_tag_no", t)}
                        error={errors.calf_tag_no}
                    />
                </View>
            )}
        </View>
    );
}
