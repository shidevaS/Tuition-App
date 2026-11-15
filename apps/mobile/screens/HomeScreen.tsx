import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth, type RootStackParamList } from "../App";
import { api } from "../lib/api";

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Home">>();
  const [stats, setStats] = useState({ lessonsCompleted: 0, activeChallenges: 0, xp: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // User loaded, navigate based on role
    if (user?.role === "ADMIN") {
      navigation.replace("Admin");
    }
  }, [user, navigation]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const result = await api.getDashboardData();
      if (result.data) {
        setStats({
          lessonsCompleted: result.data.completedLessons || 0,
          activeChallenges: result.data.activeChallenges || 0,
          xp: result.data.xp || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {user.name}</Text>
      </View>

      <View style={styles.statsGrid}>
        {/* Progress Card */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Lessons Completed</Text>
          <Text style={styles.statValue}>{stats.lessonsCompleted}</Text>
        </View>

        {/* Challenges Card */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Challenges</Text>
          <Text style={styles.statValue}>{stats.activeChallenges}</Text>
        </View>

        {/* XP Card */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{stats.xp}</Text>
        </View>
      </View>

      <View style={styles.sections}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.replace("Dashboard")}>
          <Text style={styles.actionTitle}>Open Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F1729",
  },
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