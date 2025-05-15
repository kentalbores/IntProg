const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  firstname: String,
  middlename: String,
  lastname: String,
  role: {
    type: [String],
    enum: ['guest', 'organizer', 'vendor'],
    default: 'guest'
  },
  email: { type: String, required: true, unique: true },
  picture: { type: String, default: null },
  onboardingCompleted: { type: Boolean, default: false },
  registeredEvents: { type: [Number], default: [] }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (this.isNew && !this.userId) {
    try {
      const highestDoc = await this.constructor.findOne({}, {}, { sort: { userId: -1 } });
      this.userId = highestDoc ? highestDoc.userId + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);