export const resolveBankAccount = async (accountNumber: string, bankCode: string) => {
  const response = await fetch(
    `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer sk_test_081b9aeac2d10c570a8eb0aef0e2a8ff4f61803f",
      },
    }
  );
  return response.json();
};

export const getBanks = async () => {
  const response = await fetch(
    `https://api.paystack.co/bank`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer sk_test_081b9aeac2d10c570a8eb0aef0e2a8ff4f61803f",
      },
    }
  );
  return response.json();
};
