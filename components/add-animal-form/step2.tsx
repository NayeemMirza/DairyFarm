import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import React from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomInput from "@/components/CustomInput";
import Dropdown from "@/components/dropdown";
import { animalTypeList, calvingList } from "@/constants/data";
import { ExtendedNewAnimalFormData } from "@/types/updatedTypes";

interface Step2PurchaseInfoProps {
    formData: ExtendedNewAnimalFormData;
    setFormData: React.Dispatch<React.SetStateAction<ExtendedNewAnimalFormData>>;
    errors: { [key: string]: string };
    showDatePicker: (field: keyof ExtendedNewAnimalFormData) => void;
}

export default function Step2PurchaseInfo({
                                              formData,
                                              setFormData,
                                              errors,
                                              showDatePicker,
                                          }: Step2PurchaseInfoProps) {
    const handleInputChange = (field: keyof ExtendedNewAnimalFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 0 }}
            >
                <View className="space-y-3 gap-3">
                    {/* Purchase Date */}
                    <Text className="text-gray-700 font-rubik-medium">
                        Purchase Date <Text className="text-red-500">*</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={() => showDatePicker("buy_date")}
                        className="border border-gray-300 rounded-xl px-3 py-2 flex-row justify-between items-center"
                    >
                        <Text>{formData.buy_date || "Select date"}</Text>
                    </TouchableOpacity>
                    {errors.buy_date && <Text className="text-red-500">{errors.buy_date}</Text>}

                    {/* Purchase Amount */}
                    <CustomInput
                        label="Purchase Amount"
                        value={formData.purchaseAmount || ""}
                        onChangeText={(t) => handleInputChange("purchaseAmount", t)}
                        keyboardType="numeric"
                        required={true}
                    />
                    {errors.purchaseAmount && (
                        <Text className="text-red-500">{errors.purchaseAmount}</Text>
                    )}

                    {/* Animal Type */}
                    <Dropdown
                        label="Animal Type"
                        options={animalTypeList}
                        selectedValue={formData.animalType || ""}
                        onValueChange={(v) => handleInputChange("animalType", v)}
                    />

                    {/* Calving */}
                    <Dropdown
                        label="Calving"
                        options={calvingList}
                        selectedValue={formData.calving?.toString() || ""}
                        onValueChange={(v) => handleInputChange("calving", v)}
                    />
                </View>
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
}
