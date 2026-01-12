import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Link, router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { register } from "../../api/auth";
import { setToken } from "../../api/storage";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["register"],
    mutationFn: () => register(username, password, imageUri),
    onSuccess: async (data) => {
      console.log("Registration success:", data);
      setErrorMessage("");
      // Store the token if it exists in the response
      const token = data?.token || data?.data?.token;
      if (token) {
        await setToken(token);
      }
      // Invalidate user query to fetch new user data
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      router.push("/(tabs)/home");
    },
    onError: (err: any) => {
      console.log("Registration error:", err);
      // Extract error message from axios error response
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed. Please try again.";
      setErrorMessage(errorMsg);
      Alert.alert("Registration Failed", errorMsg);
    },
  });

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload a profile picture!"
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setErrorMessage("");
    }
  };

  const handleRegister = () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    setErrorMessage("");
    mutate();
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setErrorMessage("");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrorMessage("");
  };

  const content = (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Profile Picture Section */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.profileImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={pickImage}
            >
              <Text style={styles.imagePlaceholderText}>📷</Text>
              <Text style={styles.imagePlaceholderLabel}>Add Photo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={pickImage}
          >
            <Text style={styles.changeImageText}>
              {imageUri ? "Change Photo" : "Upload Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
            autoComplete="username"
            textContentType="username"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={styles.eyeIconText}>
              {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!username || !password || isPending) && styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={!username || !password || isPending}
        >
          <Text style={styles.buttonText}>
            {isPending ? "Creating Account..." : "Register"}
          </Text>
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Link href="./" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );

  if (Platform.OS === "web") {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    borderColor: "#ff3b30",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff3b30",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    marginBottom: 12,
  },
  imagePlaceholderText: {
    fontSize: 40,
    marginBottom: 4,
  },
  imagePlaceholderLabel: {
    fontSize: 12,
    color: "#666",
  },
  changeImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeImageText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#1a1a1a",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 38,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
  button: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
