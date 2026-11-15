import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth, type RootStackParamList } from "../App";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Login">>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    if (await login({ email, password })) navigation.replace("Home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your Tuiton account</Text>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
      </TouchableOpacity>

      <View style={styles.divider}>
        <Text style={styles.dividerText}>Or continue with</Text>
      </View>

      <View style={styles.socialButtons}>
        {/* Social login buttons would go here */}
      </View>

      <View style={styles.linkSection}>
        <Text style={styles.linkText}>
          New here?{" "}
          <Text style={styles.linkTextAccent} onPress={() => navigation.navigate("Register")}>
            Create account
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1729",
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F8F9FA",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    backgroundColor: "#1E293B",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    color: "#F8F9FA",
  },
  button: {
    backgroundColor: "#10B981",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingVertical: 8,
  },
  dividerText: {
    color: "#64748B",
    flex: 1,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  linkSection: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    color: "#64748B",
    fontSize: 14,
  },
  linkTextAccent: {
    color: "#10B981",
    fontSize: 14,
  },
});