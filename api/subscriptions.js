import { createGroupedHandler } from '../server/api-router.js';

export const config = { api: { bodyParser: false } };

export default createGroupedHandler('subscriptions');
