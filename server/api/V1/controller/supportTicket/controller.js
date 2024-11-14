import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import userType from "../../../../enum/userType";
import commonFunction from '../../../../helper/util';
import status from '../../../../enum/status'; 

// // ******************Importing services *************************************//
// import { userServices } from '../../services/user';
// import { supportServices } from '../../services/supportTicket';

// const { findUser, updateUser } = userServices;
// const { createSupport, findSupport, updateSupport, supportList, paginateSearchSupport } = supportServices;




export class paymentController {

    /**
     * @swagger
     * /supportTicket/addSupportTicket:
     *   post:
     *     tags:
     *       - SUPPORT & TICKET
     *     description: addSupportTicket
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: addSupport
     *         description: addSupport
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/addSupport'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async addSupportTicket(req, res, next) {
        try {
            const validatedBody = await Joi.validate(req.body,);
            const userResult = await findUser({ _id: req.userId, userType: { $in: userType.USER } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if(validatedBody.message[0].documentUrl){
                validatedBody.message[0].documentUrl = validatedBody.message[0].documentUrl;
                // validatedBody.message[0].documentUrl = await commonFunction.getSecureUrl(validatedBody.message[0].documentUrl)
            }
            validatedBody.userId = userResult._id; 
            let ticketRes = await createSupport(validatedBody);
            return res.json(new response(ticketRes, responseMessage.ADD_SUPPORT));
        }
        catch (error) {
            return next(error);
        }
        
    }

    /**
     * @swagger
     * /supportTicket/replySupportTicket:
     *   put:
     *     tags:
     *       - SUPPORT & TICKET
     *     description: replySupportTicket
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: supportId
     *         description: supportId
     *         in: formData
     *         required: false
     *       - name: comment
     *         description: comment
     *         in: formData
     *         required: false
     *       - name: documentUrl
     *         description: documentUrl
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async replySupportTicket(req, res, next) {
        try {
            const validatedBody = await Joi.validate(req.body,);
            const userResult = await findUser({ _id: req.userId, userType: { $in: userType.USER } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let resData = await findSupport({ _id: validatedBody.supportId, userId: userResult._id, isclose: false })
            if (!resData) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if(validatedBody.documentUrl){
                validatedBody.documentUrl = validatedBody.documentUrl;
                // validatedBody.documentUrl = await commonFunction.getSecureUrl(validatedBody.documentUrl)
            }
            let result = await updateSupport(
                { _id: resData._id },
                {
                    $push: {
                      message: {
                        comment: validatedBody.comment,
                        documentUrl: validatedBody.documentUrl,
                      }
                    },
                    
                }
            );
            return res.json(new response(result, responseMessage.ADD_SUPPORT));
        }
        catch (error) {
            return next(error);
        }
        
    }
    /**
     * @swagger
     * /supportTicket/listSupportTicket:
     *   get:
     *     tags:
     *       - SUPPORT & TICKET
     *     description: replySupportTicket
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *       - name: isclose
     *         description: isclose 
     *         in: query
     *         required: false
     *       - name: fromDate
     *         description: fromDate
     *         in: query
     *         required: false
     *       - name: toDate
     *         description: toDate
     *         in: query
     *         required: false
     *       - name: page
     *         description: page
     *         in: query
     *         type: integer
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: query
     *         type: integer
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async listSupportTicket(req, res, next) {
        try {
            const validatedBody = await Joi.validate(req.query);
            const userResult = await findUser({ _id: req.userId, userType: { $in: userType.USER } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            validatedBody.userId =  userResult._id;
            let resData = await paginateSearchSupport(validatedBody)
            if (resData.docs.length === 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            } else {
              return res.json(new response(resData, responseMessage.DATA_FOUND));
            } 
        }
        catch (error) {
            return next(error);
        }
        
    }
    /**
     * @swagger
     * /supportTicket/viewSupportTicket:
     *   get:
     *     tags:
     *       - SUPPORT & TICKET
     *     description: viewWithdraw ,all list of particular user data
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: supportId
     *         description: supportId
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async viewSupportTicket(req, res, next) {
        try {
            let userResult = await findUser({_id: req.userId, status: { $ne: status.DELETE }});
            if (!userResult) throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            let result = await findSupport({ _id: req.query.supportId, userId: userResult._id })
            if (!result) throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }
}

export default new paymentController();