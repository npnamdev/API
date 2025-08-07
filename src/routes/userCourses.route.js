import { getUserCoursesWithProgress } from '../controllers/userCourses.controller.js';

export default async function (fastify, opts) {
    fastify.get('/users/:userId/courses', getUserCoursesWithProgress);
}