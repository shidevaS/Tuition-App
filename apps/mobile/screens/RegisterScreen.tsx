import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth, type RootStackParamList } from "../App";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Register">>();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    if (await register({ name, email, password })) navigation.replace("Home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Tuiton and start learning</Text>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
      </TouchableOpacity>

      <View style={styles.linkSection}>
        <Text style={styles.linkText}>
          Already have an account?{" "}
          <Text style={styles.linkTextAccent} onPress={() => navigation.navigate("Login")}>
            Sign in
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