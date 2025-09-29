import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { ExpenseType } from "@/types/expance";
import { Picker } from "@react-native-picker/picker";

interface ExpenseFormProps {
    expense: ExpenseType | null;
    onSubmit: (expense: ExpenseType) => void;
    onCancel: () => void;
    categories: string[];
    paymentMethods: string[];
}

const defaultExpense: ExpenseType = {
    id: "",
    date: new Date().toISOString().split("T")[0],
    category: "Feed",
    description: "",
    amount: 0,
    vendor: "",
    payment_method: "Cash",
    receipt_number: "",
    notes: "",
};

export default function ExpenseForm({ expense, onSubmit, onCancel, categories, paymentMethods }: ExpenseFormProps) {
    const [currentExpense, setCurrentExpense] = useState<ExpenseType>(
        expense || defaultExpense
    );

    const handleInputChange = <K extends keyof ExpenseType>(field: K, value: ExpenseType[K]) => {
        setCurrentExpense((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onSubmit(currentExpense);
    };

    return (
        <View className="bg-white rounded-2xl shadow-lg p-4">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Date */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Date*</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        value={currentExpense.date}
                        onChangeText={(val) => handleInputChange("date", val)}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                {/* Category */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Category*</Text>
                    <View className="border border-gray-300 rounded-lg justify-center px-2">
                        <Picker
                            selectedValue={currentExpense.category}
                            onValueChange={(value) => handleInputChange("category", value)}
                        >
                            {categories.map((cat) => (
                                <Picker.Item key={cat} label={cat} value={cat} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Amount */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Amount*</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        keyboardType="numeric"
                        value={String(currentExpense.amount)}
                        onChangeText={(val) => handleInputChange("amount", parseFloat(val) || 0)}
                        placeholder="0.00"
                    />
                </View>

                {/* Description */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Description*</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        value={currentExpense.description}
                        onChangeText={(val) => handleInputChange("description", val)}
                        placeholder="Expense description"
                    />
                </View>

                {/* Vendor */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Vendor</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        value={currentExpense.vendor}
                        onChangeText={(val) => handleInputChange("vendor", val)}
                        placeholder="Vendor name"
                    />
                </View>

                {/* Payment Method */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Payment Method</Text>
                    <View className="border border-gray-300 rounded-lg justify-center px-2">
                        <Picker
                            selectedValue={currentExpense.payment_method}
                            onValueChange={(value) => handleInputChange("payment_method", value)}
                        >
                            {paymentMethods.map((method) => (
                                <Picker.Item key={method} label={method} value={method} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Receipt Number */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">Receipt Number</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        value={currentExpense.receipt_number}
                        onChangeText={(val) => handleInputChange("receipt_number", val)}
                        placeholder="Receipt number"
                    />
                </View>

                {/* Notes */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-semibold mb-2">Notes</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        value={currentExpense.notes}
                        onChangeText={(val) => handleInputChange("notes", val)}
                        placeholder="Additional notes"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Buttons */}
                <View className="flex-row justify-between">
                    <TouchableOpacity
                        onPress={onCancel}
                        className="bg-gray-300 px-4 py-2 rounded-lg flex-1 mr-2"
                    >
                        <Text className="text-gray-800 font-rubik-medium text-center">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-primary-500 px-4 py-2 rounded-lg flex-1 ml-2"
                    >
                        <Text className="text-white font-rubik-medium text-center">
                            {expense ? "Update" : "Save"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}