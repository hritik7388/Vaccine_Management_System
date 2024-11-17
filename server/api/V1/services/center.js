import centerModel from "../../../models/center";
import status from "../../../enum/status";
import userType from "../../../enum/userType";
const centerServices = {

    centerCount: async () => {
        return await centerModel.countDocuments();
    },
    findCount: async (query) => {
        return await centerModel.countDocuments(query);
    },
    createCenter: async (insertObj) => {
        return await centerModel.create(insertObj);
    },
    findCenter: async (query) => {
        return await centerModel.findOne(query);
    },
    updateCenter: async (query, updateObj) => {
        return await centerModel
            .findOneAndUpdate(query, updateObj, {
                upsert: true,
                new: true
            }) 
    },
        updateCenterById: async (query, updateObj) => {
            return await centerModel
                .findByIdAndUpdate(query, updateObj, {
                    upsert: true,
                    new: true
                })
        },
    deleteCenter: async (query) => {
        return await centerModel.deleteOne(query);
    },




}
module.exports = {
    centerServices
};