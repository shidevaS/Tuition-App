import React, { useEffect } from "react";
import { View, Text, StyleSheet, RefreshControl } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "@/App";

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    // User loaded, navigate based on role
    if (user?.role === "ADMIN") {
      navigation.replace("Admin");
    }
  }, [user, navigation]);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {user.name}</Text>
      </View>

      <View style={statsGrid}>
        {/* Progress Card */}
        <View style={statCard}>
          <Text style={statLabel}>Lessons Completed</Text>
          <Text style={statValue}>0</Text>
        </View>

        {/* Challenges Card */}
        <View style={statCard}>
          <Text style={statLabel}>Active Challenges</Text>
          <Text style={statValue}>0</Text>
        </View>

        {/* XP Card */}
        <View style={statCard}>
          <Text style={statLabel}>XP</Text>
          <Text style={statValue}>0</Text>
        </View>
      </View>

      <View style={sections}>
        <Text style={sectionTitle}>Quick Actions</Text>
        {/* Lessons Button */}
        <TouchableOpacity style={actionCard} onPress={() => navigation.navigate("Lessons")}>
          <Text style={actionTitle}>View Lessons</Text>
        </TouchableOpacity>

        {/* Challenges Button */}
        <TouchableOpacity style={actionCard} onPress={() => navigation.navigate("Challenges")}>
          <Text style={actionTitle}>Challenges</Text>
        </TouchableOpacity>

        {/* Live Classes Button */}
        <TouchableOpacity style={actionCard} onPress={() => navigation.navigate("LiveClasses")}>
          <Text style={actionTitle}>Live Classes</Text>
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity style={actionCard} onPress={() => navigation.navigate("Profile")}>
          <Text style={actionTitle}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1729",
  },
  header: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    marginBottom: 32,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F8F9FA",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 24,
    width: "45%",
    marginBottom: 16,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  sections: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F8F9FA",
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
  },
  actionTitle: {
    color: "#F8F9FA",
    fontSize: 16,
    textAlign: "center",
  },
});