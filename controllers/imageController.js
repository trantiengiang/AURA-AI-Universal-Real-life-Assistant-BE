const stabilityService = require('../services/stabilityService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

class ImageController {
  async generateImage(req, res) {
    try {
      const { prompt, style, size } = req.body;

      // Validate required fields
      if (!prompt) {
        return res.status(400).json({
          status: 'error',
          message: 'Prompt is required'
        });
      }

      // Parse size
      let width = 1024, height = 1024;
      if (size) {
        const [w, h] = size.split('x').map(Number);
        if (w && h) {
          width = w;
          height = h;
        }
      }

      const result = await stabilityService.generateImage(prompt, {
        style: style || 'photographic',
        width,
        height
      });

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Image generated for user: ${req.user?.id || 'anonymous'}`);

      res.json({
        status: 'success',
        message: 'Image generated successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Generate image error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Image generation failed'
      });
    }
  }

  async generateHealthIllustration(req, res) {
    try {
      const { healthData } = req.body;

      const result = await stabilityService.generateHealthIllustration(healthData);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Health illustration generated for user: ${req.user?.id || 'anonymous'}`);

      res.json({
        status: 'success',
        message: 'Health illustration generated successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Generate health illustration error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health illustration generation failed'
      });
    }
  }

  async generateFinanceChart(req, res) {
    try {
      const { financeData } = req.body;

      const result = await stabilityService.generateFinanceChart(financeData);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Finance chart generated for user: ${req.user?.id || 'anonymous'}`);

      res.json({
        status: 'success',
        message: 'Finance chart generated successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Generate finance chart error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Finance chart generation failed'
      });
    }
  }

  async generateNoteIllustration(req, res) {
    try {
      const { noteContent } = req.body;

      if (!noteContent) {
        return res.status(400).json({
          status: 'error',
          message: 'Note content is required'
        });
      }

      const result = await stabilityService.generateNoteIllustration(noteContent);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Note illustration generated for user: ${req.user?.id || 'anonymous'}`);

      res.json({
        status: 'success',
        message: 'Note illustration generated successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Generate note illustration error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Note illustration generation failed'
      });
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Image file is required'
        });
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;

      logger.info(`Image uploaded: ${req.file.filename}`);

      res.json({
        status: 'success',
        message: 'Image uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: imageUrl
        }
      });
    } catch (error) {
      logger.error('Upload image error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Image upload failed'
      });
    }
  }

  async getImageStyles(req, res) {
    try {
      const styles = [
        'photographic',
        'digital-art',
        'comic-book',
        'fantasy-art',
        'analog-film',
        'neon-punk',
        'isometric',
        'low-poly',
        'origami',
        'line-art',
        'watercolor',
        'pixel-art',
        '3d-model',
        'cinematic',
        'anime',
        'cyberpunk',
        'steampunk',
        'vaporwave',
        'medical-illustration',
        'infographic',
        'illustration'
      ];

      res.json({
        status: 'success',
        data: {
          styles,
          descriptions: {
            'photographic': 'Realistic photographic style',
            'digital-art': 'Digital artwork style',
            'comic-book': 'Comic book illustration style',
            'fantasy-art': 'Fantasy artwork style',
            'analog-film': 'Analog film photography style',
            'neon-punk': 'Neon punk aesthetic',
            'isometric': 'Isometric 3D style',
            'low-poly': 'Low polygon 3D style',
            'origami': 'Origami paper art style',
            'line-art': 'Line art illustration',
            'watercolor': 'Watercolor painting style',
            'pixel-art': 'Pixel art style',
            '3d-model': '3D rendered model style',
            'cinematic': 'Cinematic movie style',
            'anime': 'Anime/manga style',
            'cyberpunk': 'Cyberpunk futuristic style',
            'steampunk': 'Steampunk Victorian style',
            'vaporwave': 'Vaporwave aesthetic',
            'medical-illustration': 'Medical/scientific illustration',
            'infographic': 'Infographic design style',
            'illustration': 'General illustration style'
          }
        }
      });
    } catch (error) {
      logger.error('Get image styles error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get image styles'
      });
    }
  }

  async getImageSizes(req, res) {
    try {
      const sizes = [
        { value: '256x256', label: '256x256 (Small)', width: 256, height: 256 },
        { value: '512x512', label: '512x512 (Medium)', width: 512, height: 512 },
        { value: '1024x1024', label: '1024x1024 (Large)', width: 1024, height: 1024 },
        { value: '1024x768', label: '1024x768 (Landscape)', width: 1024, height: 768 },
        { value: '768x1024', label: '768x1024 (Portrait)', width: 768, height: 1024 }
      ];

      res.json({
        status: 'success',
        data: sizes
      });
    } catch (error) {
      logger.error('Get image sizes error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get image sizes'
      });
    }
  }
}

// Export both controller and upload middleware
module.exports = {
  controller: new ImageController(),
  upload: upload.single('image')
};




