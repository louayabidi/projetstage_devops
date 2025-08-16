const bcrypt = require('bcrypt');
const { createHmac } = require('crypto');

module.exports = {
  doHash: async (plainPassword, saltRounds) => {
    try {
      return await bcrypt.hash(plainPassword, saltRounds);
    } catch (error) {
      console.error('Hashing error:', error);
      throw error;
    }
  },

  doHashValidation: async (plainPassword, hashedPassword) => {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Hash comparison error:', error);
      return false;
    }
  },

  hmacProcess: (value, key) => {
    return createHmac('sha256', key).update(value).digest('hex');
  }
};