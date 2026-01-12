import waiter from "./index";
import { getToken } from "./storage";

export const login = async (email: string, password: string) => {
  const response = await waiter.post("/api/auth/login", { username: email, password });
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