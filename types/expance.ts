export interface ExpenseType {
    id?: string;
    date: string;
    category: "Feed" | "Medicine" | "Equipment" | "Labor" | "Utilities" | "Maintenance" | "Transport" | "Other";
    description: string;
    amount: number;
    vendor?: string;
    payment_method?: "Cash" | "Bank Transfer" | "Credit Card" | "Check";
    receipt_number?: string;
    notes?: string;
}

export const ExpenseSchema = {
    name: "Expense",
    type: "object",
    properties: {
        date: { type: "string", format: "date", description: "Date of expense" },
        category: {
            type: "string",
            enum: ["Feed","Medicine","Equipment","Labor","Utilities","Maintenance","Transport","Other"],
            description: "Expense category",
        },
        description: { type: "string", description: "Expense description" },
        amount: { type: "number", description: "Expense amount" },
        vendor: { type: "string", description: "Supplier or vendor" },
        payment_method: {
            type: "string",
            enum: ["Cash","Bank Transfer","Credit Card","Check"],
            description: "Payment method used",
        },
        receipt_number: { type: "string", description: "Receipt or invoice number" },
        notes: { type: "string", description: "Additional notes" },
    },
    required: ["date","category","description","amount"],
};

export interface CreateExpensePayload {
    date: string; // "YYYY-MM-DD" format
    category: "Feed" | "Medicine" | "Equipment" | "Labor" | "Utilities" | "Maintenance" | "Transport" | "Other";
    description: string;
    amount: number;
    vendor?: string;
    payment_method?: string;
    receipt_number?: string;
    notes?: string;
}