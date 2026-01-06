import * as helpers from "../helpers.js";
import { crashes, users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

// CREATE CRASH ///////////////////////////////////
export const createCrash = async (userId, crashDataPayload) => {
  helpers.inputValidObjectId(userId, "User ID");

  let {
    photos,
    source,
    collisionId,
    occurredAt,
    borough,
    zipCode,
    latitude,
    longitude,
    onStreet,
    crossStreet,
    offStreet,
    personsInjured,
    personsKilled,
    pedestriansInjured,
    pedestriansKilled,
    cyclistsInjured,
    cyclistsKilled,
    motoristsInjured,
    motoristsKilled,
    summary,
    vehicles,
    witness_reports,
    comments,
  } = crashDataPayload;

  if (!source) source = userId;
  if (!collisionId) collisionId = "N/A";

  helpers.inputString(source, "source");
  helpers.inputString(borough, "borough");
  helpers.inputString(summary, "summary");

const crashDate = new Date(occurredAt);
  
  if (isNaN(crashDate.getTime())) {
    throw "Error: Invalid date format provided for occurredAt.";
  }

  if (crashDate > new Date()) {
    throw "Error: Crash date cannot be in the future.";
  }

  let newCrash = {
    _id: new ObjectId(),
    photos: photos || [],
    source: source || "user",
    collisionId: collisionId || "N/A",
    occurredAt: new Date(occurredAt),
    borough,
    zipCode,
    latitude,
    longitude,
    onStreet,
    crossStreet: crossStreet || "",
    offStreet: offStreet || "",
    personsInjured: personsInjured || 0,
    personsKilled: personsKilled || 0,
    pedestriansInjured: pedestriansInjured || 0,
    pedestriansKilled: pedestriansKilled || 0,
    cyclistsInjured: cyclistsInjured || 0,
    cyclistsKilled: cyclistsKilled || 0,
    motoristsInjured: motoristsInjured || 0,
    motoristsKilled: motoristsKilled || 0,
    summary,
    createdBy: new ObjectId(userId),
    createdAt: new Date(),
    vehicles: [],
    witness_reports: witness_reports || [],
    comments: comments || [],
    accuracyPercentage: 100,
  };

  if (vehicles && Array.isArray(vehicles)) {
    newCrash.vehicles = vehicles.map((v) => ({
      _id: new ObjectId(),
      ...v,
    }));
  }

  const crashCollection = await crashes();
  const insertInfo = await crashCollection.insertOne(newCrash);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not add crash";

  const userCollection = await users();
  const updateInfo = await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $push: { submittedCrashIds: insertInfo.insertedId } }
  );

  if (!updateInfo) throw "Could not link crash to user";

  return await getCrashById(insertInfo.insertedId.toString());
};
//GET ALL CRASHES //////////////////////////////////
export const getAllCrashes = async () => {
  const crashCollection = await crashes();

  let crashList = await crashCollection
    .find({})
    .sort({ occurredAt: -1 })
    .toArray();

  if (!crashList) throw "Could not get all crashes";

  crashList = crashList.map((element) => {
    element._id = element._id.toString();
    return element;
  });
  return crashList;
};
// GET CRASH BY ID /////////////////////////////////
export const getCrashById = async (id) => {
  helpers.inputExist(id, "id");
  helpers.inputString(id, "id");
  id = id.trim();
  helpers.inputEmptyString(id, "id");
  helpers.inputValidObjectId(id, "id");

  const crashCollection = await crashes();
  const crash = await crashCollection.findOne({ _id: new ObjectId(id) });
  if (!crash) throw `Crash with ID: ${id} not found`;

  crash._id = crash._id.toString();
  return crash;
};

