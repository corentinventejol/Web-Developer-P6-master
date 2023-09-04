const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true, min: 1, max: 10 },
  like: { type: Number, default: 0 },
  dislike: { type: Number, default: 0 },
  usersLikes: [{ type: String, ref: 'User' }],
  usersdislikes : [{ type: String, ref: 'User' }]
});

module.exports = mongoose.model('Sauce', sauceSchema);
