import { Transaction, User } from "models";
import { backendAxios } from "./backend-axios";

export async function getAllUsers() {
  const { data } = await backendAxios.get<{ results: User[] }>("/testData/users");
  return data;
}

export async function seed() {
  await backendAxios.post<{ results: User[] }>("/testData/seed");
}

export async function getAllTransactions() {
  const { data } = await backendAxios.get<{ results: Transaction[] }>("/testData/transactions");
  return data;
}
