const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().integer().min(1).max(120).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const healthAnalysisSchema = Joi.object({
  weight: Joi.number().positive().optional(),
  height: Joi.number().positive().optional(),
  calories: Joi.number().integer().min(0).optional(),
  sleep: Joi.number().integer().min(0).max(24).optional(),
  exercise: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional()
});

const financeRecordSchema = Joi.object({
  category: Joi.string().required(),
  amount: Joi.number().required(),
  note: Joi.string().optional(),
  type: Joi.string().valid('income', 'expense').required(),
  date: Joi.date().optional()
});

const noteSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
  isVoice: Joi.boolean().optional()
});

const translationSchema = Joi.object({
  inputText: Joi.string().required(),
  fromLang: Joi.string().length(2).required(),
  toLang: Joi.string().length(2).required(),
  isVoice: Joi.boolean().optional()
});

const chatSchema = Joi.object({
  message: Joi.string().required(),
  aiModel: Joi.string().valid('gpt-4', 'groq', 'gemini').optional(),
  context: Joi.string().optional()
});

const imageGenerationSchema = Joi.object({
  prompt: Joi.string().required(),
  style: Joi.string().optional(),
  size: Joi.string().valid('256x256', '512x512', '1024x1024').optional()
});

const orchestratorSchema = Joi.object({
  task: Joi.string().required(),
  params: Joi.object().required()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  healthAnalysisSchema,
  financeRecordSchema,
  noteSchema,
  translationSchema,
  chatSchema,
  imageGenerationSchema,
  orchestratorSchema,
  validate
};




