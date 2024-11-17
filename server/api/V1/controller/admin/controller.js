import Joi, {
    exist
} from "joi";
import bcrypt from "bcrypt";
import status from '../../../../enum/status';
import userType from '../../../../enum/userType';
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import {
    userServices
} from "../../services/user";
const {
    findUser,
    createUser,
    updateUser
} = userServices;
import commonFunction from "../../../../helper/util";
export class adminController {
  
    /**
     * @swagger
     * /admin/login:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: Admin login with email and Password
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: login
     *         description: login
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/Adminlogin'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async login(req, res, next) {
        const validationSchema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(), 
        });
        try {        
                var results;
            var validatedBody = await validationSchema.validateAsync(req.body);
            const { email, password } = validatedBody;
          
            let userResult = await findUser({
                email: email,
                userType: {
                    $ne: userType.USER
                },
                status: {
                    $ne: status.DELETE
                },
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (!bcrypt.compareSync(password, userResult.password)) {
                throw apiError.conflict(responseMessage.INCORRECT_LOGIN);
            } else {
                var token = await commonFunction.getToken({
                    _id: userResult._id,
                    email: userResult.email,
                    mobileNumber: userResult.mobileNumber,
                    userType: userResult.userType,
                });
                 results = {
                    _id: userResult._id,
                    email: email,
                    speakeasy: userResult.speakeasy,
                    userType: userResult.userType,
                    token: token,
                };
            }
            return res.json(new response(results, responseMessage.LOGIN));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }
}
export default new adminController();