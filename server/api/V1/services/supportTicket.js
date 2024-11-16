import supportModel from "../../../models/supportTicket";
import status from "../../../enum/status";

const supportServices = {

  createSupport: async (insertObj) => {
    return await supportModel.create(insertObj);
  },

  findSupport: async (query) => {
    return await supportModel.findOne(query).populate('userId coinId');
  },

  updateSupport: async (query, updateObj) => {
    return await supportModel.findOneAndUpdate(query, updateObj, { new: true });
  },
  supportList: async (query) => {
    return await supportModel.find(query);
  },
  paginateSearchSupport: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { fromDate, toDate, page, limit, userId, search } = validatedBody;
    if(userId){
      query.userId = userId
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
      ];
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
      populate: ('userId')
      // select: '-ethAccount.privateKey'
    };
    return await supportModel.paginate(query, options);
  },
  aggregateSearchSupport: async (validatedBody) => {
    try {
      const {  search,  fromDate,  toDate,  page,  limit,} = validatedBody;
      if (search) {
        var filter = search;
      }
      let data = filter || "";
      let searchData = [
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        {
          $unwind: {
            path: "$userId",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              { "userId.email": { $regex: data, $options: "i" } },
              { "userId.fullName": { $regex: data, $options: "i" } },
            ],
          },
        },
        {
          $match: { status: status.ACTIVE },
        },
        { $sort: { createdAt: -1 } },
      ];
      if (fromDate && !toDate) {
        searchData.push({
          $match: {
            // "$expr": { "$gte": ["$createdAt", new Date(fromDate)] }
            $expr: {
              $lte: [
                "$createdAt",
                new Date(
                  new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
                ),
              ],
            },
          },
        });
      }
      if (!fromDate && toDate) {
        searchData.push({
          $match: {
            // "$expr": { "$lte": ["$createdAt", new Date(toDate)] }
            $expr: {
              $lte: [
                "$createdAt",
                new Date(
                  new Date(toDate).toISOString().slice(0, 10) + "T23:59:59.999Z"
                ),
              ],
            },
          },
        });
      }
      if (fromDate && toDate) {
        searchData.push({
          $match: {
            // "$expr": { "$and": [{ "$lte": ["$createdAt", new Date(toDate)] }, { "$gte": ["$createdAt", new Date(fromDate)] }] }
            $expr: {
              $and: [
                {
                  $lte: [
                    "$createdAt",
                    new Date(
                      new Date(toDate).toISOString().slice(0, 10) +
                        "T23:59:59.999Z"
                    ),
                  ],
                },
                {
                  $gte: [
                    "$createdAt",
                    new Date(new Date(fromDate).toISOString().slice(0, 10)),
                  ],
                },
              ],
            },
          },
        });
      }
      let aggregate = supportModel.aggregate(searchData);
      let options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort: { createdAt: -1 },
        populate: ["fromCoinId", "toCoinId"],
      };
      return await supportModel.aggregatePaginate(aggregate, options);
    } catch (error) {
      console.log("aggregateSearchExchange error==>>", error);
    }
  },


}

module.exports = { supportServices };