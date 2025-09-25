import React, {useEffect, useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Alert,
    Image, KeyboardAvoidingView, Modal, Platform,
    ScrollView,
    Text, TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import images from "@/constants/images";
import {useApi} from "@/lib/useApi";
import {loginUser} from "@/lib/appwrite";
import {saveToken} from "@/utils/authToken";
import {useGlobalContext} from "@/lib/global-provider";
import {Redirect} from "expo-router";

const SignIn  = () => {
    const [modalVisible, setModalVisible] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { refetch, loading, isLogged } = useGlobalContext();

    if (!loading && isLogged) return <Redirect href="/" />;

    const handleLogin = async () => {
        const result = await loginUser({ username, password });
        if (result) {
           await refetch();
        } else {
            Alert.alert("Error", "Failed to login");
        }
    };



    return (
        <SafeAreaView className="bg-white h-full flex-1">
            <ScrollView contentContainerStyle={{height: "100%",}} >
                <Image
                    source={images.loginImage}
                    className="w-full h-4/6"
                    resizeMode="contain"
                />

                <View className="px-10 relative -mt-44">
                    <Text className="text-base text-center uppercase font-rubik text-black-900">
                        Welcome To Dairy Management
                    </Text>

                    <Text className="text-3xl font-rubik-bold text-black-800 text-center mt-2">
                        Let's Get You Closer To {"\n"}
                        <Text className="text-primary-300">Your Ideal Dairy Farm</Text>
                    </Text>
                </View>

            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1, justifyContent: "flex-end" }}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
                >
                    <View className="bg-white rounded-t-3xl p-5 shadow-lg" style={{ maxHeight: "80%" }}>
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 20 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text className=" text-2xl font-rubik-medium uppercase text-black-900 text-center mb-3">
                                Login
                            </Text>

                            <View className="mb-5">
                                <Text className="text-base text-black-600 pb-2">User Name</Text>
                                <TextInput
                                    className="w-full py-3 px-4 rounded-lg border border-primary-100 text-sm font-rubik text-black-300"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChangeText={setUsername}
                                    returnKeyType="next"
                                />
                            </View>

                            <View className="mb-5">
                                <Text className="text-base text-black-600 pb-2">Password</Text>
                                <TextInput
                                    className="w-full py-3 px-4 rounded-lg border border-primary-100 text-sm font-rubik text-black-300"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    returnKeyType="done"
                                />
                            </View>

                            <TouchableOpacity
                                className="bg-primary-500 py-3 mt-5 rounded-lg"
                                onPress={handleLogin}
                            >
                                <Text className="text-white text-center font-rubik-bold">
                                    LOGIN
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

export default SignIn;