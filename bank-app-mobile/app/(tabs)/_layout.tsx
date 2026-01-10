import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4a90e2",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "#ffffff",
        },
        headerStyle: {
          backgroundColor: "#00A86B",
        },
        headerTintColor: "#fff",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarLabel: "Transactions",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: "Network",
          tabBarLabel: "Network",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
