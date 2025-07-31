import { locations } from "./telegram";

export default function handler(req, res) {
  res.status(200).json(locations);
}