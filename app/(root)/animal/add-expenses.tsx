import { router, useLocalSearchParams } from "expo-router";
import icons from "@/constants/icons";
import React, { FC, useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView, Alert,
} from "react-native";
import {
    addExpense,
    mapWordPressExpenseToApp,
} from "@/lib/appwrite";
import { Dropdown } from "react-native-element-dropdown";
import {ExpenseSchema, ExpenseType} from "@/types/expance";
import ExpenseForm from "@/components/expense/ExpenseForm"; // modern dropdown with search and images



const AddExpenses: FC<FormData> = ( ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(null);
    const handleSubmit = async (expenseData: ExpenseType) => {
        setIsLoading(true);
        try {
            const createdExpense = await addExpense({
                date: expenseData.date,
                category: expenseData.category,
                description: expenseData.description,
                amount: expenseData.amount,
                vendor: expenseData.vendor,
                payment_method: expenseData.payment_method,
                receipt_number: expenseData.receipt_number,
                notes: expenseData.notes,
            });

            // Map WordPress object to ExpenseType
            const mappedExpense = mapWordPressExpenseToApp(createdExpense);


        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to add expense");
        } finally {
            setEditingExpense(null);
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex flex-row items-center justify-between px-5 pt-12 pb-6 bg-primary-500">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                >
                    <Image source={icons.backArrow} className="size-5" />
                </TouchableOpacity>

                <Text className="text-3xl mr-2 text-center font-rubik-medium text-white">
                    Add New Expenses
                </Text>
                <Image source={icons.bell} className="w-6 h-6" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerClassName="p-5 pb-32"
            >
                <ExpenseForm
                    expense={editingExpense}
                    onSubmit={handleSubmit}
                    categories={ExpenseSchema.properties.category.enum}
                    paymentMethods={ExpenseSchema.properties.payment_method.enum}
                />
            </ScrollView>
        </View>
    )
}
export default AddExpenses
