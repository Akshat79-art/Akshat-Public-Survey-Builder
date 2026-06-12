import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const publicRouter = new Hono<{ Bindings: Env }>()

// Schema allows completely flexible answers while ensuring it comes in as a JSON structure.
const responseSchema = z.object({
  answers: z.record(z.string(), z.unknown()) // Validates that 'answers' is a map/object of string keys to any value.
})

/**
 * Fetches a survey and its questions using the public URL slug.
 * This route is unauthenticated so anyone with the link can load the survey.
 * @param c - The Hono Context and route params containing the public url_slug.
 * @returns JSON response with the survey branding and ordered questions.
 */
publicRouter.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const survey = await c.env.DB.prepare('SELECT id, title, brand_color, logo_url FROM surveys WHERE url_slug = ?').bind(slug).first();
    if (!survey) return c.json({ error: 'Survey not found or inactive' }, 404);

    const { results: rows } = await c.env.DB.prepare('SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC').bind(survey.id).all();
    const questions = rows.map((q: any) => ({
      ...q,
      is_required: q.is_required === 1 || q.is_required === true,
      type_specific_options: q.type_specific_options ? JSON.parse(q.type_specific_options) : null,
    }));
    return c.json({ survey, questions });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

/**
 * Submits an anonymous participant's answers to a specific survey.
 * It accepts a JSON object of answers mapped by question IDs and records it in the DB.
 * @param c - The Hono Context containing the payload and the target url_slug.
 * @returns JSON response indicating a successful submission.
 */
publicRouter.post('/:slug/responses', zValidator('json', responseSchema), async (c) => {
  try {
    const slug = c.req.param('slug');
    const { answers } = c.req.valid('json');
    
    // Safety check: Make sure they are trying to answer a survey that exists
    const survey = await c.env.DB.prepare('SELECT id FROM surveys WHERE url_slug = ?').bind(slug).first();
    if (!survey) return c.json({ error: 'Survey not found' }, 404);
  
    const responseId = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO responses (id, survey_id, answers) VALUES (?, ?, ?)'
    ).bind(responseId, survey.id, JSON.stringify(answers)).run();
  
    return c.json({ success: true, message: 'Your response was submitted successfully.' });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

export default publicRouter
