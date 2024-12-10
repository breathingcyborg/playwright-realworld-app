import { getAllUsers } from "./database"

type Test = 'login'

/**
 * We have 30 (process.env.SEED_USERBASE_SIZE) users we need to allocate 
 * each test a different user, so tests dont interfere.
 * 
 * A better way would be to create  unique user for each test
 * but this would require changes to backend apis.
 * 
 */
export async function getUsersForTest(test: Test) {
    const userBaseSize = parseInt(process.env.SEED_USERBASE_SIZE || '0');

    const { results: users } = await getAllUsers();
    if (test === 'login') {
        return [ users[0] ];
    }

    return [];
}