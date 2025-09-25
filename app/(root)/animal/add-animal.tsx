import {
    Image,
    Text,
    View,
    ScrollView, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";

import { useGlobalContext } from "@/lib/global-provider";
import {useEffect, useState} from "react";
import StepForm from "@/components/StepFrom";
import Stepper from "@/components/Stepper";
import {addNewAnimal, updateAnimal} from "@/lib/appwrite";
import {router, useLocalSearchParams} from "expo-router";
import {AnimalObject, ExtendedNewAnimalFormData, Picture} from "@/types/updatedTypes";
import {parseAnimalToFormData, } from "@/utils/utils";
const defaultAnimalData: ExtendedNewAnimalFormData = {
    name: "",
    color: "",
    breed: "",
    source: "",
    calf_tag_no: "",
    tagno: "",
    calfgender: "",
    parenttagno: "",
    buy_date: null,
    conceive_date: null,
    expected_delivery_date: null,
    expecteddeliverydate: null,
    purchaseAmount: "",
    milkingCapacity: "",
    calving: "",
    isPregnant: false,
    isDry: false,
    hasCalf: false,
    milking_records_json: "",
    medicalHistory: "",
    vaccinations: "",
    pictureGallery: [],
    animalType: "",
    picture_: undefined as unknown as Picture,
    pictures: [],
    calves: [],
    milk_quantity: "",
};

export const mergeWithDefaultAnimalData = (animal?: AnimalObject): ExtendedNewAnimalFormData => {
    if (!animal) return { ...defaultAnimalData };

    const parsedData = parseAnimalToFormData(animal);

    // Merge with defaults to ensure no missing fields
    return {
        ...defaultAnimalData,
        ...parsedData,
        // Ensure arrays are always arrays
        pictures: parsedData.pictures || [],
        calves: parsedData.calves || [],
        pictureGallery: parsedData.pictureGallery || [],
        // Ensure nested picture object exists
        picture_: parsedData.picture_ || defaultAnimalData.picture_,
    };
};


const AddAnimal = () => {
    const { user } = useGlobalContext();
    const [currentStep, setCurrentStep] = useState(0);
    const params = useLocalSearchParams<{ animal?: string }>();
    const [animalData, setAnimalData] = useState<ExtendedNewAnimalFormData>(defaultAnimalData);
    const [isStepValid, setIsStepValid] = useState(true);
    const [animalId, setAnimalId] = useState<number | null>(null)
    useEffect(() => {
        if (params.animal) {
            try {
                const parsedAnimal: AnimalObject = JSON.parse(params.animal);
                const finalData = parseAnimalToFormData(parsedAnimal);
                setAnimalData(finalData);
                setAnimalId(parsedAnimal.id);
            } catch (err) {
                console.error("Failed to parse animal:", err);
                setAnimalData({ ...defaultAnimalData });
            }
        }
    }, [params.animal]);

    const steps = ["Basic Info", "Purchase Info", "Pregnancy & Dry Status", "Calf Info"];

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };


    const handleSubmit = async () => {
        if (!isStepValid) return;
        try {
            let updatedAnimalData = { ...animalData };
            if (animalData.id && animalId !== null) {
                await updateAnimal(animalId, updatedAnimalData);
                Alert.alert("Success", "Animal updated successfully!");
                router.push('/animals');
            } else {
                await addNewAnimal(updatedAnimalData);
                Alert.alert("Success", "Animal added successfully!");
                setAnimalData(defaultAnimalData);
                setCurrentStep(0);
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong.");
        }
    };

    return (
        <SafeAreaView className="h-full bg-primary-500">
            <View className="flex flex-row items-center justify-between py-5 px-5 bg-primary-500">
                <View className="flex flex-row items-center">
                    <Image source={{ uri: user?.avatar }} className="w-12 h-12 rounded-full" />
                    <View className="ml-2">
                        <Text className="text-xs font-rubik text-white">Good Morning</Text>
                        <Text className="text-base font-rubik-medium text-white">{user?.name}</Text>
                    </View>
                </View>
                <Image source={icons.bell} className="w-6 h-6" />
            </View>
            <View className="bg-primary-500 flex-1 pb-10">
                <View className="bg-white rounded-t-[2rem] px-5 pt-5 pb-5 flex-1">
                    <ScrollView
                        className="h-full"
                        showsVerticalScrollIndicator={false}
                    >
                            <Stepper steps={steps} currentStep={currentStep} />
                        <StepForm
                            step={currentStep}
                            formData={animalData}
                            setFormData={setAnimalData}
                            onValidationChange = {setIsStepValid}
                        />

                    </ScrollView>
                    <View className="flex flex-row gap-3 mb-12">
                        <TouchableOpacity
                            onPress={handleBack}
                            disabled={currentStep === 0}
                            className="flex-1 bg-gray-600 px-5 py-3 rounded-lg"
                            style={{ opacity: currentStep === 0 ? 0.5 : 1 }}
                        >
                            <View className="flex flex-row items-center justify-center">
                                <Text className="text-white text-center text-lg">Back</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled ={!isStepValid}
                            onPress={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                            className={`flex-1 bg-primary-500 px-5 py-3 rounded-lg ${!isStepValid ? "opacity-50" : ''}`}
                        >
                            <View className="flex justify-center">
                                <Text className="text-white text-center text-lg">
                                    {currentStep === steps.length - 1 ? "Finish" : "Next"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </SafeAreaView>
    );
};
export default AddAnimal;