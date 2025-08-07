import { upsertLessonProgress, getLastLessonProgress } from '../controllers/lessonProgress.controller';

export default async function lessonProgressRoutes(fastify, opts) {
    fastify.post('/lesson-progress', upsertLessonProgress);
    fastify.get('/lesson-progress/last/:userId', getLastLessonProgress);
}
