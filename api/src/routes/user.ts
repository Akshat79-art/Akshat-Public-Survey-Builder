import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { getAuth } from '@clerk/hono'

const userRouter = new Hono<{ Bindings: Env }>()

const syncUserSchema = z.object({
  email: z.string().email(), // Zod natively validates this is formatted exactly like an email
  username: z.string()       // Compulsory field! The frontend MUST provide this.
})

/**
 * Synchronizes the Clerk user with our D1 SQLite database upon first login.
 * It checks if the Clerk user ID exists in the DB, and if not, silently inserts it.
 * @param c - The Hono Context containing the authenticated Clerk user ID and email payload.
 * @returns JSON response indicating whether the sync operation succeeded.
 */
userRouter.post('/sync', zValidator('json', syncUserSchema), async (c) => {
  try {
    const auth = getAuth(c);
    if (!auth.userId) return c.json({ error: 'Unauthorized' }, 401);
    const { email, username } = c.req.valid('json');

    const { success } = await c.env.DB.prepare(
      'INSERT OR IGNORE INTO users (id, email, username) VALUES (?, ?, ?)'
    ).bind(auth.userId, email, username).run();

    // Check if D1 reported a failure
    if (!success) {
      return c.json({ success: false, error: 'Failed to synchronize with database' }, 500);
    }

    return c.json({ success: true, synced: true });
  } catch (error: any) {
    console.error('POST /api/users/sync error:', error);
    return c.json({ success: false, error: error.message }, 500); // Catch any unexpected exceptions (like network drops or malformed queries)
  }
})

export default userRouter