// ======================================================
// 4. SEARCH
// ======================================================
export const searchCrashes = async (
  keyword,
  borough,
  dateFrom,
  dateTo 
) => {
  if (!keyword && !borough && !dateFrom && !dateTo) {
    throw "No fields passed into the search.";
  }
  const crashCollection = await crashes();

  let query = {};

  if (keyword && keyword.trim().length > 0) {
    // keyword
    const regex = new RegExp(keyword.trim(), "i");
    query.$or = [
      { summary: regex },
      { crossStreet: regex },
      { onStreet: regex },
      { offStreet: regex },
      { borough: regex },
      { collisionId: regex },
    ];
  }

  if (borough && borough !== "All") {
    // borough
    query.borough = borough;
  }

  if (dateFrom || dateTo) {
    // dates
    query.occurredAt = {};
    if (dateFrom) {
      query.occurredAt.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      // using next day to include the final day in the range given
      const nextDay = new Date(dateTo);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      query.occurredAt.$lt = nextDay;
    }
  }

  if (Object.keys(query).length === 0) {
    throw "You must provide at least one search criteria.";
  }

  const foundCrashes = await crashCollection.find(query).limit(50).toArray();

  return foundCrashes.map((crash) => {
    crash._id = crash._id.toString();
    return crash;
  });
};

export const getVehiclesInfo = async (
  vehicleId,
  vehicleType,
  make,
  model,
  year
) => {
  const crashCollection = await crashes();

  if (
    !vehicleId &&
    !vehicleType &&
    !make &&
    !model &&
    !year
  ) {
    throw "No fields passed into the search.";
  }

  const elemQuery = {};

  if (vehicleId && vehicleId.trim().length > 0) {
    const escaped = vehicleId.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    elemQuery.vehicleId = { $regex: new RegExp(`^${escaped}$`, "i") };
  }
  if (vehicleType && vehicleType.trim().length > 0) {
    const escaped = vehicleType.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    elemQuery.vehicleType = { $regex: new RegExp(`^${escaped}$`, "i") };
  }
  if (make && make.trim().length > 0) {
    const escaped = make.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    elemQuery.make = { $regex: new RegExp(`^${escaped}$`, "i") };
  }
  if (model && model.trim().length > 0) {
    const escaped = model.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    elemQuery.model = { $regex: new RegExp(`^${escaped}$`, "i") };
  }
  if (year && year.trim().length > 0) {
    const y = year.trim();
    if (/^\d{1,6}$/.test(y)) {
      elemQuery.year = Number(y);
    } else {
      const escaped = y.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      elemQuery.year = { $regex: new RegExp(`^${escaped}$`, "i") };
    }
  }

  if (Object.keys(elemQuery).length === 0) {
    throw "You must provide at least one search criteria.";
  }

  const foundVehicles = await crashCollection
    .find({ vehicles: { $elemMatch: elemQuery } })
    .limit(50)
    .toArray();
  
    // filter crashes and return only matching vehicles
    const matchingVehicles = [];
    for (const crash of foundVehicles) {
      for (const vehicle of crash.vehicles) {
        let isMatch = true;
        for (const key in elemQuery) {
          const q = elemQuery[key];
          const v = vehicle[key];

          if (q && typeof q === "object" && q.$regex !== undefined) {
            let reg;
            if (q.$regex instanceof RegExp) reg = q.$regex;
            else {
              const opts = q.$options || "i";
              reg = new RegExp(q.$regex, opts);
            }
            if (!reg.test(String(v))) {
              isMatch = false;
              break;
            }
          } else if (typeof q === "number") {
            // numeric equality
            if (Number(v) !== q) {
              isMatch = false;
              break;
            }
          } else {
            if (v !== q) {
              isMatch = false;
              break;
            }
          }
        }
        if (isMatch) {
          const vehicleInfo = {
            ...vehicle,
            crashId: crash._id.toString(),
          };
          matchingVehicles.push(vehicleInfo);
        }
      }
    }

  return matchingVehicles;
};

