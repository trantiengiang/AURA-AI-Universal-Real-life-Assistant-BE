const groqService = require('./groqService');
const gptService = require('./gptService');
const geminiService = require('./geminiService');
const stabilityService = require('./stabilityService');
const translateService = require('./translateService');
const whisperService = require('./whisperService');
const logger = require('../utils/logger');

class OrchestratorService {
  async processComplexRequest(userMessage, userId, context = {}) {
    try {
      logger.info(`Processing complex request from user ${userId}: ${userMessage}`);

      // Step 1: Analyze intent using Groq (fast and efficient)
      const intentResult = await groqService.analyzeIntent(userMessage);
      
      if (!intentResult.success) {
        return {
          success: false,
          error: 'Failed to analyze user intent'
        };
      }

      const intent = intentResult.data;
      logger.info(`Detected intent: ${intent.intent} with actions: ${intent.actions.join(', ')}`);

      // Step 2: Execute actions based on intent
      const results = await this.executeActions(intent, userMessage, userId, context);

      // Step 3: Generate final response using GPT-4 for comprehensive output
      const finalResponse = await this.generateFinalResponse(intent, results, userMessage);

      return {
        success: true,
        data: {
          intent: intent,
          results: results,
          finalResponse: finalResponse,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Orchestrator error:', error);
      return {
        success: false,
        error: 'Failed to process complex request'
      };
    }
  }

  async executeActions(intent, userMessage, userId, context) {
    const results = {};

    for (const action of intent.actions) {
      try {
        switch (action) {
          case 'analyze_food_image':
            if (context.imageUrl) {
              results.foodAnalysis = await this.analyzeFoodImage(context.imageUrl);
            }
            break;

          case 'provide_nutrition_advice':
            if (context.healthData) {
              results.nutritionAdvice = await gptService.generateHealthAdvice(context.healthData);
            }
            break;

          case 'analyze_finance':
            if (context.financeData) {
              results.financeInsight = await gptService.generateFinanceInsight(context.financeData);
            }
            break;

          case 'translate_text':
            if (intent.entities.toLanguage && intent.entities.fromText) {
              results.translation = await translateService.translateText(
                intent.entities.fromText,
                intent.entities.fromLanguage || 'auto',
                intent.entities.toLanguage
              );
            }
            break;

          case 'generate_image':
            if (intent.entities.imagePrompt) {
              results.imageGeneration = await stabilityService.generateImage(
                intent.entities.imagePrompt,
                { style: intent.entities.imageStyle || 'photographic' }
              );
            }
            break;

          case 'transcribe_audio':
            if (context.audioBuffer) {
              results.transcription = await whisperService.transcribeVoiceNote(
                context.audioBuffer,
                intent.entities.language || 'en'
              );
            }
            break;

          case 'create_note':
            results.noteCreation = {
              success: true,
              data: {
                title: intent.entities.noteTitle || 'New Note',
                content: userMessage,
                timestamp: new Date().toISOString()
              }
            };
            break;

          default:
            logger.warn(`Unknown action: ${action}`);
        }
      } catch (error) {
        logger.error(`Error executing action ${action}:`, error);
        results[action] = {
          success: false,
          error: `Failed to execute ${action}`
        };
      }
    }

    return results;
  }

  async analyzeFoodImage(imageUrl) {
    try {
      // Use Gemini Vision for food analysis
      const analysis = await geminiService.analyzeFoodImage(imageUrl);
      
      if (analysis.success) {
        // Get additional insights from GPT
        const insights = await gptService.generateText(
          `Based on this food analysis: ${analysis.data}\n\nProvide additional health insights and recommendations.`,
          {
            systemPrompt: 'You are a nutritionist. Provide detailed health insights based on food analysis.'
          }
        );

        return {
          success: true,
          data: {
            analysis: analysis.data,
            insights: insights.success ? insights.data : null
          }
        };
      }

      return analysis;
    } catch (error) {
      logger.error('Food image analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze food image'
      };
    }
  }

  async generateFinalResponse(intent, results, originalMessage) {
    try {
      const prompt = `Based on the user's request and the following results, provide a comprehensive response:

Original message: "${originalMessage}"
Intent: ${intent.intent}
Actions performed: ${intent.actions.join(', ')}

Results:
${JSON.stringify(results, null, 2)}

Please provide a helpful, comprehensive response that addresses the user's needs.`;

      const response = await gptService.generateText(prompt, {
        systemPrompt: 'You are AURA, an AI Universal Real-life Assistant. Provide helpful, comprehensive responses based on the analysis results.',
        maxTokens: 1500
      });

      return response;
    } catch (error) {
      logger.error('Final response generation error:', error);
      return {
        success: false,
        error: 'Failed to generate final response'
      };
    }
  }

  async processMultiModalRequest(text, imageBuffer, audioBuffer, userId) {
    try {
      const results = {};

      // Process text
      if (text) {
        const textResult = await groqService.quickResponse(text);
        results.textResponse = textResult;
      }

      // Process image
      if (imageBuffer) {
        const imageResult = await geminiService.analyzeImage(imageBuffer, 'Analyze this image and describe what you see.');
        results.imageAnalysis = imageResult;
      }

      // Process audio
      if (audioBuffer) {
        const audioResult = await whisperService.transcribeVoiceNote(audioBuffer);
        results.audioTranscription = audioResult;
      }

      // Generate comprehensive response
      const comprehensiveResponse = await this.generateMultiModalResponse(results, text);

      return {
        success: true,
        data: {
          results: results,
          comprehensiveResponse: comprehensiveResponse
        }
      };

    } catch (error) {
      logger.error('Multi-modal processing error:', error);
      return {
        success: false,
        error: 'Failed to process multi-modal request'
      };
    }
  }

  async generateMultiModalResponse(results, originalText) {
    try {
      const prompt = `Based on the following multi-modal analysis, provide a comprehensive response:

Original text: "${originalText || 'No text provided'}"

Text analysis: ${results.textResponse?.success ? results.textResponse.data : 'No text analysis'}
Image analysis: ${results.imageAnalysis?.success ? results.imageAnalysis.data : 'No image analysis'}
Audio transcription: ${results.audioTranscription?.success ? results.audioTranscription.data.text : 'No audio transcription'}

Provide a helpful, integrated response that combines all available information.`;

      return await gptService.generateText(prompt, {
        systemPrompt: 'You are AURA, an AI assistant that can process text, images, and audio. Provide integrated, helpful responses.',
        maxTokens: 1500
      });
    } catch (error) {
      logger.error('Multi-modal response generation error:', error);
      return {
        success: false,
        error: 'Failed to generate multi-modal response'
      };
    }
  }
}

module.exports = new OrchestratorService();


