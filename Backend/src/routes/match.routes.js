import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';

const router = express.Router();

/**
 * Compute compatibility score (out of 100) and reasons between two users.
 * @param {Object} a - Onboarding answers of userA
 * @param {Object} b - Onboarding answers of userB
 * @returns {score: Number, reasons: String[]}
 */
function computeCompatibilityScore(a, b) {
  let rawScore = 0;
  const reasons = [];

  // Cleanliness (scale 1-5)
  if ('cleanliness' in a && 'cleanliness' in b) {
    const diff = Math.abs(a.cleanliness - b.cleanliness);
    if (diff === 0) {
      rawScore += 3;
      reasons.push('Both have the same cleanliness level.');
    } else if (diff === 1) {
      rawScore += 1;
      reasons.push('Cleanliness levels are close.');
    }
  }

  // Sleep Schedule
  if (a.sleepSchedule && b.sleepSchedule && a.sleepSchedule === b.sleepSchedule) {
    rawScore += 3;
    reasons.push('Both have the same sleep schedule.');
  }

  // Diet
  if (a.diet && b.diet && a.diet === b.diet) {
    rawScore += 2;
    reasons.push('Both follow the same diet.');
  }

  // Noise Tolerance
  if (a.noiseTolerance && b.noiseTolerance && a.noiseTolerance === b.noiseTolerance) {
    rawScore += 1;
    reasons.push('Both have the same noise tolerance level.');
  }

  // Goal
  if (a.goal && b.goal && a.goal === b.goal) {
    rawScore += 1;
    reasons.push('Both share similar goals.');
  }

  const maxScore = 10;
  const scoreOutOf100 = Math.round((rawScore / maxScore) * 100);

  return { score: scoreOutOf100, reasons };
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).lean();
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    if (!currentUser.onboarding || currentUser.onboarding.status !== 'completed') {
      return res.status(400).json({ message: 'Please complete onboarding survey first.' });
    }

    // Fetch other users with completed onboarding, excluding current user
    const otherUsers = await User.find({
      _id: { $ne: currentUser._id },
      'onboarding.status': 'completed',
    }).lean();

    // Calculate score and reasons (score now out of 100)
    const matches = otherUsers.map(u => {
      const { score, reasons } = computeCompatibilityScore(currentUser.onboarding.answers, u.onboarding.answers);
      return {
        userId: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        score,
        reasons,
      };
    });

    matches.sort((a, b) => b.score - a.score);

    res.json(matches.slice(0, 3));
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ message: 'Internal server error during matching.' });
  }
});

export default router;
