import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from "../../../../helper/uploadHandler";

export default Express.Router()
  

    .post("/signUp", controller.signUp)
    .post("/verifyOtp", controller.verifyOtp)