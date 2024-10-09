// TogetherClient.js
const Together = require('together-ai');
require('dotenv').config();

class TogetherClient {
  constructor(apiKey = process.env['TOGETHER_API_KEY']) {
    this.apiKey = apiKey;
    this.together = new Together({
      apiKey: this.apiKey,
    });
  }

  // Method to create a chat completion
  async chat(model, messages, stream = true, max_tokens = 500) {
    try {
      const responseStream = await this.together.chat.completions.create({
        model: model,
        messages: messages,
        stream: stream,
        max_tokens: max_tokens,
      });
      return responseStream;
    } catch (error) {
      console.error('Error creating chat completion:', error.message);
      throw error;
    }
  }
}

module.exports = TogetherClient;