import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Text, View } from "react-native";

import icons from "@/constants/icons";
import {HomeIcon} from "@/assets/svg-icons/SVGIcons";
import AddHub from "@/app/(root)/(tabs)/AddHub";
import Expenses from "@/app/(root)/(tabs)/Expenses";
import wallet from "@/assets/icons/wallet.png";

const TabIcon = ({
                     focused,
                     icon,
                 }: {
    focused: boolean;
    icon: ImageSourcePropType;
    title: string;
}) => (
    <View className="flex-1 mt-3 flex flex-col items-center">
        <Image
            source={icon}
            tintColor={focused ? "#0061FF" : "#666876"}
            resizeMode="contain"
            className="size-6"
        />
    </View>
);

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "white",
                    position: "absolute",
                    minHeight: 70,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="" />
                    ),
                }}
            />
            <Tabs.Screen
                name="animals"
                options={{
                    title: "Animals",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.tag} title="" />
                    ),
                }}
            />
            <Tabs.Screen
                name="AddHub"
                options={{
                    title: "AddHub",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                            <View className="absolute -top-12 items-center justify-center bg-white p-4 rounded-full">
                                <View className="bg-primary-500 w-20 h-20 rounded-full items-center justify-center" style={{
                                    shadowColor: '#6366f1',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 10,
                                    elevation: 10, // for Android
                                }}>
                                    <Text className="text-white text-[3rem] font-rubik-light">+</Text>
                                </View>
                            </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="Expenses"
                options={{
                    title: "Expenses",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.wallet} title="" />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.person} title="" />
                    ),
                }}
            />
        </Tabs>
    );
};

export default TabsLayout;