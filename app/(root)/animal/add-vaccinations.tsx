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
import {Vaccination} from "@/types/types";
import CustomInput from "@/components/CustomInput";
import { animalTypeList } from "@/constants/data";
import { useApi } from "@/lib/useApi";
import {addMilkProduction, addVaccination, getAnimals} from "@/lib/appwrite";
import { Dropdown } from "react-native-element-dropdown"; // modern dropdown with search and images

interface AnimalListOption {
    label: string;
    value: string;
    image?: string;
}

interface FormData {
    vaccinationData?: any;
    onSubmit: (data: any) => void;
}

const AddVaccinations: FC<FormData> = ({ vaccinationData, onSubmit }) => {
    const params = useLocalSearchParams<{ query?: string; filter?: string; animal?: string }>();

    const [localFormData, setLocalFormData] = useState<Vaccination>({
        animalType: "Cow",
        animalId: null,
        date: new Date().toISOString().split("T")[0],
        vaccine: "",
        nextDueDate: new Date().toISOString().split("T")[0],
        notes: "",
        cost:"",
        ...vaccinationData,
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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [animalPic, setAnimalPic] = useState<any>('')
    const [animalName, setAnimalName] = useState<any>('')
    const {
        data: animals,
        refetch,
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
            .filter(animal => animal.acf?.animal_type === selectedAnimalType)
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
    }, [animals, selectedAnimalType]);

    // Sync local form data whenever selection changes
    useEffect(() => {
        setLocalFormData(prev => ({
            ...prev,
            animalType: selectedAnimalType,
            animalId: selectedAnimal ? Number(selectedAnimal) : null,
        }));
    }, [selectedAnimalType, selectedAnimal]);

    const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setLocalFormData(prev => ({
                ...prev,
                date: selectedDate.toISOString().split("T")[0],
            }));
        }
    };

    const handleInputChange = <K extends keyof Vaccination>(field: K, value: Vaccination[K]) => {
        setLocalFormData(prev => ({ ...prev, [field]: value }));
    };



    const handleFormSubmit = async () => {
        try {
            if (!selectedAnimal) {
                Alert.alert("Error", "Please select an animal first.");
                return;
            }
            const vaccinationData: Vaccination = {
                date: localFormData.date,
                vaccine: localFormData.vaccine,
                nextDueDate: localFormData.nextDueDate,
                notes: localFormData.notes || "",
                cost: localFormData.cost
            };
            // ✅ Call the function
            await addVaccination(Number(selectedAnimal), vaccinationData);
            Alert.alert("Success", "Vaccination record added successfully!");
        } catch (error: any) {
            console.error("Error submitting vaccination record:", error);
            Alert.alert("Error", error.message || "Failed to save vaccination record");
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
                    Add New Vaccination
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

                <View className="mb-4">
                    <CustomInput
                        label="Vaccine Name"
                        value={localFormData.vaccine?.toString()}
                        onChangeText={t => handleInputChange("vaccine", t)}
                        required
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-gray-700 font-rubik-medium">Next Due Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} className="w-full">
                        <View className="border border-gray-300 p-2.5 rounded-lg flex-row justify-between items-center">
                            <Text className="text-base text-gray-700">{formatDisplayDate(localFormData.nextDueDate)}</Text>
                        </View>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={localFormData.nextDueDate ? new Date(localFormData.nextDueDate) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </View>

                {/* Milk Fat */}
                <View className="mb-4">
                    <CustomInput
                        label="Cost"
                        value={localFormData.cost || ''}
                        onChangeText={t => handleInputChange("cost", t)}
                        keyboardType="numeric"
                        required
                    />
                </View>
                <View className="mb-4">
                    <CustomInput
                        label="Notes"
                        value={localFormData.notes || ''}
                        multiline={true}
                        onChangeText={t => handleInputChange("notes", t)}
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
    )
}
export default AddVaccinations
