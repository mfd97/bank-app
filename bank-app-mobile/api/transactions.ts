import waiter from "./index";
import { getToken } from "./storage";

export const deposit = async (amount: number) => {
  const token = await getToken();
  const response = await waiter.post(
    "/api/transactions/deposit",
    { amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("response.data", response.data);
  return response.data;
};

export const transfer = async (amount: number, toUserId: string) => {
  const token = await getToken();
  const response = await waiter.post(
    "/api/transactions/transfer",
    { amount, toUserId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("response.data", response.data);
  return response.data;
};