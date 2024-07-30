const User = require('../models/User');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.status(201).send('User registered');
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.status(200).send('User logged in');
  } else {
    res.status(401).send('Invalid credentials');
  }
};
