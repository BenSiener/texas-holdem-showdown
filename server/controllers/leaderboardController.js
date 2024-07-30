const Leaderboard = require('../models/Leaderboard');

exports.getLeaderboard = async (req, res) => {
  const leaderboard = await Leaderboard.find().sort({ score: -1 }).limit(10);
  res.status(200).json(leaderboard);
};
