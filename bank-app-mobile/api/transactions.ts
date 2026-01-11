import waiter from "./index";

export const deposit = async (amount: number) => {
  const response = await waiter.post ("/api/transactions/deposit", amount);
  console.log ("response.data", response.data);
  return response.data;
};