// ======================================================
// 6. GET CRASH STATISTICS
// ======================================================
export const getCrashStatistics = async () => {
  const crashCollection = await crashes();

  // find the number of crashes by borough and by year
  const crashesByBoroughAndYear = await crashCollection
    .aggregate([
      {
        $group: {
          _id: { borough: "$borough", year: { $year: "$occurredAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  // find the number of personsInjured by borough and by year
  const pedestriansInjuredByBoroughAndYear = await crashCollection
    .aggregate([
      {
        $group: {
          _id: { borough: "$borough", year: { $year: "$occurredAt" } },
          pedestriansInjured: { $sum: "$pedestriansInjured" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  // find the number of pedestriansKilled by borough and by year
  const pedestriansKilledByBoroughAndYear = await crashCollection
    .aggregate([
      {
        $group: {
          _id: { borough: "$borough", year: { $year: "$occurredAt" } },
          pedestriansKilled: { $sum: "$pedestriansKilled" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  // find the number of motoristsInjured by borough and by year
  const motoristsInjuredByBoroughAndYear = await crashCollection
    .aggregate([
      {
        $group: {
          _id: { borough: "$borough", year: { $year: "$occurredAt" } },
          motoristsInjured: { $sum: "$motoristsInjured" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  // find the number of motoristsKilled by borough and by year
  const motoristsKilledByBoroughAndYear = await crashCollection
    .aggregate([
      {
        $group: {
          _id: { borough: "$borough", year: { $year: "$occurredAt" } },
          motoristsKilled: { $sum: "$motoristsKilled" },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  // merge personsKilled, personsInjured, and motoristsKilled into crashesByBorough
  const crashesByBoroughWithStats = await crashCollection
    .aggregate([
      {
        $group: {
          _id: "$borough",
          pedestriansInjured: { $sum: "$pedestriansInjured" },
          pedestriansKilled: { $sum: "$pedestriansKilled" },
          motoristsInjured: { $sum: "$motoristsInjured" },
          motoristsKilled: { $sum: "$motoristsKilled" },
        },
      },
    ])
    .toArray();

  return {
    crashesByBoroughAndYear,
    crashesByBoroughWithStats,
    pedestriansInjuredByBoroughAndYear,
    pedestriansKilledByBoroughAndYear,
    motoristsInjuredByBoroughAndYear,
    motoristsKilledByBoroughAndYear,
  };
};
// COMMENTS (The feature, not a JS Comment)/////////
export const addCommentToCrash = async (
  crashId,
  userId,
  text,
  parentCommentId = null
) => {
  // input exist?
  helpers.inputExist(crashId, "crashId");
  helpers.inputExist(userId, "userId");
  helpers.inputExist(text, "text");
  // valid object id?
  helpers.inputValidObjectId(crashId, "crashId");
  helpers.inputValidObjectId(userId, "userId");
  // type tring?
  helpers.inputString(text, "text");
  // trim
  text = text.trim();
  // empty string?
  helpers.inputEmptyString(text, "text");

  if (parentCommentId !== null) {
    helpers.inputValidObjectId(parentCommentId, "parentCommentId");
  }

  const crashCollection = await crashes();

  const crash = await crashCollection.findOne({
    _id: new ObjectId(crashId),
  });

  if (!crash) throw "Crash not found";

  // 10 comments max per crash per user
  const userCommentsOnCrash =
    crash.comments?.filter((c) => c.userId.toString() === userId).length ?? 0;
  if (userCommentsOnCrash >= 10) {
    throw "You may only post 10 comments maximum per crash.";
  }

  if (parentCommentId) {
    const parentExists = crash.comments?.some(
      (c) => c._id.toString() === parentCommentId
    );

    if (!parentExists) throw "Parent comment not found on this crash";
  }
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(userId) });

  const newComment = {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    text: text,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: new Date(),
    parentCommentId: parentCommentId ? new ObjectId(parentCommentId) : null,
  };
  // push into crash object comment field
  const updateCrash = await crashCollection.updateOne(
    { _id: new ObjectId(crashId) },
    { $push: { comments: newComment } }
  );

  if (updateCrash.matchedCount === 0) {
    throw "Could not add comment to crash";
  }
  // update user collection commented crash ids
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { commentedCrashIds: new ObjectId(crashId) } }
  );

  return {
    ...newComment,
    _id: newComment._id.toString(),
    userId: newComment.userId.toString(),
    parentCommentId: newComment.parentCommentId
      ? newComment.parentCommentId.toString()
      : null,
  };
};
// ======================================================
// 7. RATE CRASH
// ======================================================
export const rateCrash = async (crashId, raterId, voteType, userId) => {
  // -------------------------------------------------
  // INPUT VALIDATION
  // -------------------------------------------------
  helpers.inputExist(crashId, "crashId");
  helpers.inputExist(raterId, "raterId");
  helpers.inputExist(voteType, "voteType");
  helpers.inputExist(userId, "userId");

  helpers.inputString(crashId, "crashId");
  helpers.inputString(raterId, "raterId");
  helpers.inputString(voteType, "voteType");
  helpers.inputString(userId, "userId");

  crashId = crashId.trim();
  raterId = raterId.trim();
  voteType = voteType.toLowerCase().trim();
  userId = userId.trim();

  helpers.inputEmptyString(crashId, "crashId");
  helpers.inputEmptyString(raterId, "raterId");
  helpers.inputEmptyString(userId, "userId");
  helpers.inputValidObjectId(crashId, "crashId");
  helpers.inputValidObjectId(raterId, "raterId");

  if (voteType !== 'verify' && voteType !== 'reject') {
    throw "Vote type must be verify or reject";
  }

  // -------------------------------------------------
  // RATE CRASH
  // -------------------------------------------------
  const crashCollection = await crashes();
  const crash = await crashCollection.findOne({ _id: new ObjectId(crashId) });
  if (!crash) throw `Crash with ID: ${crashId} not found`;

  if (!crash.witness_reports) {
    crash.witness_reports = [];
  }

  const existingReportI = crash.witness_reports.findIndex(
    (r) => r.raterId.toString() === raterId
  );
  let shouldUpdate = false;
  if (existingReportI === -1) { // newe report
    crash.witness_reports.push({ 
      raterId: new ObjectId(raterId),
      raterDisplay: userId,
      vote: voteType 
    });
    shouldUpdate = true;

    const userCollection = await users();
    const userUpdate = await userCollection.updateOne(
      { _id: new ObjectId(raterId) },
      { $inc: { crashesWitnessed: 1 } }
    );
    
    if (!userUpdate.modifiedCount) {
       console.log(`Warning: Could not update witness count for user ${raterId}`);
    }
  } else { 
    const currentReport = crash.witness_reports[existingReportI];
    if (currentReport.vote !== voteType) { 
      crash.witness_reports[existingReportI].vote = voteType;
      shouldUpdate = true;
    }
  }

  if (shouldUpdate) {
    const totalReports = crash.witness_reports.length;
    let verifyCount = 0;

    for (const report of crash.witness_reports) {
      if (report.vote === 'verify') {
        verifyCount++;
      }
    }

    let newPercentage = 0;
    if (totalReports > 0) {
      newPercentage = Math.round((verifyCount / totalReports) * 100);
    }

    const updateInfo = await crashCollection.updateOne(
      { _id: new ObjectId(crashId) },
      { 
        $set: { 
          witness_reports: crash.witness_reports,
          accuracyPercentage: newPercentage
        } 
      }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
      throw "No update performed";
    }

    const updatedCrash = await crashCollection.findOne({ _id: new ObjectId(crashId) });
    updatedCrash._id = updatedCrash._id.toString();
    return updatedCrash;
  }
  crash._id = crash._id.toString();
  return crash;
};
//////////////////////////////////////////////
export const getVoteCountByUser = async (userId) => {
  helpers.inputExist(userId, "userId");
  helpers.inputString(userId, "userId");
  userId = userId.trim();
  helpers.inputEmptyString(userId, "userId");

  const crashCollection = await crashes();

  // count each vote the user made
  const result = await crashCollection.aggregate([
    { $unwind: "$witness_reports" },
    { $match: { "witness_reports.raterId": new ObjectId(userId)} },
    { $count: "totalVotes"}
  ]).toArray()

  return result.length > 0 ? result[0].totalVotes : 0;
}
//////////////////////////////////////////////