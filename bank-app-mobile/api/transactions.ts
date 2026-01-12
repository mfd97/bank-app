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