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
export class userController {


    /**
     * @swagger
     * /user/signUp:
     *   post:
     *     tags:
     *       - USER
     *     summary: User signup
     *     description: Registers a new user in the system.
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: body
     *         description: User signup data
     *         required: true
     *         schema:
     *           type: object
     *           properties:
     *             firstName:
     *               type: string
     *               description: First name of the user
     *               example: John
     *             lastName:
     *               type: string
     *               description: Last name of the user
     *               example: Doe
     *             email:
     *               type: string
     *               description: Email of the user
     *               example: johndoe@example.com
     *             password:
     *               type: string
     *               description: Password of the user
     *               example: password123
     *             confirmPassword:
     *               type: string
     *               description: Confirmation password of the user
     *               example: password123
     *             userName:
     *               type: string
     *               description: Optional username for the user
     *               example: johndoe
     *             mobileNumber:
     *               type: string
     *               description: Mobile number of the user
     *               example: "+1234567890"
     *             dateOfBirth:
     *               type: string
     *               format: date
     *               description: Date of birth of the user
     *               example: "1990-01-01"
     *             gender:
     *               type: string
     *               description: Gender of the user
     *               example: "male"
     *             address:
     *               type: string
     *               description: Address of the user
     *               example: "123 Main St, Anytown, USA"
     *             location:
     *               type: object
     *               description: Geographical location of the user
     *               properties:
     *                 type:
     *                   type: string
     *                   description: The type of location (e.g., Point)
     *                   example: Point
     *                 coordinates:
     *                   type: array
     *                   items:
     *                     type: number
     *                   description: Latitude and longitude coordinates
     *                   example: [40.7128, -74.0060]
     *     responses:
     *       200:
     *         description: User registered successfully.
     *       409:
     *         description: User already exists.
     *       500:
     *         description: Internal server error.
     */

    async signUp(req, res, next) {
        const validationSchema = Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            password: Joi.string().required(),
            confirmPassword: Joi.string().required(),
            userName: Joi.string().required(),
            mobileNumber: Joi.string().required(),
            email: Joi.string().email().required(),
            dateOfBirth: Joi.date().required(),
            gender: Joi.string().required(),
            address: Joi.string().required(),
            location: Joi.object({
                type: Joi.string().valid('Point').default('Point'),
                coordinates: Joi.array().items(Joi.number()).length(2).required(),
            }).required(),
        });
        try {
            const validatedBody = await validationSchema.validateAsync(req.body);
            const {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                userName,
                mobileNumber,
                dateOfBirth,
                gender,
                address,
                location
            } = validatedBody;
            if (password !== confirmPassword) {
                throw apiError.conflict(responseMessage.PWD_NOT_MATCH);
            }
            const existingUser = await findUser({
                email: validatedBody.email,
                status: {
                    $ne: status.DELETE
                },
            });
            if (existingUser) {
                if (!existingUser.OTPVerification) {
                    const hashPassword = await bcrypt.hash(password, 10);
                    const OTP = commonFunction.getOTP();
                    const otpExpTime = new Date().getTime() + 180000; // 3 minutes expiry
                    await updateUser({
                        _id: existingUser._id
                    }, {
                        OTP,
                        otpExpTime,
                    }, {
                        upsert: true,
                        new: true
                    });
                    return res.json(new response({
                        OTP
                    }, responseMessage.OTP_SEND));
                }
                throw apiError.conflict(responseMessage.USER_EXISTS);
            }
            const hashPassword = await bcrypt.hash(password, 10);
            validatedBody.OTP = commonFunction.getOTP();
            validatedBody.otpExpTime = new Date().getTime() + 180000; // 3 minutes expiry 
            const usersInfo = {
                firstName: validatedBody.firstName,
                lastName: validatedBody.lastName,
                userName: validatedBody.userName,
                email: validatedBody.email,
                mobileNumber: validatedBody.mobileNumber,
                dateOfBirth: validatedBody.dateOfBirth,
                address: validatedBody.address,
                password: hashPassword,                 
                OTP: validatedBody.OTP,
                otpExpTime: validatedBody.otpExpTime,
                location: validatedBody.location,
                gender: validatedBody.gender,
            };
            const newUser = await createUser(usersInfo);
            return res.json(new response(newUser, responseMessage.USER_CREATED));
        } catch (error) {
            console.error("Error during sign-up:", error);
            return next(error);
        }
    }


    /**
     * @swagger
     * /user/verifyOtp:
     *   post:
     *     tags:
     *       - USER
     *     summary: Verify OTP
     *     description: Verifies the OTP for a user and updates the OTP verification status.
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: body
     *         description: OTP verification data
     *         required: true
     *         schema:
     *           type: object
     *           properties:
     *             email:
     *               type: string
     *               description: Email of the user
     *               example: johndoe@example.com
     *             OTP:
     *               type: string
     *               description: One-time password sent to the user's email
     *               example: "123456"
     *     responses:
     *       200:
     *         description: OTP verified successfully, and user status updated.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   description: Success status
     *                   example: success
     *                 message:
     *                   type: string
     *                   description: Success message
     *                   example: OTP verified successfully.
     *                 data:
     *                   type: object
     *                   properties:
     *                     userData:
     *                       type: object
     *                       description: Updated user data
     *                       properties:
     *                         id:
     *                           type: string
     *                           example: "645d1c6f12ab4567890e1234"
     *                         email:
     *                           type: string
     *                           example: johndoe@example.com
     *                         OTPVerification:
     *                           type: boolean
     *                           example: true
     *                         token:
     *                           type: string
     *                           example: "abc123def456gh789ij"
     *       400:
     *         description: Bad request. Missing or invalid fields in the request body.
     *       404:
     *         description: User not found or OTP expired.
     *       409:
     *         description: Conflict. OTP verification failed.
     *       500:
     *         description: Internal server error.
     */

    async verifyOtp(req, res, next) {
        const validationSchema = Joi.object({
            email: Joi.string().email().required(),
            OTP: Joi.string().required(),
        });
        try {
            const {
                email,
                OTP
            } = await validationSchema.validateAsync(req.body);
            const existingUser = await findUser({
                email,
                status: "ACTIVE",
                userType: userType.USER,
            });
            if (!existingUser) {
                throw apiError.conflict(responseMessage.USER_NOT_FOUND);
            }
            if (new Date().getTime() > existingUser.otpExpTime) {
                return res.json(new response({}, responseMessage.OTP_EXPIRED));
            }
            if (existingUser.OTP != OTP) {
                return res.json(new response({}, responseMessage.INCORRECT_OTP));
            }
            const updateInfo = await updateUser({
                _id: existingUser._id
            }, {
                OTPVerification: true,
                token: token,
            }, )
            const token = await commonFunction.getToken({
                _id: existingUser._id,
                email: existingUser.email,
                mobileNumber: existingUser.mobileNumber,
                userType: existingUser.userType,
            });
            const userData = {
                _id: existingUser._id,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email,
                mobileNumber: existingUser.mobileNumber,
                OTPVerification: updateInfo.OTPVerification,
                token: token,
            }
            return res.json(new response(userData, responseMessage.OTP_VERIFY));
        } catch (error) {
            console.error("Error in verifyOtp: ", error);
            return next(error);
        }
    }
 


}


export default new userController();