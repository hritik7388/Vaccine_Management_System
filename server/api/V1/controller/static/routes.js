import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from "../../../../helper/uploadHandler";



export default Express.Router()
    .use(upload.uploadFile)
    .post('/addStaticContent', controller.addStaticContent)
    .get('/viewStaticContent', controller.viewStaticContent)
    .put('/editStaticContent', controller.editStaticContent)
    .get('/staticContentList', controller.staticContentList)

     
    
    
    
    .use(auth.verifyToken) 
    .post('/addFAQ', controller.addFAQ)
    .get('/viewFAQ', controller.viewFAQ)
    .get('/faqList', controller.faqList)
    .put('/editFAQ', controller.editFAQ)
    .delete('/deleteFAQ', controller.deleteFAQ)
    .delete('/deleteStaticContent', controller.deleteStaticContent)
    




