import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Dimensions, Modal, FlatList, SafeAreaView, Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import icons from "@/constants/icons";
import images from "@/constants/images";
import {useApi} from "@/lib/useApi";
import {deleteAnimal, getAnimalById} from "@/lib/appwrite";
import EditIcon from "@/assets/svg-icons/editIcon";
import {
    formatDate, formatGallery,
    getFormattedExpectedDeliveryDate,
    getFormattedExpectedDryDate, getPregnancyDuration,
    parseMilkingRecords, parseVaccinationRecords
} from "@/utils/utils";
import {useEffect, useState} from "react";
import {GalleryImage, MilkingRecord, Vaccination} from "@/types/types";
import { Trash } from "lucide-react-native";

const Animal = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();

    const windowHeight = Dimensions.get("window").height;
    const [isToday, setIsToday] = useState(false);
    const [milkProduction, setMilkProduction] = useState<MilkingRecord[]>([]);
    const [vaccinationsRecord, setVaccinationsRecord] = useState<Vaccination[]>([]);
    const [galleryPic, setGalleryPic] = useState<GalleryImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { data: animal } = useApi({
        fn: getAnimalById,
        params: {
            id: id!,
        },
    });
    const handleEdite = (animal: any) => {
        router.push({
            pathname: "/animal/add-animal",
            params: {
                animal: JSON.stringify(animal)
            },
        });
    };

    const handleAddMilkRecord = (animal: any) => {
        router.push({
            pathname: "/animal/add-milk",
            params: {
                animal: JSON.stringify(animal.id)
            },
        });
    }

    const handleAddVaccination = (animal: any) => {
        router.push({
            pathname: "/animal/add-vaccinations",
            params: {
                animal: JSON.stringify(animal.id)
            },
        });
    }

    useEffect(() => {
        if (animal) {
            const milkRecords = parseMilkingRecords(animal?.acf?.milking_records_json);
            const vaccinationsRecords = parseVaccinationRecords(animal?.acf?.vaccinations);
            const formattedGallery = formatGallery(animal?.acf?.pictureGallery);
            // console.log(milkRecords);
            setMilkProduction(milkRecords);
            setVaccinationsRecord(vaccinationsRecords);
            setGalleryPic(formattedGallery);
            if (animal?.acf?.conceive_date) {
                const [day, month, year] = animal?.acf?.conceive_date.split('/');
                const formattedDate = `${year}-${month}-${day}`;
                const conceive = new Date(formattedDate);

                if (!isNaN(conceive.getTime())) {
                    conceive.setDate(conceive.getDate() + 212);
                    const today = new Date();

                    const isSameDay =
                        today.getDate() === conceive.getDate() &&
                        today.getMonth() === conceive.getMonth() &&
                        today.getFullYear() === conceive.getFullYear();

                    setIsToday(isSameDay);
                }
            }
        }
    }, [animal]);

    const groupedByDate: { [key: string]: MilkingRecord[] } = {};
    milkProduction.forEach(record => {
        if (!groupedByDate[record.date]) {
            groupedByDate[record.date] = [];
        }
        groupedByDate[record.date].push(record);
    });

    const sortedMilkProduction = Object.values(groupedByDate).sort((a: MilkingRecord[], b: MilkingRecord[]) => {
        const dateA = a[0]?.date ? new Date(a[0].date).getTime() : 0;
        const dateB = b[0]?.date ? new Date(b[0].date).getTime() : 0;
        return dateB - dateA; // For descending order (newest first)
    });

    const handleDeleteAnimal = async (animalId: number) => {
        Alert.alert(
            "Delete Animal",
            "Are you sure you want to delete this animal?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await deleteAnimal(animalId);
                            Alert.alert("Success", "Animal deleted successfully");
                            router.back(); // Go back to animal list
                        } catch (err: any) {
                            Alert.alert("Error", err.message || "Failed to delete animal");
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };


    return (
        <SafeAreaView className="bg-primary-500">
            <View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-32 bg-white"
            >
                <View className="flex flex-row items-center justify-between px-5 pt-12 pb-6 bg-primary-500">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                    >
                        <Image source={icons.backArrow} className="size-5" />
                    </TouchableOpacity>

                    <Text className="text-3xl mr-2 text-center font-rubik-medium text-white">
                        {animal?.acf?.name}
                    </Text>
                    <Image source={icons.bell} className="w-6 h-6" />
                </View>
                <View className="relative w-full" style={{ height: windowHeight / 2 }}>
                    <Image
                        source={{ uri: animal?.acf?.picture_?.url }}
                        className="size-full"
                        resizeMode="cover"
                    />
                    <Image
                        source={images.whiteGradient}
                        className="absolute top-0 w-full z-40"
                    />
                </View>

                <View className="px-5 mt-7 flex gap-2 font-rubik">
                    {galleryPic.length > 0 && (
                        <View className="border-b border-gray-200">
                            <ScrollView>
                            <FlatList
                                data={galleryPic}
                                keyExtractor={(item, index) => `${item.img_url}-${index}`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerClassName="flex gap-5 mt-5"
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => setSelectedImage(item.img_url)}>
                                        <Image
                                            source={{ uri: item.img_url }}
                                            className="w-52 h-52 rounded-lg"
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}
                            />
                            </ScrollView>
                        </View>
                    )}
                    <View className="flex flex-row justify-between w-full gap-3 mt-4">
                        <View className="flex flex-row gap-3  items-center">
                            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
                                <Text className="text-base font-rubik-bold text-primary-300">
                                    {animal?.acf?.name}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row gap-3 items-center">
                            <TouchableOpacity
                                className="flex flex-row gap-2 bg-primary-500 rounded-full px-4 py-2 items-center"
                                onPress={() => handleAddMilkRecord(animal)}
                                >
                                <Text className="text-base text-white font-rubik-medium">
                                    🥛 Add Milk Record
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex flex-row gap-2 bg-primary-500 rounded-full w-16 h-16 px-4 py-2 items-center"
                                onPress={() => handleEdite(animal)}
                            >
                                <EditIcon color="#fff" size={16} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteAnimal(animal.id)}
                                              className="flex flex-row gap-2 bg-red-100 rounded-full w-16 h-16 px-4 py-2 items-center text-red-500">
                                <Trash size={16} color="#ea4f49" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="px-5 py-4 border-b border-gray-200">
                        <Text className="text-xl font-rubik-bold text-gray-900 mb-3">Basic Information</Text>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-base text-gray-600 font-rubik">Animal Type</Text>
                            <Text className="text-base text-gray-900 font-rubik-medium">
                                {animal?.acf?.animal_type || 'Not specified'}
                            </Text>
                        </View>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-base text-gray-600 font-rubik">Milking Capacity</Text>
                            <Text className="text-base text-gray-900 font-rubik-medium">
                                {animal?.acf?.milking_capacity ? `${animal?.acf?.milking_capacity} kg/Day` : 'Not recorded'}
                            </Text>
                        </View>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-base text-gray-600 font-rubik">Breed</Text>
                            <Text className="text-base text-gray-900 font-rubik-medium">
                                {animal?.acf?.breeds || 'Unknown'}
                            </Text>
                        </View>

                        <View className="flex-row justify-between py-2">
                            <Text className="text-base text-gray-600 font-rubik">Color</Text>
                            <Text className="text-base text-gray-900 font-rubik-medium">
                                {animal?.acf?.color || 'Not specified'}
                            </Text>
                        </View>
                    </View>
                    {/* Purchase Information */}
                    <View className="px-5 py-4 border-b border-gray-200">
                        <Text className="text-xl font-rubik-bold text-gray-900 mb-3">Purchase Details</Text>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-base text-gray-600 font-rubik">Purchase Date</Text>
                            <Text className="text-base text-gray-900 font-rubik-medium">
                                {animal?.acf?.buy_date ? formatDate(animal?.acf?.buy_date) : 'Not purchased'}
                            </Text>
                        </View>

                        <View className="flex-row justify-between py-2">
                            <Text className="text-base text-gray-600 font-rubik">Purchase Amount</Text>
                            <Text className="text-base text-gray-900 font-rubik-medium">
                                {animal?.acf?.purchase_amount ? `₹${animal?.acf?.purchase_amount}` : 'N/A'}
                            </Text>
                        </View>
                    </View>
                    {/* Reproduction Information */}
                    {(animal?.acf?.pregnant || animal?.acf?.conceive_date) && (
                        <View className="px-5 py-4 border-b border-gray-200">
                            <Text className="text-xl font-rubik-bold text-gray-900 mb-3">Reproduction</Text>

                            {animal?.acf?.conceive_date && (
                                <View className="flex-row justify-between py-2 border-b border-gray-100">
                                    <Text className="text-base text-gray-600 font-rubik">Pregnancy Status</Text>
                                    <Text className="text-base text-gray-900 font-rubik-medium">
                                        {(() => {
                                            const {months, days} = getPregnancyDuration(animal?.acf?.conceive_date);
                                            return `${months} months, ${days} days`;
                                        })()}
                                    </Text>
                                </View>
                            )}

                            <View className="flex-row justify-between py-2 border-b border-gray-100">
                                <Text className="text-base text-gray-600 font-rubik">Expected Delivery</Text>
                                <Text className="text-base text-gray-900 font-rubik-medium">
                                    {getFormattedExpectedDeliveryDate(animal?.acf?.conceive_date || '') || 'Not calculated'}
                                </Text>
                            </View>

                            <View className="flex-row justify-between py-2">
                                <Text className="text-base text-gray-600 font-rubik">Dry Period</Text>
                                <Text className="text-base text-gray-900 font-rubik-medium">
                                    {isToday
                                        ? 'Currently dry'
                                        : `Expected ${getFormattedExpectedDryDate(animal?.acf?.conceive_date || '')}`}
                                </Text>
                            </View>
                        </View>
                    )}
                    {/* Calf Information */}
                    {(animal?.acf?.has_calf || animal?.acf?.calf_tag_no) && (
                        <View className="px-5 py-4 border-b border-gray-200">
                            <Text className="text-xl font-rubik-bold text-gray-900 mb-3">Calf Information</Text>

                            <View className="flex-row justify-between py-2 border-b border-gray-100">
                                <Text className="text-base text-gray-600 font-rubik">Calving Date</Text>
                                <Text className="text-base text-gray-900 font-rubik-medium">
                                    {animal?.acf?.calving ? formatDate(animal?.acf?.calving) : 'Not recorded'}
                                </Text>
                            </View>

                            <View className="flex-row justify-between py-2 border-b border-gray-100">
                                <Text className="text-base text-gray-600 font-rubik">Calf Gender</Text>
                                <Text className="text-base text-gray-900 font-rubik-medium">
                                    {animal?.acf?.calf_gender || 'Unknown'}
                                </Text>
                            </View>

                            <View className="flex-row justify-between py-2">
                                <Text className="text-base text-gray-600 font-rubik">Calf Tag No</Text>
                                <Text className="text-base text-gray-900 font-rubik-medium">
                                    {animal?.acf?.calf_tag_no || 'Not assigned'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Milk Production */}
                    {milkProduction.length > 0 && (
                        <View className="px-5 py-4 border-b border-gray-200">
                            <Text className="text-xl font-rubik-bold text-gray-900 mb-3">
                                Milk Production
                            </Text>

                            {milkProduction.map((dailyRecords:any, dayIndex: number) => (
                                <View
                                    key={`day-${dayIndex}`}
                                    className="mb-4 border border-gray-200 rounded-lg p-3"
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-base font-rubik-bold text-gray-900">
                                            {dailyRecords[0]?.date ? formatDate(dailyRecords[0].date) : "Unknown Date"}
                                        </Text>
                                        <Text className="text-base font-rubik-medium text-primary-500">
                                            Total: {dailyRecords.reduce((sum: any, r: any) => sum + Number(r.yield), 0)} liters
                                        </Text>
                                    </View>

                                    {dailyRecords.map((record: any, recordIndex: number) => (
                                        <View
                                            key={`record-${recordIndex}`}
                                            className="flex-row justify-between py-1"
                                        >
                                            <Text className="text-base text-gray-600 font-rubik">
                                                {record.time}
                                            </Text>
                                            <Text className="text-base text-gray-900 font-rubik-medium">
                                                {record.yield} liters
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    )}

                    <View className="px-5 py-4">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-rubik-bold text-gray-900">Vaccinations</Text>
                            <TouchableOpacity
                                className="flex flex-row gap-2 bg-primary-500 rounded-full px-5 py-2 items-center"
                                onPress={() => handleAddVaccination(animal)}
                            >
                                <Text className="text-base text-white font-rubik-medium">
                                    💊 Add Vaccination
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {vaccinationsRecord.length > 0 ? (
                            vaccinationsRecord.map((vaccination, index) => (
                                <View
                                    key={`vaccination-${index}`}
                                    className="mb-4 border border-gray-200 rounded-lg p-3"
                                >
                                    <Text className="text-base font-rubik-bold text-gray-900 mb-2">
                                        {vaccination.vaccine}
                                    </Text>

                                    <View className="flex-row justify-between py-1 border-b border-gray-100">
                                        <Text className="text-base text-gray-600 font-rubik">Date</Text>
                                        <Text className="text-base text-gray-900 font-rubik-medium">
                                            {formatDate(vaccination.date)}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between py-1 border-b border-gray-100">
                                        <Text className="text-base text-gray-600 font-rubik">Next Due Date</Text>
                                        <Text className="text-base text-gray-900 font-rubik-medium">
                                            {formatDate(vaccination.nextDueDate || "")}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between py-1 border-b border-gray-100">
                                        <Text className="text-base text-gray-600 font-rubik">Cost</Text>
                                        <Text className="text-base text-gray-900 font-rubik-medium">
                                            ₹{vaccination.cost}
                                        </Text>
                                    </View>

                                    <View className="mt-2">
                                        <Text className="text-base text-gray-600 font-rubik mb-1">Notes</Text>
                                        <Text className="text-base text-gray-900 font-rubik">
                                            {vaccination.notes || "No notes"}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="p-4 items-center">
                                <Text className="text-gray-600 font-rubik">No vaccination records available</Text>
                            </View>
                        )}



                    </View>
                </View>
            </ScrollView>
            {/* Modal for larger image */}
            <Modal
                visible={!!selectedImage}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedImage(null)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => setSelectedImage(null)}
                >
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={{ width: '90%', height: '70%', borderRadius: 10 }}
                            resizeMode="contain"
                        />
                    )}
                </TouchableOpacity>
            </Modal>
        </View>
        </SafeAreaView>
    );
}
    export default Animal;
