import { queryParams } from "@/constanst";
import axios from "axios";

export const createOrderApi = async (token: string, data: any) => {
  const res = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/order/create`,
    data,
    {
      headers: { token: `Bearer ${token}` },
    }
  );

  return res.data;
};

export const getAllOrdersApi = async (
  token: string,
  page = queryParams.PAGE,
  limit = queryParams.LIMIT,
  order = queryParams.ORDER
) => {
  const res = await axios.get(
    `${
      import.meta.env.VITE_BASE_URL
    }/order/all?page=${page}&limit=${limit}&order=${order}`,
    {
      headers: { token: `Bearer ${token}` },
    }
  );

  return res.data;
};

export const getOrderDetailApi = async (token: string, id: string) => {
  const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/order/${id}`, {
    headers: { token: `Bearer ${token}` },
  });

  return res.data;
};

export const getUserOrdersApi = async (
  token: string,
  id: string,
  page = queryParams.PAGE,
  limit = queryParams.LIMIT,
  order = queryParams.ORDER
) => {
  const res = await axios.get(
    `${
      import.meta.env.VITE_BASE_URL
    }/order/my-orders/${id}?page=${page}&limit=${limit}&order=${order}`,
    {
      headers: { token: `Bearer ${token}` },
    }
  );

  return res.data;
};
