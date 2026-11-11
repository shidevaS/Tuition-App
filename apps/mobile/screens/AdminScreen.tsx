import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Button } from "react-native";
import { useAuth } from "../App";
import { prisma } from "@tuiton/db";

export default function AdminScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.sub) return;

      const [users, challenges, submissions, lessons, xpLog] = await Promise.all([
        prisma.user.findMany({ include: { profile: true } }),
        prisma.challenge.count({ where: { published: true } }),
        prisma.challengeSubmission.count(),
        prisma.lesson.count(),
        prisma.xpLog.findMany({ where: { reason: { startsWith: "Challenge" } } }),
      ]);

      const totalStudents = users.filter((u) => u.role === "STUDENT").length;
      const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
      const totalXPSum = xpLog.reduce((sum, s) => sum + (s.amount || 0), 0);

      setStats({
        users: users.length,
        students: totalStudents,
        admins: totalAdmins,
        challenges,
        submissions,
        totalXP: totalXPSum,
      });
    };

    loadStats();
  }, [user?.sub]);

  if (loading || !stats) {
    return (
      <View style={styles.center}>
        <Text>Loading admin data...</Text>
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

      <View style={statsGrid}>
        <View style={statCard}>
          <Text style={statLabel}>Total Users</Text>
          <Text style={statValue}>{users}</Text>
        </View>
        <View style={statCard}>
          <Text style={statLabel}>Students</Text>
          <Text style={statValue}>{students}</Text>
        </View>
        <View style={statCard}>
          <Text style={statLabel}>Admins</Text>
          <Text style={statValue}>{admins}</Text>
        </View>
      </View>

      <View style={statsGrid}>
        <View style={statCard}>
          <Text style={statLabel}>Challenges</Text>
          <Text style={statValue}>{challenges}</Text>
        </View>
        <View style={statCard}>
          <Text style={statLabel}>Submissions</Text>
          <Text style={statValue}>{submissions}</Text>
        </View>
        <View style={statCard}>
          <Text style={statLabel}>Total XP</Text>
          <Text style={statValue}>{totalXP}+</Text>
        </View>
      </View>

      <View style={roadmapSection}>
        <Text style={roadmapTitle}>Next Phases</Text>
        <View style={roadmapItems}>
          {[["P2", "Roadmaps & content library"], ["P3", "Live classes (Jitsi)"], ["P4", "Challenges & XP"], ["P5", "Profile & community"], ["P6", "Polish, mobile, launch"]].map(([n, t]) => (
            <View key={n} style={roadmapItem}>
              <Text style={roadmapBadge}>{n}</Text>
              <Text style={roadmapText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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