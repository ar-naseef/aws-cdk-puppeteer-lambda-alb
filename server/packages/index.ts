export const wrapResponse = (
  body: {
    status: "ok" | "error";
    message: string;
    code?: string;
    data?: any;
    error?: any;
  },
  statusCode: number = 200
) => {
  return {
    statusCode,
    isBase64Encoded: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "Content-Type": "application/json",
    },
    // body,
    body: JSON.stringify(body),
  };
};
