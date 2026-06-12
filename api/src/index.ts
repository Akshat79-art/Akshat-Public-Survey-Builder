import { Hono } from 'hono'
import { clerkMiddleware } from '@clerk/hono'
import surveyRouter from './routes/survey'
import publicRouter from './routes/public'
import userRouter from './routes/user'

import { cors } from 'hono/cors'

const app = new Hono<{ Bindings: Env }>()

// Allow CORS so our Vite dev server (localhost:5173) isn't blocked by the browser.
app.use('/api/*', cors({
  origin: '*', // For local dev, but should be strictly specified in production.
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// 0. Base Status Check
app.get('/api/health', (c) => c.json({ status: 'ok' }))

/* ------------------------------------------------------------------
// 1. Unauthenticated Routes
   ------------------------------------------------------------------
    Anonymous visitors submitting surveys 
*/
app.route('/api/public', publicRouter)

/* ------------------------------------------------------------------
// 2. Authenticated Routes (Clerk Middleware)
   ------------------------------------------------------------------
*/
/*
   clerkMiddleware verifies the JWT token sent by the React frontend on every protected request.
   If verification fails, it returns 401 Unauthorized automatically.
   It reads CLERK_SECRET_KEY from .dev.vars locally and from wrangler secrets in production. 
*/
app.use('/api/surveys/*', clerkMiddleware())
app.use('/api/users/*', clerkMiddleware())

app.route('/api/surveys', surveyRouter)
app.route('/api/users', userRouter)

export default app
