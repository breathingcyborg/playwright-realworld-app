import { getAllUsers } from "./database";

type Test = "login" | "bank_accounts" | "new_transactions" | "transaction_details" | "transactions_feed" | "user_settings";

/**
 *
 * Splitting users for isolating individual tests.
 *
 * We have 30 (process.env.SEED_USERBASE_SIZE) users we need to allocate
 * each test a different user, so tests dont interfere.
 *
 * A better way would be to create  unique user for each test
 * but this would require changes to backend apis.
 *
 */
export async function getUsersForTest(test: Test) {
  const userBaseSize = parseInt(process.env.SEED_USERBASE_SIZE || "0");

  const { results: users } = await getAllUsers();

  if (test === "login") {
    return [users[0]];
  }

  if (test === "bank_accounts") {
    return [users[1]];
  }

  if (test === "new_transactions") {
    return [users[2], users[3]];
  }

  if (test === "transaction_details") {
    return [users[4], users[5], users[6]];
  }

  if (test === 'transactions_feed') {
    return [ users[7] ];
  }

  if (test === 'user_settings') {
    return [ users[8] ]
  }

  return [];
}
