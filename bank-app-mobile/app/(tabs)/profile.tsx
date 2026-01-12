import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/auth";

interface User {
  username: string;
  balance: number;
  profilePicture?: string;
}

export default function ProfileScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getMe,
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading profile</Text>
        <Text style={styles.errorSubtext}>
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      </View>
    );
  }

  const user = data?.data as User | undefined;

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {user?.profilePicture ? (
          <Image
            source={{ uri: user.profilePicture }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageText}>
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
        )}

        <Text style={styles.username}>{user?.username || "User"}</Text>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            ${user?.balance?.toFixed(2) || "0.00"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    width: "100%",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  profileImageText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 30,
  },
  balanceContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#00A86B",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff3b30",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
  },
});
