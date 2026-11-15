import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../App";
import { api } from "../lib/api";

type AdminStats = {
  users: number;
  students: number;
  admins: number;
  challenges: number;
  submissions: number;
  totalXP: number;
};

export default function AdminScreen() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // For admin stats, we'll need to create an admin API endpoint
      // For now, we'll use the existing dashboard data and supplement
      const result = await api.getAdminDashboardData();
      if (result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading || !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const { users, students, admins, challenges, submissions, totalXP } = stats;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Console</Text>
        <Text style={styles.subtitle}>Platform Overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Users</Text>
          <Text style={styles.statValue}>{users}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Students</Text>
          <Text style={styles.statValue}>{students}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Admins</Text>
          <Text style={styles.statValue}>{admins}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Challenges</Text>
          <Text style={styles.statValue}>{challenges}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Submissions</Text>
          <Text style={styles.statValue}>{submissions}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total XP</Text>
          <Text style={styles.statValue}>{totalXP}+</Text>
        </View>
      </View>

      <View style={styles.roadmapSection}>
        <Text style={styles.roadmapTitle}>Next Phases</Text>
        <View style={styles.roadmapItems}>
          {[["P2", "Roadmaps & content library"], ["P3", "Live classes (Jitsi)"], ["P4", "Challenges & XP"], ["P5", "Profile & community"], ["P6", "Polish, mobile, launch"]].map(([n, t]) => (
            <View key={n} style={styles.roadmapItem}>
              <Text style={styles.roadmapBadge}>{n}</Text>
              <Text style={styles.roadmapText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#0F1729",
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F8F9FA",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 20,
    width: "45%",
    marginBottom: 16,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10B981",
  },
  roadmapSection: {
    marginTop: 32,
  },
  roadmapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F8F9FA",
    marginBottom: 16,
  },
  roadmapItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  roadmapItem: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
  },
  roadmapBadge: {
    backgroundColor: "#F59E0B",
    color: "#0F1729",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 6,
  },
  roadmapText: {
    color: "#F8F9FA",
    fontSize: 12,
  },
});