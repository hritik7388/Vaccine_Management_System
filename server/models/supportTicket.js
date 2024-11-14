import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import status from "../enums/status";
const options = {
  collection: "supportTicket",
  timestamps: true,
};
const schema = Mongoose.Schema;
var supportTicketSchema = new schema(
  {
    userId: {
      type: schema.Types.ObjectId,
      ref: "user",
    },
    title: { type: String },
    reason: { type: String },
    message: [{
      comment: { type: String },
      documentUrl: { type: String },
      isUserReply: { type: Boolean, default: true },
      isAdminReply: { type: Boolean, default: false },
    }],
    isclose: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [status.ACTIVE, status.DELETE, status.BLOCK, status.CANCEL ],
      default: status.ACTIVE,
    },
  },
  options
);

supportTicketSchema.plugin(mongoosePaginate);
supportTicketSchema.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("supportTicket", supportTicketSchema);
