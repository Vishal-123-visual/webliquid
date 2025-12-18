import { Router } from "express";
import {
  addBatchFormDataController,
  deleteSingleBatchDataByIdController,
  getAllBatchesDataController,
  getSingleBatchByIdController,
  updateSingleBatchDataByIdController,
} from "../controllers/attendance/batch.controllers.js";

const router = Router();

router
  .route("/")
  .post(addBatchFormDataController)
  .get(getAllBatchesDataController);

router
  .route("/:id")
  .get(getSingleBatchByIdController)
  .put(updateSingleBatchDataByIdController)
  .delete(deleteSingleBatchDataByIdController);

export default router;
