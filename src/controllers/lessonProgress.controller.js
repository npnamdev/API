import UserProgress from '../models/lessonProgress.model.js';


export const upsertUserProgress = async (req, res) => {
  try {
    const { userId, lessonId, completed = true } = req.body;

    const result = await UserProgress.findOneAndUpdate(
      { userId, lessonId },
      { completed, updatedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.code(200).send(result);
  } catch (err) {
    return res.code(500).send({ error: err.message });
  }
};

export const getLastLesson = async (req, res) => {
  try {
    const { userId } = req.params;

    const lastLesson = await UserProgress
      .findOne({ userId })
      .sort({ updatedAt: -1 })
      .populate('lessonId');

    if (!lastLesson) return res.code(404).send({ message: 'No lesson found' });

    return res.send(lastLesson);
  } catch (err) {
    return res.code(500).send({ error: err.message });
  }
};
