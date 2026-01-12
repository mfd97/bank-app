import waiter from "./index";
import { getToken } from "./storage";

export const login = async (username: string, password: string) => {
  const response = await waiter.post("/api/auth/login", { username, password });
  console.log ("response.data", response.data);
  return response.data;
};

export const getMe = async () => {
  const token = await getToken();
  const response = await waiter.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getAllUsers = async () => {
  const token = await getToken();
  try {
    // Try /api/users (common pattern)
    const response = await waiter.get("/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.log("Error fetching users - Status:", error.response?.status);
    console.log("Error URL:", error.config?.url);
    console.log("Error data:", error.response?.data);
    // Re-throw to let the component handle it
    throw error;
  }
};

export const register = async (username: string, password: string, imageUri: string | null) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  
  if (imageUri) {
    // Extract filename and type from URI
    const filename = imageUri.split("/").pop() || "profile.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";
    
    formData.append("image", {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);
  }

  const response = await waiter.post("/api/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};