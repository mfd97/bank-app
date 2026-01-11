import waiter from "./index";

export const login = async (email: string, password: string) => {
  const response = await waiter.post("/api/auth/login", { username: email, password });
  console.log ("response.data", response.data);
  return response.data;
};