import waiter from "./index";

export const login = async (email: string, password: string) => {
  const response = await waiter.post("/api/auth/login", { email, password });
  return response.data;
};