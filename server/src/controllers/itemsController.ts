import knex from "../database/connection"
import { Request, Response } from "express"

class ItemsController{
  async index(request: Request, response: Response) {
    // Get items
    const items = await knex('items').select('*');

    // Adapt information
    const serializedItems = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://192.168.15.21:3333/uploads/${item.image}`
      }
    })

    // Response
    return response.json(serializedItems);
  }
}

export default ItemsController