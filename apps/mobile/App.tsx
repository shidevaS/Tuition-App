import React, { createContext, useContext, useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import DashboardScreen from "./screens/DashboardScreen";
import AdminScreen from "./screens/AdminScreen";

// Auth context for mobile app
const AuthContext = createContext({
  user: null,
  loading: true,
  login: (credentials: { email: string; password: string }) => {},
  register: (userData: { name: string; email: string; password: string }) => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthContextValue = {
  user: null | { sub: string; email: string; name: string; role: string };
  loading: boolean;
  login: (credentials: { email: string; password: string }) => void;
  register: (userData: { name: string; email: string; password: string }) => void;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<null | { sub: string; email: string; name: string; role: string }>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session or simulate auth state
    const checkAuth = async () => {
      // In a real app, would check AsyncStorage or server session
      // For now, simulate based on environment
      const simulatedUser = {
        sub: "user-123",
        email: "student@tuiton.app",
        name: "Demo Student",
        role: "STUDENT",
      };
      setUser(simulatedUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (credentials: { email: string; password: string }) => {
    // Simulate login - in real app would call API
    setUser({
      sub: "user-123",
      email: credentials.email,
      name: credentials.email.split("@")[0],
      role: "STUDENT",
    });
    setLoading(false);
  };

  const register = (userData: { name: string; email: string; password: string }) => {
    // Simulate registration
    setUser({
      sub: "user-new-456",
      email: userData.email,
      name: userData.name,
      role: "STUDENT" as "STUDENT" | "ADMIN",
    });
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});