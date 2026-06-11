import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const surveyRouter = new Hono<{ Bindings: Env, Variables: { clerkAuth: { userId: string } } }>()

// Zod Schema to strictly validate the incoming JSON body
const createSurveySchema = z.object({
  title: z.string(),
  url_slug: z.string(),
})

const updateSurveySchema = z.object({
  brand_color: z.string().optional(),
  logo_url: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    question_type: z.string(),
    question_text: z.string(),
    order_index: z.number(),
    is_required: z.boolean().default(false),
    type_specific_options: z.record(z.string(), z.unknown()).optional() // Flexibly cast back into JSON string
  }))
})

/**
 * Fetches all surveys belonging to the authenticated user.
 * It queries the database securely using the user's ID extracted from the auth middleware.
 * @param c - The Hono Context containing the environment bindings and authenticated user info.
 * @returns JSON response containing an array of survey objects.
 */
surveyRouter.get('/', async (c) => {
  try {
    const userId = c.get('clerkAuth').userId;
    const { results } = await c.env.DB.prepare('SELECT * FROM surveys WHERE user_id = ?').bind(userId).all();
    return c.json({ surveys: results });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

/**
 * Creates a new survey for the authenticated user based on the provided JSON payload.
 * It validates the payload using Zod before inserting it into the surveys table.
 * @param c - The Hono Context containing the DB binding, auth user, and validated body.
 * @returns JSON response containing the newly created survey ID and a success message.
 */
surveyRouter.post('/', zValidator('json', createSurveySchema), async (c) => {
  try {
    const userId = c.get('clerkAuth').userId;
    const { title, url_slug } = c.req.valid('json');
    const id = crypto.randomUUID(); // Build-in Web Crypto UUID generation
    
    await c.env.DB.prepare(
      'INSERT INTO surveys (id, user_id, title, url_slug) VALUES (?, ?, ?, ?)'
    ).bind(id, userId, title, url_slug).run();

    return c.json({ success: true, id });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

/**
 * Fetches the questions specifically belonging to a given survey ID for the builder UI.
 * Verifies that the survey actually belongs to the user requesting it.
 * @param c - The Hono Context and route params containing the survey ID.
 * @returns JSON response containing the survey details and an array of its questions.
 */
surveyRouter.get('/:id', async (c) => {
  try {
    const userId = c.get('clerkAuth').userId;
    const surveyId = c.req.param('id');
    
    const survey = await c.env.DB.prepare('SELECT * FROM surveys WHERE id = ? AND user_id = ?').bind(surveyId, userId).first();
    if (!survey) return c.json({ error: 'Survey not found or unauthorized' }, 404);

    const { results: questions } = await c.env.DB.prepare('SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC').bind(surveyId).all();
    return c.json({ survey, questions });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

/**
 * Updates a survey's visual branding and its entire array of questions.
 * It deletes all existing questions and safely re-inserts the updated array to mimic a full state sync.
 * @param c - The Hono Context containing the target survey ID and validated payload.
 * @returns JSON response indicating successful overwrite.
 */
surveyRouter.put('/:id', zValidator('json', updateSurveySchema), async (c) => {
  try {
    const userId = c.get('clerkAuth').userId;
    const surveyId = c.req.param('id');
    const { brand_color, logo_url, questions } = c.req.valid('json');

    // Security checkpoint: Verify ownership
    const survey = await c.env.DB.prepare('SELECT id FROM surveys WHERE id = ? AND user_id = ?').bind(surveyId, userId).first();
    if (!survey) return c.json({ error: 'Unauthorized' }, 401);

    // 1. Update branding directly on the survey row
    await c.env.DB.prepare(
      'UPDATE surveys SET brand_color = ?, logo_url = ? WHERE id = ?'
    ).bind(brand_color || '#000000', logo_url || null, surveyId).run();

    // 2. Clear out old questions
    await c.env.DB.prepare('DELETE FROM questions WHERE survey_id = ?').bind(surveyId).run();

    // 3. Batch insert new questions safely
    if (questions.length > 0) {
      const statements = questions.map(q => {
        return c.env.DB.prepare(
          'INSERT INTO questions (id, survey_id, question_type, question_text, order_index, is_required, type_specific_options) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          q.id, surveyId, q.question_type, q.question_text, q.order_index, 
          q.is_required ? 1 : 0, // SQLite requires booleans to map to integers
          q.type_specific_options ? JSON.stringify(q.type_specific_options) : null
        )
      });
      await c.env.DB.batch(statements);
    }

    return c.json({ success: true, message: 'Survey successfully updated' });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

/**
 * Retrieves all anonymous responses submitted for a specific survey ID.
 * Used by the creator to view analytics on their dashboard.
 * @param c - The Hono Context and route params containing the survey ID.
 * @returns JSON response containing an array of all response objects.
 */
surveyRouter.get('/:id/responses', async (c) => {
  try {
    const userId = c.get('clerkAuth').userId;
    const surveyId = c.req.param('id');
    
    // Security checkpoint: Ensure the user actually owns the survey before returning responses
    const survey = await c.env.DB.prepare('SELECT id FROM surveys WHERE id = ? AND user_id = ?').bind(surveyId, userId).first();
    if (!survey) return c.json({ error: 'Unauthorized' }, 401);

    const { results } = await c.env.DB.prepare('SELECT * FROM responses WHERE survey_id = ? ORDER BY submitted_at DESC').bind(surveyId).all();
    return c.json({ responses: results });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

export default surveyRouter
