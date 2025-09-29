import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    FlatList,
    ScrollView,
    Image,
    Modal
} from "react-native";
import { Plus, Download } from "lucide-react-native";
import { format } from "date-fns";

import ExpenseSummary from "@/components/expense/ExpenseSummary";
import ExpenseFilters from "@/components/expense/ExpenseFilters";
import ExpenseForm from "@/components/expense/ExpenseForm";
import ExpenseList from "@/components/expense/ExpenseList";
import { ExpenseType, ExpenseSchema } from "@/types/expance";
import {router} from "expo-router";
import icons from "@/constants/icons";
import {useApi} from "@/lib/useApi";
import {getAnimals, getExpenses} from "@/lib/appwrite";

export default function Expenses() {
    const [expenses, setExpenses] = useState<ExpenseType[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: "all",
        month: format(new Date(), "yyyy-MM"),
    });

    const {
        data: expensesList,
        refetch,
        loading,
    } = useApi({
        fn: getExpenses,
        params: {
            filter: params.filter!,
            query: params.query!,
        },
        skip: true,
    });

    useEffect(() => {
        refetch({
            filter: params.filter!,
            query: params.query!,
        });
    }, [params.filter, params.query]);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setExpenses([
                { id: "1", date: "2025-09-01", category: "Feed", description: "Chicken feed purchase", amount: 150, vendor: "Local supplier", payment_method: "Cash", receipt_number: "R-001", notes: "For September" },
                { id: "2", date: "2025-09-03", category: "Medicine", description: "Vaccine purchase", amount: 80, vendor: "Vet Shop", payment_method: "Credit Card", receipt_number: "R-002", notes: "" },
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    const handleSubmit = (expenseData: ExpenseType) => {
        if (editingExpense) {
            setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...expenseData, id: e.id } : e));
        } else {
            const newId = expenses.length > 0
                ? (Math.max(...expenses.map(e => Number(e.id))) + 1).toString()
                : "1";
            setExpenses(prev => [{ ...expenseData, id: newId }, ...prev]);
        }
        setShowForm(false);
        setEditingExpense(null);
    };

    const handleEdit = (expense: ExpenseType) => {
        setEditingExpense(expense);
        setShowForm(true);
    };

    const filteredExpenses = expenses.filter(exp => {
        const categoryMatch = filters.category === "all" || exp.category === filters.category;
        const monthMatch = !filters.month || format(new Date(exp.date), "yyyy-MM") === filters.month;
        return categoryMatch && monthMatch;
    });

    const handleExport = () => {
        Alert.alert("Export CSV", "CSV export is not implemented on mobile yet.");
    };

    return (
        <SafeAreaView className="flex-1 bg-primary-500">
            <View className="flex flex-row items-center justify-between px-5 pt-12 pb-6 bg-primary-500">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                >
                    <Image source={icons.backArrow} className="size-5" />
                </TouchableOpacity>

                <Text className="text-3xl mr-2 text-center font-rubik-medium text-white">
                    Farm Expenses
                </Text>
                <Image source={icons.bell} className="w-6 h-6" />
            </View>
            {/* Header */}

            {/* Expense Form */}
            <Modal visible={showForm} transparent={true} animationType="slide" onRequestClose={() => setShowForm(false)}>
                <TouchableOpacity
                    className="flex-1 justify-end"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    activeOpacity={1}
                    onPressOut={() => setShowForm(false)}
                >
                    <ExpenseForm
                        expense={editingExpense}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingExpense(null);
                        }}
                        categories={ExpenseSchema.properties.category.enum}
                        paymentMethods={ExpenseSchema.properties.payment_method.enum}
                    />
                </TouchableOpacity>
            </Modal>

            {/* Filters */}
            <View className="flex flex-col bg-white">
                <View className="p-4 bg-white">
                    {/* Fixed: Added isLoading prop to ExpenseSummary */}
                    <ExpenseSummary expenses={filteredExpenses} isLoading={isLoading} />
                    <TouchableOpacity
                        onPress={() => setShowForm(!showForm)}
                        className="mt-3 flex-row justify-center gap-3 items-center px-4 py-2 rounded-xl bg-primary-500 mb-6"
                    >
                        <Plus size={20} color="white" />
                        <Text className="font-rubik-medium text-white">Add New Expense</Text>
                    </TouchableOpacity>
                    <ExpenseFilters
                        onFilterChange={setFilters}
                        currentFilters={filters}
                        categories={["all", ...ExpenseSchema.properties.category.enum]}
                    />
                </View>

            </View>
            {/* Expense List */}
            <View className="flex-1 px-4 bg-white gap-3">
                {isLoading ? (
                    <ActivityIndicator size="large" color="#047857" className="mt-8" />
                ) : filteredExpenses.length === 0 ? (
                    <Text className="mt-8 text-center text-gray-500">
                        No expenses found for selected filters.
                    </Text>
                ) : (
                    <FlatList
                        data={filteredExpenses}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => (
                            <ExpenseList expenses={[item]} onEdit={handleEdit} isLoading={false} />
                        )}
                        contentContainerStyle={{ paddingBottom: 0 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}