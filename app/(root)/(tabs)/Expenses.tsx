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
import { format, parse } from "date-fns";

import ExpenseSummary from "@/components/expense/ExpenseSummary";
import ExpenseFilters from "@/components/expense/ExpenseFilters";
import ExpenseForm from "@/components/expense/ExpenseForm";
import ExpenseList from "@/components/expense/ExpenseList";
import { ExpenseType, ExpenseSchema } from "@/types/expance";
import {router, useLocalSearchParams} from "expo-router";
import icons from "@/constants/icons";
import {useApi} from "@/lib/useApi";
import {
    addExpense,
    deleteExpense,
    getAnimals,
    getExpenses,
    mapWordPressExpenseToApp,
    updateExpense
} from "@/lib/appwrite";

export default function Expenses() {
    const [expenses, setExpenses] = useState<ExpenseType[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: "all",
        month: format(new Date(), "yyyy-MM"),
    });
    const params = useLocalSearchParams<{ filter?: string; query?: string }>();
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
        if (expensesList) {
            setIsLoading(true);

            const validCategories = ["Feed", "Medicine", "Equipment", "Labor", "Utilities", "Maintenance", "Transport", "Other"] as const;

            const mappedExpenses: any[] = expensesList.map((e) => {
                let parsedDate: string;

                // Parse ACF date
                if (e.acf?.date) {
                    try {
                        const cleanedDate = e.acf.date.trim();
                        parsedDate = format(parse(cleanedDate, "MMMM d, yyyy", new Date()), "yyyy-MM-dd");
                    } catch {
                        parsedDate = e.date;
                    }
                } else {
                    parsedDate = e.date;
                }

                // Validate category
                const category = validCategories.includes(e.acf?.category as any)
                    ? (e.acf?.category as ExpenseType["category"])
                    : "Other";

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
            });

            setExpenses(mappedExpenses);
            setIsLoading(false);
        }
    }, [expensesList]);

    const handleSubmit = async (expenseData: ExpenseType) => {
        setIsLoading(true);
        try {
            if (editingExpense) {
                const updated = await updateExpense({ ...expenseData, id: editingExpense.id });
                setExpenses(prev =>
                    prev.map(e => e.id === editingExpense.id ? {
                        ...e,
                        ...mapWordPressExpenseToApp(updated) // map WP response back to ExpenseType
                    } : e)
                );
            } else {
                // Add new expense to WordPress
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

                // Update local state
                setExpenses(prev => [mappedExpense, ...prev]);
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to add expense");
        } finally {
            setShowForm(false);
            setEditingExpense(null);
            setIsLoading(false);
        }
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

    const handleDelete = async (expenseId: string) => {
        Alert.alert(
            "Delete Expense",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await deleteExpense(expenseId);
                            setExpenses(prev => prev.filter(e => e.id !== expenseId));
                            setIsLoading(false);
                        } catch (err: any) {
                            setIsLoading(false);
                            Alert.alert("Error", err.message || "Failed to delete expense");
                        }
                    },
                },
            ]
        );
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
                    <TouchableOpacity
                        onPress={() => setShowForm(!showForm)}
                        className="mt-3 flex-row justify-center gap-3 items-center px-4 py-2 rounded-xl bg-primary-500 mb-6"
                    >
                        <Plus size={20} color="white" />
                        <Text className="font-rubik-medium text-white">Add New Expense</Text>
                    </TouchableOpacity>
                    <ExpenseSummary expenses={filteredExpenses} isLoading={isLoading} />
                    <View className="mt-5">
                        <ExpenseFilters
                            onFilterChange={setFilters}
                            currentFilters={filters}
                            categories={["all", ...ExpenseSchema.properties.category.enum]}
                        />
                    </View>
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
                            <ExpenseList
                                expenses={[item]}
                                onEdit={handleEdit}
                                isLoading={false}
                                onDelete={() => {
                                    if (item.id) {
                                        handleDelete?.(item?.id)
                                    }
                                }} />
                        )}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}