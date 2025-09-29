import { router, useLocalSearchParams } from "expo-router";
import icons from "@/constants/icons";
import { FC, useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView, Alert,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { MilkingRecord } from "@/types/types";
import CustomInput from "@/components/CustomInput";
import { animalTypeList } from "@/constants/data";
import { useApi } from "@/lib/useApi";
import {addMilkProduction, getAnimals} from "@/lib/appwrite";
import { Dropdown } from "react-native-element-dropdown"; // modern dropdown with search and images

interface AnimalListOption {
    label: string;
    value: string;
    image?: string;
}

interface FormData {
    milkData?: any;
    onSubmit: (data: any) => void;
    setMilkData: (data: any) => void;
}

const AddMilk: FC<FormData> = ({ milkData}) => {
    const params = useLocalSearchParams<{ query?: string; filter?: string; animal?: string }>();

    const [localFormData, setLocalFormData] = useState<MilkingRecord>({
        animalType: "Cow",
        animalId: null,
        date: new Date().toISOString().split("T")[0],
        yield: "",
        quality: "",
        time: "Morning",
        ...milkData,
    });
    const [selectedAnimalType, setSelectedAnimalType] = useState(localFormData.animalType);
    const [selectedAnimal, setSelectedAnimal] = useState<string | null>(
        params.animal
            ? params.animal
            : localFormData.animalId
                ? localFormData.animalId.toString()
                : null
    );
    const [animalList, setAnimalList] = useState<AnimalListOption[]>([]);
    const [milkingTime, setMilkingTime] = useState<"Morning" | "Evening">("Morning");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [animalPic, setAnimalPic] = useState<any>('')
    const [animalName, setAnimalName] = useState<any>('')
    const {
        data: animals,
        refetch
    } = useApi({
        fn: getAnimals,
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
        if (!animals) return;
        const filteredAnimals = animals
            .filter(animal => !animal.acf?.dry_cow && animal.acf?.animal_type === selectedAnimalType)
            .map(animal => ({
                label: animal.acf?.name || `Animal ${animal.id}`,
                value: animal.id.toString(),
                image: animal.acf?.picture_?.url,
            }));

        setAnimalList(filteredAnimals);

        if (!filteredAnimals.some(a => a.value === selectedAnimal)) {
            setSelectedAnimal(null);
        }

        const animalPicture = animals.filter(animal => animal.id === Number(params.animal))
        setAnimalPic(animalPicture[0]?.acf?.picture_?.url);
        setAnimalName(animalPicture[0]?.acf?.name);
        setLocalFormData(prev => ({
            ...prev,
            animalType: selectedAnimalType,
            animalId: selectedAnimal ? Number(selectedAnimal) : null,
        }));
    }, [animals, selectedAnimalType, selectedAnimal]);

    const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setLocalFormData(prev => ({
                ...prev,
                date: selectedDate.toISOString().split("T")[0],
            }));
        }
    };

    const handleInputChange = <K extends keyof MilkingRecord>(field: K, value: MilkingRecord[K]) => {
        setLocalFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleTime = (time: "Morning" | "Evening") => {
        setMilkingTime(time);
        handleInputChange("time", time);
    };

    const handleFormSubmit = async () => {
        try {
        if (!selectedAnimal) {
            Alert.alert("Error", "Please select an animal first.");
            return;
        }

        // ✅ Build milk record from form state
            const milkData: MilkingRecord = {
                date: localFormData.date,             // e.g. "2025-09-02"
                yield: String(localFormData.yield),
                time: localFormData.time,             // morning | evening
                quality: localFormData.quality || "", // optional
            };
            // ✅ Call the function
            await addMilkProduction(Number(selectedAnimal), milkData);
            Alert.alert("Success", "Milk production record added successfully!");
        } catch (error: any) {
            console.error("Error submitting milk record:", error);
            Alert.alert("Error", error.message || "Failed to save milk record");
        }
    };

    const formatDisplayDate = (dateString?: string) => {
        if (!dateString) return "Select date";
        const date = new Date(dateString);
        return isNaN(date.getTime())
            ? "Invalid date"
            : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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
                    Add Milk Record
                </Text>
                <Image source={icons.bell} className="w-6 h-6" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerClassName="p-5 pb-32"
            >
                {!params.animal ? (
                    <>
                        {/* Animal Type Dropdown */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-rubik-medium">Select Animal Type</Text>
                            <Dropdown
                                style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10 }}
                                data={animalTypeList.map(a => ({ label: a.name, value: a.value }))}
                                labelField="label"
                                valueField="value"
                                placeholder="Select Animal Type"
                                value={selectedAnimalType}
                                onChange={item => setSelectedAnimalType(item.value)}
                            />
                        </View>

                        {/* Animal Dropdown */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-rubik-medium">Select Animal</Text>
                            <Dropdown
                                style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10 }}
                                data={animalList}
                                labelField="label"
                                valueField="value"
                                placeholder="Select Animal"
                                value={selectedAnimal}
                                search={animalList.length > 5}
                                renderItem={(item: AnimalListOption) => (
                                    <View className="flex-row items-center p-2">
                                        {item.image && (
                                            <Image source={{ uri: item.image }} className="w-10 h-10 rounded-full mr-2" />
                                        )}
                                        <Text>{item.label}</Text>
                                    </View>
                                )}
                                onChange={item => setSelectedAnimal(item.value)}
                            />
                        </View>
                    </>
                ) : (
                    <View className="mb-4">
                        {animalPic ? (
                            <Image
                                source={{ uri: animalPic }}
                                className="w-full h-64 rounded-xl"
                                resizeMode="cover"
                            />
                        ) : (
                            <Text className="text-gray-500">No picture available</Text>
                        )}
                        <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
                            <Text
                                className="text-xl font-rubik-extrabold text-white"
                                numberOfLines={1}
                            >
                                {animalName}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Date */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-rubik-medium">Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} className="w-full">
                        <View className="border border-gray-300 p-2.5 rounded-lg flex-row justify-between items-center">
                            <Text className="text-base text-gray-700">{formatDisplayDate(localFormData.date)}</Text>
                        </View>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date(localFormData.date)}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </View>

                {/* Milk Yield */}
                <View className="mb-4">
                    <CustomInput
                        label="Milk Yield (Liters)"
                        value={localFormData.yield?.toString()}
                        onChangeText={t => handleInputChange("yield", t)}
                        keyboardType="numeric"
                        required
                    />
                </View>

                {/* Milking Time */}
                <View className="flex-row justify-between items-center mb-4 gap-2.5">
                    {["Morning", "Evening"].map(time => (
                        <TouchableOpacity key={time} onPress={() => toggleTime(time as any)} className="flex-1">
                            <View className={`p-2.5 rounded-lg ${milkingTime === time ? "bg-primary-500" : "bg-gray-100"}`}>
                                <Text className={`text-base font-semibold text-center ${milkingTime === time ? "text-white font-bold" : "text-gray-800"}`}>
                                    {time}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Milk Fat */}
                <View className="mb-6">
                    <CustomInput
                        label="Milk Fat (%)"
                        value={localFormData.quality?.toString() || ""}
                        onChangeText={t => handleInputChange("quality", t)}
                        keyboardType="numeric"
                    />
                </View>

                {/* Submit */}
                <TouchableOpacity
                    onPress={handleFormSubmit}
                    className="bg-primary-500 py-3 px-6 rounded-lg items-center justify-center mt-2.5"
                >
                    <Text className="text-base font-bold text-white">Submit</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default AddMilk;
