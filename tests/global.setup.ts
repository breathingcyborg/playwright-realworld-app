import { test as setup } from '@playwright/test';
import { seed } from './helpers/database';

setup('seed database', async ({ }) => {
    await seed()
});