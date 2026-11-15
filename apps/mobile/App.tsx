import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Alert } from "react-native";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import DashboardScreen from "./screens/DashboardScreen";
import AdminScreen from "./screens/AdminScreen";
import { api } from "./lib/api";

type User = { sub: string; email: string; name: string; role: "STUDENT" | "ADMIN" };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Dashboard: undefined;
  Admin: undefined;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<User | null> => {
    setLoading(true);
    try {
      const result = await api.getSession();
      if (result.data) {
        setUser(result.data);
        return result.data;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await api.login(credentials.email, credentials.password);
      if (result.error) {
        Alert.alert('Login Failed', result.error);
        setLoading(false);
        return false;
      }
      return Boolean(await refreshSession());
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await api.register(userData.name, userData.email, userData.password);
      if (result.error) {
        Alert.alert('Registration Failed', result.error);
        setLoading(false);
        return false;
      }
      return Boolean(await refreshSession());
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};
const Stack = createNativeStackNavigator<RootStackParamList>();

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