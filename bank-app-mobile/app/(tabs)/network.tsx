import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getMe } from "../../api/auth";

interface User {
  id?: string;
  username: string;
  balance?: number;
  imagePath?: string;
}

export default function Network() {
  const { data: currentUser } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getMe,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", "all"],
    queryFn: getAllUsers,
  });

  // Track which images failed to load
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Helper function to get full image URL
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    // If it's a relative URL, prepend the base URL
    const baseURL = "https://bank-app-be-eapi-btf5b.ondigitalocean.app";
    return `${baseURL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
  };

  const handleImageError = (imageUrl: string) => {
    setFailedImages((prev) => new Set(prev).add(imageUrl));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading users</Text>
        <Text style={styles.errorSubtext}>
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      </View>
    );
  }

  const users = (data?.data || data || []) as User[];
  const currentUsername = currentUser?.data?.username;

  const renderUserItem = ({ item }: { item: User }) => {
    const isCurrentUser = item.username === currentUsername;
    const imageUrl = getImageUrl(item.imagePath);
    const imageFailed = imageUrl && failedImages.has(imageUrl);
    const showImage = imageUrl && !imageFailed;

    return (
      <View style={[styles.userCard, isCurrentUser && styles.currentUserCard]}>
        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.profileImage}
            onError={() => imageUrl && handleImageError(imageUrl)}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageText}>
              {item.username?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {item.username}
            {isCurrentUser && (
              <Text style={styles.currentUserLabel}> (You)</Text>
            )}
          </Text>
          {item.balance !== undefined && (
            <Text style={styles.balance}>
              Balance: ${item.balance.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Users</Text>
      <Text style={styles.subtitle}>
        {users.length} {users.length === 1 ? "user" : "users"} in the network
      </Text>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) =>
            item.id || item.username || index.toString()
          }
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
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
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  currentUserCard: {
    backgroundColor: "#e3f2fd",
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#f0f0f0", // Background color while loading
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  profileImageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  currentUserLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#007AFF",
  },
  balance: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
