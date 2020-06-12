// Imports
import express from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import { celebrate, Joi } from 'celebrate'
import PointsController from "./controllers/pointsController";
import ItemsController from "./controllers/itemsController";

// Init router
const routes = express.Router();

// Upload config
const upload = multer(multerConfig)

// Controllers' instance
const pointsController = new PointsController()
const itemsController = new ItemsController()

// Root router
routes.get('/', (req, res) => {
  return res.json({status: 'on', version: 'API 0.1.0'});
});

// RESOURCES
// Resource :: Items
routes.get('/items', itemsController.index);

// Resource :: Points
routes.get('/points', pointsController.index);
routes.get('/points/:pointId', pointsController.show);
routes.post('/points', 
  upload.single('image'), 
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required()
    })
  },{
    abortEarly: false
  }), 
  pointsController.create);

export default routes;