import Joi from "joi";
import _ from "lodash";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import fs from "fs"; 

//import { staticServices } from "../../services/static";
// const {
//   createStaticContent,
//   findStaticContent,
//   updateStaticContent,
//   staticContentList,
// } = staticServices;

 

//import { faqServices } from "../../services/faq";
// const { createFAQ, findFAQ, updateFAQ, faqListWithPagination, FAQList } =
//   faqServices;

// import { userServices } from "../../services/user";
// const { findUser } = userServices;
import status from "../../../../enum/status";
import userType from "../../../../enum/userType"; 

export class staticController {
  //**************************  Static management Start *************************************************/
  /**
   * @swagger
   * /static/addStaticContent:
   *   post:
   *     tags:
   *       - STATIC
   *     description: addStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: admin token
   *         in: header
   *         required: true
   *       - name: file
   *         description: pdf file to add static content.
   *         in: formData
   *         type: file
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async addStaticContent(req, res, next) {

    try {

      console.log("🚀 ~ staticController ~ addStaticContent ~ req.files[0].path:", req.files[0].path)
      let imgUrl1 = await commonFunction.getImageUrl(req.files);
      const pdfFilePath = req.files[0].path;
      const dataBuffer = fs.readFileSync(pdfFilePath);
      const data = await pdf(dataBuffer);
      const textContent = data.text;
      const typePattern = /type:(.*)/i;
      const titlePattern = /title:(.*)/i;
      const descriptionPattern = /description:(.*)/i;
      const parsedData = {};
      const typeMatch = textContent.match(typePattern);
      const titleMatch = textContent.match(titlePattern);
      const descriptionMatch = textContent.match(descriptionPattern);
      if (typeMatch) {
        parsedData.type = typeMatch[1].trim();
      }
      if (titleMatch) {
        parsedData.title = titleMatch[1].trim();
      }
      if (descriptionMatch) {
        parsedData.description = descriptionMatch[1].trim();
      }
      const staticDataAdeed = await createStaticContent(parsedData);
      console.log("🚀 ~ staticController ~ addStaticContent ~ imgUrl1:", parsedData)
      if(staticDataAdeed){
        return res.status(200).json({staticDataAdeed, responseCode: 200, responseMessage: "static Data added successfully" });
      }
    } catch (error) {
      console.log("🚀 ~ staticController ~ addStaticContent ~ error:", error)
      return next(error);
    }
  }

  /**
   * @swagger
   * /static/viewStaticContent:
   *   get:
   *     tags:
   *       - STATIC
   *     description: viewStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: type
   *         description: type
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async viewStaticContent(req, res, next) {
    const validationSchema = {
      type: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.query, validationSchema);
      var result = await findStaticContent({ type: validatedBody.type });
      if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /static/editStaticContent:
   *   put:
   *     tags:
   *       - STATIC
   *     description: editStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: editStaticContent
   *         description: editStaticContent
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/editStaticContent'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async editStaticContent(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
      title: Joi.string().optional(),
      description: Joi.string().optional(),
      url: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let staticRes = await findStaticContent({ _id: req.body._id });
      if (!staticRes) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      var result = await updateStaticContent(
        { _id: validatedBody._id },
        validatedBody
      );
      return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /static/staticContentList:
   *   get:
   *     tags:
   *       - STATIC
   *     description: staticContentList
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async staticContentList(req, res, next) {
    try {
      var result = await staticContentList({ status: { $ne: status.DELETE } });
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  //**************************  Static management End *************************************************/

 

  //**************************  FAQs management Start *****************************************************/

  /**
   * @swagger
   * /faq/addFAQ:
   *   post:
   *     tags:
   *       - FAQ_MANAGEMENT
   *     description: addFAQ
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: addFAQ
   *         description: addFAQ
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/addFAQ'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async addFAQ(req, res, next) {
    const validationSchema = {
      question: Joi.string().required(),
      answer: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({ _id: req.userId, userType: { $in: "ADMIN" } });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      const { question, answer } = validatedBody;
      var result = await createFAQ({ question: question, answer: answer });
      return res.json(new response(result, responseMessage.FAQ_ADDED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /faq/viewFAQ:
   *   get:
   *     tags:
   *       - FAQ_MANAGEMENT
   *     description: viewFAQ
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: _id
   *         description: _id
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async viewFAQ(req, res, next) {
    try {
      let userResult = await findUser({ _id: req.userId, userType: { $in: "ADMIN" } });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var result = await findFAQ({ _id: req.query._id, status: { $ne: "DELETE" } });
      if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /faq/editFAQ:
   *   put:
   *     tags:
   *       - FAQ_MANAGEMENT
   *     description: editFAQ
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: editFAQ
   *         description: editFAQ
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/editFAQ'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async editFAQ(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
      question: Joi.string().optional(),
      answer: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let adminRes = await findUser({ _id: req.userId, userType: { $in: "ADMIN" } });
      if (!adminRes) throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      let faqFind = await findFAQ({ _id: validatedBody._id });
      if (!faqFind) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      var result = await updateFAQ({ _id: faqFind._id }, validatedBody);
      return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /faq/deleteFAQ:
   *   delete:
   *     tags:
   *       - FAQ_MANAGEMENT
   *     description: deleteFAQ
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: deleteFAQ
   *         description: deleteFAQ
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/deleteFAQ'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async deleteFAQ(req, res, next) {
    const validationSchema = {
      _id: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        userType: { $in: "ADMIN" },
      });
      if (!userResult) throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      var faqInfo = await findFAQ({
        _id: validatedBody._id,
        status: { $ne: status.DELETE },
      });
      if (!faqInfo) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      let deleteRes = await updateFAQ(
        { _id: faqInfo._id },
        { status: status.DELETE }
      );
      return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /faq/faqList:
   *   get:
   *     tags:
   *       - FAQ_MANAGEMENT
   *     description: faqList
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async faqList(req, res, next) {
    let validationSchema = {
      page: Joi.number().optional(),
      limit: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.query, validationSchema);
      let adminRes = await findUser({ _id: req.userId, userType: { $in: "ADMIN" } });
      if (!adminRes) throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      var result = await faqListWithPagination(validatedBody);
      if (result.docs.length == 0)
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  //**************************  FAQs management End *************************************************/

  /**
   * @swagger
   * /static/deleteStaticContent:
   *   delete:
   *     tags:
   *       - ADMIN STATIC MANAGEMENT
   *     description: deleteStaticContent
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: staticId
   *         description: staticId
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async deleteStaticContent(req, res, next) {
    const validationSchema = {
      staticId: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        userType: userType.ADMIN,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var result = await findStaticContent({
        _id: validatedBody.staticId,
        status: { $ne: status.DELETE },
      });
      if (!result) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let updateRes = await updateStaticContent(
        { _id: result._id },
        { status: status.DELETE }
      );
      return res.json(new response(updateRes, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }
}

export default new staticController();
