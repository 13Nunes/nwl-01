import knex from "../database/connection"
import {Request, Response} from "express"

class PointsCrontoller{
  async index (request: Request, response: Response) {
    // Query params
    const {city, uf, items} = request.query;

    // Clear item + parse item
    const parsed_items = String(items)
      .split(",")
      .map(item => Number(item.trim()));

    // Get points / points filtered
    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsed_items)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*")

    // Serialize infos
    const serializedPoint = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.15.21:3333/uploads/${point.image}`,
      };
    });

    // Response
    return response.json(serializedPoint);
  }

  async create (request: Request, response: Response) {
    // Post data
    const {
      name,
      email,
      whatsapp,
      city,
      uf,
      latitude,
      longitude,
      items
    } = request.body;

    // Init transation
    const trx = await knex.transaction()

    // Save point
    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };
    const pointIds = await trx("points").insert(point)
    const point_id = pointIds[0];

    // Save Items from point
    const pointItems = items
      .split(',')
      .map((item: string)=> Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });
    await trx('point_items').insert(pointItems);

    // Transaction :: Commit
    await trx.commit();

    // Response
    return response.json({
      id: point_id,
      ...point,
    });
  }

  async show(request: Request, response: Response){
    // Param data
    const {pointId} = request.params
    
    // Get point
    const point = await knex("points").where("id", pointId).first()

    // Validation
    if (!point) {
      return response.status(400).json({message: "Point not found."})
    }

    // Prepare info
    const serializedPoint = {
      ...point,
      image_url: `http://192.168.15.21:3333/uploads/${point.image}`,
    };

    // Get point items
    const items = await knex("items")
        .join("point_items", "items.id", "=", "point_items.item_id")
        .where("point_items.point_id", pointId)
        .select("items.title")

    // Response
    return response.json({point: serializedPoint, items})
  }
}

export default PointsCrontoller