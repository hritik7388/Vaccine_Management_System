import Joi, {
    exist
} from "joi";
import status from '../../../../enum/status';
import userType from '../../../../enum/userType';
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import createCenters from '../../../../models/center'
import {
    centerServices
} from "../../services/center";
const {
    findCenter,
    createCenter,
    updateUser
} = centerServices;
import {
    userServices
} from "../../services/user";
const {
    findUser, 
} = userServices;
export class centerController {

/**
 * @swagger
 * /center/creteCenter:
 *   post:
 *     tags:
 *       - CENTER
 *     summary: Create a new vaccination center
 *     description: Registers a new vaccination center in the system, including operational timings and slots.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: User token 
 *         in: header
 *         required: true
 *       - in: body
 *         name: body
 *         description: Center creation data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             centerName:
 *               type: string
 *               description: Name of the center
 *               example: "Downtown Vaccination Center"
 *             location:
 *               type: object
 *               description: Geographical location of the center
 *               properties:
 *                 type:
 *                   type: string
 *                   description: The type of location (e.g., Point)
 *                   example: "Point"
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: Latitude and longitude coordinates
 *                   example: [40.7128, -74.0060]
 *             city:
 *               type: string
 *               description: City where the center is located
 *               example: "New York"
 *             state:
 *               type: string
 *               description: State where the center is located
 *               example: "NY"
 *             zipCode:
 *               type: string
 *               description: Postal code for the center's location
 *               example: "10001"
 *             contactInfo:
 *               type: object
 *               description: Contact information for the center
 *               properties:
 *                 phoneNumber:
 *                   type: string
 *                   description: Phone number of the center
 *                   example: "+1234567890"
 *                 email:
 *                   type: string
 *                   description: Email address for the center
 *                   example: "contact@downtownvaccine.com"
 *             availableVaccines:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   vaccineName:
 *                     type: string
 *                     description: Name of the vaccine available at the center
 *                     example: "COVID-19 Vaccine" 
 *             operationalTimings:
 *               type: object
 *               description: The operational timings of the center
 *               properties:
 *                 openTime:
 *                   type: string
 *                   description: Opening time of the center (24-hour format)
 *                   example: "08:00"
 *                 closeTime:
 *                   type: string
 *                   description: Closing time of the center (24-hour format)
 *                   example: "18:00"
 *                 breakTimeStart:
 *                   type: string
 *                   description: Break time (in minutes)
 *                   example: "12:00"
 *                 breakEndTime:
 *                   type: string
 *                   description: Break time (in minutes)
 *                   example: "15:00"
 *                 slotDuration:
 *                   type: string
 *                   description: Break time (in minutes)
 *                   example: "15:00"
 *             slots:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Slot information for vaccination appointments
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: Date of the slot
 *                     example: "2024-11-16"
 *                   time:
 *                     type: string
 *                     description: Time of the slot (24-hour format)
 *                     example: "09:00"
 *                   maxCapacity:
 *                     type: number
 *                     description: Maximum number of people who can book this slot
 *                     example: 10 
 *     responses:
 *       200:
 *         description: Center created successfully.
 *       409:
 *         description: Center already exists.
 *       500:
 *         description: Internal server error.
 */
    async creteCenter(req, res, next) {   
           const validationSchema = Joi.object({
               centerName: Joi.string().required(),
               location: Joi.object({
                   type: Joi.string().valid('Point').default('Point'),
                   coordinates: Joi.array().items(Joi.number()).length(2).required(),
               }).required(),
               city: Joi.string().required(),
               state: Joi.string().required(),
               zipCode: Joi.string().required(),
               contactInfo: Joi.object({
                   phoneNumber: Joi.string().required(),
                   email: Joi.string().email().optional(),
               }).required(),
               availableVaccines: Joi.array().items(
                   Joi.object({
                       vaccineName: Joi.string().required(), 
                   })
               ).optional(),
               operationalTimings: Joi.object({
                   openTime: Joi.string().required(),
                   closeTime: Joi.string().required(),
                   breakTimeStart: Joi.string().required(), 
                   breakEndTime: Joi.string().required(),
                   slotDuration: Joi.string().required(),
               }).required(),
               slots: Joi.array().items(
                   Joi.object({
                       date: Joi.date().required(),
                       time: Joi.string().required(),
                       maxCapacity: Joi.number().required(), 
                   })
               ).optional(),
           });

           try {
               // Validate the incoming request body
               const validatedBody = await validationSchema.validateAsync(req.body);
               const {
                   centerName,
                   location,
                   city,
                   state,
                   zipCode,
                   contactInfo,
                   availableVaccines,
                   operationalTimings,
                   slots,
               } = validatedBody; 
               var userResult = await findUser({
                 _id: req.userId,
                 status: { $ne: status.DELETE },
                 userType: userType.ADMIN,
               });
               const {openTime,
                   closeTime,
                   breakTimeStart,
                   breakEndTime,
                   slotDuration, 
               } = operationalTimings;
               console.log("userResult================>>>>>", userResult)
                if (userResult) {
                    throw apiError.conflict(responseMessage.USER_NOT_FOUND);
                }
                const generatedSlots = await commonFunction.generateSlots(openTime, closeTime, breakTimeStart, breakEndTime, slotDuration, );
                validatedBody.slots = generatedSlots 
                
                const centerInfo = await findCenter({
                    centerName: centerName,
                    status: {
                        $ne: status.DELETE
                    },
                });
                
                if (centerInfo) {
                    throw apiError.conflict(responseMessage.CENTER_EXISTS);
                } 
               const newCenter = new createCenters(validatedBody);
               await newCenter.save();
               res.status(200).json({
                   message: "Center created successfully",
                   center: validatedBody
               });

           } catch (error) {
               console.log("error=======>>>>>>",error)
               return next(error);
           }
           }
}
export default new centerController();