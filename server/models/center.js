import Mongoose, {
    Schema
} from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enum/status";
import userType from "../enum/userType";
import centerType from "../enum/centerType";
import bcrypt from "bcryptjs";
import config from "config";
const axios = require('axios');
const options = {
    collection: "center",
    timestamps: true,
};
const centerModel = new Schema({
        centerName: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                default: 'Point',
                required: true,
            },
            coordinates: {
                type: [Number],
                index: '2dsphere',
            },
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        zipCode: {
            type: String,
            required: true,
        },
        contactInfo: {
            phoneNumber: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: false,
            },
        },
        centerType: {
            type: String,
            enum: [centerType.HOSPITAL, centerType.CLINIC, centerType.SCHOOL, centerType.COMMUNITY_CENTER, centerType.SPORTS_COMPLEX, centerType.MOBILE_UNIT],
            default: centerType.HOSPITAL,
        },
        availableVaccines: [{
            vaccineName: {
                type: String,
                required: true,
            },
           
        }, ],
        operationalTimings: {
            openTime: {
                type: String,
                required: true, // e.g., "09:00 AM"
            },
            closeTime: {
                type: String,
                required: true, // e.g., "05:00 PM"
            },
            breakTimeStart: {
                 type: String,
                required: true,
                
            },
            breakEndTime: {
                type: String,
                required: true,
            },
            slotDuration: {
                type: String,
                required: true,
            }
        },
        slots: [{
            date: {
                type: Date,
                required: true,
            },
            time: {
                type: String,
                required: true, // e.g., "10:00 AM - 10:30 AM"
            },
            maxCapacity: {
                type: Number,
                required: true, // Maximum number of people per slot
            },
            bookedCount: [{
                type: Number,
                default: 0, // Tracks how many bookings are already made
            }],
            available: {
                type: Boolean,
                default: true,
            },
            bookedUsers: [{
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'User', // Reference to the User model
            }, ],
        }, ],
        status: {
            type: String,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE],
            default: status.ACTIVE,
        },

    },
    options);
centerModel.plugin(mongoosePaginate);
centerModel.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("center", centerModel);