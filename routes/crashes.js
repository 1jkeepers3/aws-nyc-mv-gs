import { Router } from "express";
import xss from "xss";
const router = Router();
import { crashData } from "../data/index.js";
import * as helpers from "../helpers.js";
import multer from 'multer';
import path from 'path';

//  Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });


// ============================================================================
// 1. GET ALL CRASHES
// ============================================================================
router.route("/").get(async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    let crashList = await crashData.getAllCrashes();

    let crashListFormatted = crashList.map((crash) => {
      let dateString = "N/A";
      if (crash.occurredAt) {
        dateString = new Date(crash.occurredAt).toDateString();
      }

      return {
        _id: crash._id,
        photos: crash.photos,
        source: crash.source,
        collisionId: crash.collisionId,
        occurredAt: dateString,
        borough: crash.borough,
        zipCode: crash.zipCode,
        summary: crash.summary,
        accuracyPercentage: crash.accuracyPercentage,
      };
    });

    return res.render("recentCrashes", {
      title: helpers.APP_NAME,
      subTitle: "All Crashes",
      crashes: crashListFormatted,
      user: req.session.user,
      message: req.query.message,
    });
  } catch (e) {
    console.log("Error loading crashes:", e);

    return res.status(500).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: "Could not load crashes.",
    });
  }
});
// ADD A NEW CRASH ///////////////////////////////
router
  .route("/add")
  .get(async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/");
    }
    return res.render("addCrash", {
      title: helpers.APP_NAME,
      subTitle: "Report a New Crash",
      user: req.session.user,
    });
  })
//////////////////////////////////////////////////
.post(upload.single('photo'), async (req, res) => {
    let crashInfo = req.body;
    let user = req.session.user;
    // XSS Protection
    for (let field in crashInfo) {
      if (field === 'occurredAt') continue;
      if (typeof crashInfo[field] === "string") {
        crashInfo[field] = xss(crashInfo[field]);
      }
    }

    if (!user) {
      return res.redirect("/");
    }

    // ------------------------------------------------------------------------
    // INPUT VALIDATION
    // ------------------------------------------------------------------------
try {
      if (req.file && crashInfo.photoUrl && crashInfo.photoUrl.trim() !== "") {
        throw "Error: You cannot upload a file and paste a URL. Please choose only one.";
      }
      if ((!crashInfo || Object.keys(crashInfo).length === 0) && !req.file) {
        throw "There are no fields in the request body";
      }

      const requiredStrings = [
        "borough",
        "zipCode",
        "onStreet",
        "summary",
        "vehicleType",
        "make",
        "model",
      ];
      for (let field of requiredStrings) {
        if (
          !crashInfo[field] ||
          typeof crashInfo[field] !== "string" ||
          crashInfo[field].trim().length === 0
        ) {
          throw `Error: Field ${field} is missing or invalid.`;
        }
      }

      if (!crashInfo.occurredAt) throw "Error: Date of crash is required";

      crashInfo.pedestriansInjured = crashInfo.pedestriansInjured
        ? parseInt(crashInfo.pedestriansInjured)
        : 0;
      crashInfo.pedestriansKilled = crashInfo.pedestriansKilled
        ? parseInt(crashInfo.pedestriansKilled)
        : 0;

      crashInfo.latitude = crashInfo.latitude
        ? parseFloat(crashInfo.latitude)
        : 0;
      crashInfo.longitude = crashInfo.longitude
        ? parseFloat(crashInfo.longitude)
        : 0;

      if (
        isNaN(crashInfo.pedestriansInjured) ||
        crashInfo.pedestriansInjured < 0
      ) {
        throw "Error: Invalid number for injuries";
      }

      if (
        isNaN(crashInfo.pedestriansKilled) ||
        crashInfo.pedestriansKilled < 0
      ) {
        throw "Error: Invalid number for deaths";
      }
    } catch (e) {
      return res.status(400).render("addCrash", {
        title: "Report a Crash",
        error: e,
        hasErrors: true,
        user: user,
        ...crashInfo,
      });
    }

    let vehiclesArray = [];

    let vehicle1 = {
      vehicleType: crashInfo.vehicleType,
      make: crashInfo.make,
      model: crashInfo.model,
      year: crashInfo.year ? parseInt(crashInfo.year) : null,
      stateRegistration: crashInfo.stateRegistration || "N/A",
      damage: "Unknown",
    };
    vehiclesArray.push(vehicle1);

    if (crashInfo.vehicleType2 && crashInfo.vehicleType2.trim() !== "") {
      let vehicle2 = {
        vehicleType: crashInfo.vehicleType2,
        make: crashInfo.make2 || "Unknown",
        model: crashInfo.model2 || "Unknown",
        year: crashInfo.year2 ? parseInt(crashInfo.year2) : null,
        stateRegistration: crashInfo.stateRegistration2 || "N/A",
        damage: "Unknown",
      };
      vehiclesArray.push(vehicle2);
    }

    let photosArray = [];

    if (req.file) {
        photosArray.push('/public/uploads/' + req.file.filename);
    }

    if (crashInfo.photoUrl && crashInfo.photoUrl.trim() !== "") {
      photosArray.push(crashInfo.photoUrl.trim());
    }

    try {
      const newCrash = await crashData.createCrash(user._id, {
        occurredAt: crashInfo.occurredAt,
        source: user.userId,
        borough: crashInfo.borough,
        zipCode: crashInfo.zipCode,
        latitude: crashInfo.latitude,
        longitude: crashInfo.longitude,
        onStreet: crashInfo.onStreet,
        crossStreet: crashInfo.crossStreet || "",
        offStreet: crashInfo.offStreet || "",
        personsInjured: crashInfo.personsInjured,
        personsKilled: crashInfo.personsKilled,
        pedestriansInjured: parseInt(crashInfo.pedestriansInjured) || 0,
        cyclistsInjured: parseInt(crashInfo.cyclistsInjured) || 0,
        motoristsInjured: parseInt(crashInfo.motoristsInjured) || 0,
        summary: crashInfo.summary,
        vehicles: vehiclesArray,
        photos: photosArray,
      });

      return res.redirect(`/crashes/${newCrash._id}`);
    } catch (e) {
      console.log("DB ERROR:", e);
      return res.status(500).render("addCrash", {
        title: "Report a Crash",
        error: "Database Error: " + e,
        hasErrors: true,
        user: user,
        ...crashInfo,
      });
    }
  });

// ============================================================================
// 3. SEARCH
// ============================================================================
router.route("/search").post(async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/");
  }
  let { keyword, borough, dateFrom, dateTo } = req.body;
  // XSS Protection
  keyword = xss(keyword);
  borough = xss(borough);
  dateFrom = xss(dateFrom);
  dateTo = xss(dateTo);

  try {
    const hasKeyword = keyword && keyword.trim().length > 0;
    const hasBorough = borough && borough !== "All" && borough !== "";
    const hasDate = (dateFrom && dateFrom !== "") || (dateTo && dateTo !== "");

    if (!hasKeyword && !hasBorough && !hasDate) {
      return res.status(400).render("error", {
        title: helpers.APP_NAME,
        subTitle: "Error",
        error: "You must enter a keyword, select a borough, or pick a date!",
      });
    }

    let crashes = await crashData.searchCrashes(
      keyword,
      borough,
      dateFrom,
      dateTo
    );

    if (crashes.length === 0) {
      return res.status(404).render("searchResults", {
        title: helpers.APP_NAME,
        subTitle: "Crashes Not Found",
        keyword: keyword || "Search Results",
        crashes: [],
        user: req.session.user,
        error: `No results found.`,
      });
    }

    crashes = crashes.map((crash) => {
      let dateString = "N/A";
      if (crash.occurredAt) {
        dateString = new Date(crash.occurredAt).toDateString();
      }
      return { ...crash, occurredAt: dateString };
    });

    return res.render("searchResults", {
      title: helpers.APP_NAME,
      subTitle: "Crashes Found",
      keywords: "Search Results",
      keyword: keyword || borough || "Results",
      crashes,
      user: req.session.user,
    });
  } catch (e) {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
    });
  }
});

// ============================================================================
// 5. GET CRASH LOOKUP
// ============================================================================
router
  .route("/lookup")
  .get(async (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
      return res.redirect("/");
    }

    return res.render("lookup", {
      title: helpers.APP_NAME,
      subTitle: "Vehicles Lookup",
      user: req.session.user,
    });
  })
  .post(async (req, res) => {
    let {      
      vehicleType,
      make,
      model,
      year,
      vehicleId,
    } = req.body;
    // XSS Protection
    vehicleType = xss(vehicleType);
    make = xss(make);
    model = xss(model);
    year = xss(year);
    vehicleId = xss(vehicleId);

    try {      
      if (        
        !vehicleId &&
        !vehicleType &&
        !make &&
        !model &&
        !year
      ) {
        return res.status(400).render("error", {
          title: helpers.APP_NAME,
          subTitle: "Error",
          error: "You must enter a Plate Number, Vehicle Type, Make, Model, or Year!",
        });
      }

      let vehicles = await crashData.getVehiclesInfo(        
        vehicleId,
        vehicleType,
        make,
        model,
        year
      );

      if (vehicles.length === 0) {
        return res.status(404).render("vehicleResults", {
          title: helpers.APP_NAME,
          subTitle: "Vehicles Not Found",
          keyword: "Vehicle Search Results",
          vehicles: [],
          error: `No results found.`,
          user: req.session.user,
        });
      }

      return res.render("vehicleResults", {
        title: helpers.APP_NAME,
        subTitle: "Vehicles Lookup",
        keywords: "Vehicle Search Results",
        vehicles,
        user: req.session.user,
      });
    } catch (e) {
      return res.status(400).render("error", {
        title: helpers.APP_NAME,
        subTitle: "Error",
        error: e,
        user: req.session.user,
      });
    }
  });

// ============================================================================
// 4. GET CRASH BY ID
// ============================================================================
router.route("/:crashId").get(async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/");
  }
  let { crashId } = req.params;
  try {
    helpers.inputExist(crashId, "crashId");
    helpers.inputString(crashId, "crashId");
    crashId = crashId.trim();
    helpers.inputEmptyString(crashId, "crashId");
    helpers.inputValidObjectId(crashId, "crashId");
  } catch (e) {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
    });
  }
  try {
    const crash = await crashData.getCrashById(crashId);
    if (!crash) {
      return res.status(404).render("error", {
        title: helpers.APP_NAME,
        subTitle: "Error",
        error: "Crash Not Found",
      });
    }
    // load and show comments
    const comments = crash.comments || [];
    const parentComments = comments.filter((c) => c.parentCommentId === null);
    const replies = comments.filter((c) => c.parentCommentId !== null);

    let userVoteState = {
      hasVerified: false,
      hasRejected: false
    };
    if (req.session.user && crash.witness_reports) {
      const userId = req.session.user._id;
      const userReport = crash.witness_reports.find(
        (report) => report.raterId.toString() === userId
      );
      if (userReport) {
        if (userReport.vote === "verify") {
          userVoteState.hasVerified = true;
        } else if (userReport.vote === "reject") {
          userVoteState.hasRejected = true;
        }
      }
    }

    const witnessDisplayList = (crash.witness_reports || []).map((report) => {
      const name = report.raterDisplay ? report.raterDisplay : "Unknown User";

      return {
        name: name,
        colorClass: report.vote === "verify" ? "text-success" : "text-danger"
      };
    });

    let dateString = "N/A";
    if (crash.occurredAt) {
      dateString = new Date(crash.occurredAt).toDateString();
    }
    crash.occurredAt = dateString;

    // add parentComments and replies date as 1mn ago, 2h ago, or 1 day ago, 1 month ago, etc.
    parentComments.forEach((c) => {
      c.createdAt = helpers.timeAgo(c.createdAt);
    });
    replies.forEach((c) => {
      c.createdAt = helpers.timeAgo(c.createdAt);
    });

    return res.render("crash", {
      title: helpers.APP_NAME,
      subTitle: `Crash Details`,
      keywords: crash.summary,
      crash,
      parentComments,
      replies,
      user: req.session.user,
      message: req.query.message,
      hasVerified: userVoteState.hasVerified,
      hasRejected: userVoteState.hasRejected,
      witnessDisplayList: witnessDisplayList, 
    });
  } catch (e) {
    return res.status(404).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
    });
  }
});
/// ADD COMMENT TO CRASH /////////////////////////
router.route("/:crashId/comments").post(async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/");
  }

  let { crashId } = req.params;
  try {
    helpers.inputExist(crashId, "crashId");
    helpers.inputString(crashId, "crashId");
    crashId = crashId.trim();
    helpers.inputEmptyString(crashId, "crashId");
    helpers.inputValidObjectId(crashId, "crashId");
  } catch (e) {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
    });
  }
  let { text, parentCommentId } = req.body;
  try {
    helpers.inputExist(text, "text");
    helpers.inputString(text, "text");
    text = text.trim();
    helpers.inputEmptyString(text, "text");
  } catch (e) {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
    });
  }
  text = xss(text);
  parentCommentId = parentCommentId ? xss(parentCommentId) : null;
  if (parentCommentId) {
    try {
      helpers.inputValidObjectId(parentCommentId, "parentCommentId");
    } catch (e) {
      return res.status(400).render("error", {
        title: helpers.APP_NAME,
        subTitle: "Error",
        error: e,
      });
    }
  }
  // add comment
  try {
    await crashData.addCommentToCrash(
      crashId,
      req.session.user._id,
      text,
      parentCommentId
    );
    // seperate parent comments and replies
    const crash = await crashData.getCrashById(crashId);
    const parentComments = crash.comments.filter((c) => !c.parentCommentId);
    const replies = crash.comments.filter((c) => c.parentCommentId);

    // add parentComments and replies date as 1mn ago, 2h ago, or 1 day ago, 1 month ago, etc.
    parentComments.forEach((c) => {
      c.createdAt = helpers.timeAgo(c.createdAt);
    });
    replies.forEach((c) => {
      c.createdAt = helpers.timeAgo(c.createdAt);
    });

    // format crash date
    crash.occurredAt = crash.occurredAt
      ? new Date(crash.occurredAt).toDateString()
      : "N/A";

    return res.render("crash", {
      title: helpers.APP_NAME,
      subTitle: "Crash Details",
      crash,
      parentComments,
      replies,
      user: req.session.user,
    });
  } catch (e) {
    return res.status(500).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e.toString(),
    });
  }
});
// ============================================================================
// 5. SHARE CRASH
// ============================================================================
router.post("/:crashId/share", async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    let { email: to } = req.body;
    let { crashId } = req.params;

    // Validate and sanitize inputs
    if (!to || !crashId) {
      return res.status(400).render("recentCrashes", {
        title: helpers.APP_NAME,
        subTitle: "All Crashes",
        error: "Recipient email and crash ID are required.",
      });
    }

    // Validate crashId
    crashId = crashId.trim();
    helpers.inputEmptyString(crashId, "crashId");
    helpers.inputValidObjectId(crashId, "crashId");

    // Validate to email
    to = to.trim();
    helpers.inputExist(to, "to");
    helpers.inputString(to, "to");
    helpers.inputEmptyString(to, "to");
    helpers.inputValidEmail(to, "to");

    // Verify crash exists
    const crash = await crashData.getCrashById(crashId);
    if (!crash) {
      return res.status(404).render("error", {
        title: helpers.APP_NAME,
        subTitle: "Error",
        error: "Crash Not Found",
      });
    }

    // get full URL of the crash
    let crashUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    crashUrl = crashUrl.replace("/share", "");

    // XSS Protection
    const sanitizedTo = xss(to);
    const sanitizedSubject = xss(`Crash Report from ${helpers.APP_NAME}`);
    const sanitizedText = xss(
      `Hi there,\n\nA crash report has been shared with you.\nYou can view the details of the crash at the following link: ${crashUrl}\n\nBest regards,\n${helpers.APP_NAME} Team`
    );

    // Create a transporter object using SMTP transport
    const transporter = helpers.getEmailTransporter();

    // Set up email data
    const mailOptions = {
      from: `"${helpers.APP_NAME} Crash Report" <diamabo.dev@gmail.com>`,
      to: sanitizedTo,
      subject: sanitizedSubject,
      text: sanitizedText,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    // redirect back to recent crashes with success message
    return res
      .status(200)
      .redirect(
        `/crashes/${crashId}?message=Crash report sent successfully to ${sanitizedTo}`
      );
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: "Failed to send email.",
    });
  }
});

// ============================================================================
// RATE A CRASH
// ============================================================================
router.route('/:crashId/:voteType').post(async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  let { crashId, voteType } = req.params;
  const userId = req.session.user._id;

  const action = voteType.toLowerCase().trim();
  if (action !== 'verify' && action !== 'reject') {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: "Invalid vote type",
      user: req.session.user,
    });
  }

  try {
    helpers.inputExist(crashId, "crashId");
    helpers.inputString(crashId, "crashId");
    crashId = crashId.trim();
    helpers.inputEmptyString(crashId, "crashId");
    helpers.inputValidObjectId(crashId, "crashId");
  } catch (e) {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
      user: req.session.user,
    });
  }

  try{
    const voteCount = await crashData.getVoteCountByUser(userId);
    if(voteCount > 10){
      return res.status(403).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: "You can't witness or refute more than 10 times.",
      user: req.session.user,
      });
    }
  }catch (e){
  return res.status(400).render("error", {
    title: helpers.APP_NAME,
    subTitle: "Error",
    error: e,
    user: req.session.user,
  });    
}

  try {
    await crashData.rateCrash(crashId, userId, voteType, req.session.user.userId);
    return res.redirect(`/crashes/${crashId}`);
  } catch (e) {
    return res.status(500).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: "Could not register witness report:" + e,
      user: req.session.user,
    });
  }
});


// ============================================================================
// 6. CRASH STATISTICS
// ============================================================================
router.route("/current/stats").get(async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/");
  }

  try {
    const {
      crashesByBoroughWithStats,
      crashesByBoroughAndYear,
      pedestriansInjuredByBoroughAndYear,
      pedestriansKilledByBoroughAndYear,
      motoristsInjuredByBoroughAndYear,
      motoristsKilledByBoroughAndYear,
    } = await crashData.getCrashStatistics();

    // Prepare data for crashes by borough chart
    const crashesByBoroughLabels = crashesByBoroughAndYear.map(
      (item) => item._id.borough
    );
    const crashesByBoroughData = crashesByBoroughAndYear.map(
      (item) => item.count
    );
    const crashesByBoroughObj = {
      labels: crashesByBoroughLabels,
      data: crashesByBoroughData,
    };

    // Prepare data for pedestrians killed by borough
    const pedestriansKilledByBoroughLabels =
      pedestriansKilledByBoroughAndYear.map((item) => item._id.borough);
    const pedestriansKilledByBoroughData =
      pedestriansKilledByBoroughAndYear.map((item) => item.pedestriansKilled);
    const pedestriansKilledByBoroughObj = {
      labels: pedestriansKilledByBoroughLabels,
      data: pedestriansKilledByBoroughData,
    };

    // Prepare data for pedestrians injured by borough
    const pedestriansInjuredByBoroughLabels =
      pedestriansInjuredByBoroughAndYear.map((item) => item._id.borough);
    const pedestriansInjuredByBoroughData =
      pedestriansInjuredByBoroughAndYear.map((item) => item.pedestriansInjured);
    const pedestriansInjuredByBoroughObj = {
      labels: pedestriansInjuredByBoroughLabels,
      data: pedestriansInjuredByBoroughData,
    };

    // Prepare data for motorists injured by borough
    const motoristsInjuredByBoroughLabels =
      motoristsInjuredByBoroughAndYear.map((item) => item._id.borough);
    const motoristsInjuredByBoroughData = motoristsInjuredByBoroughAndYear.map(
      (item) => item.motoristsInjured
    );
    const motoristsInjuredByBoroughObj = {
      labels: motoristsInjuredByBoroughLabels,
      data: motoristsInjuredByBoroughData,
    };

    // Prepare data for motorists killed by borough
    const motoristsKilledByBoroughLabels = motoristsKilledByBoroughAndYear.map(
      (item) => item._id.borough
    );
    const motoristsKilledByBoroughData = motoristsKilledByBoroughAndYear.map(
      (item) => item.motoristsKilled
    );
    const motoristsKilledByBoroughObj = {
      labels: motoristsKilledByBoroughLabels,
      data: motoristsKilledByBoroughData,
    };

    // Prepare data for crashes by borough and year
    const crashesByYearLabels = crashesByBoroughAndYear.map(
      (item) => item._id.year
    );
    const crashesByYearData = crashesByBoroughAndYear.map((item) => item.count);
    const crashesByYearObj = {
      labels: crashesByYearLabels,
      data: crashesByYearData,
    };

    return res.render("crashStats", {
      title: helpers.APP_NAME,
      subTitle: "Crash Statistics",
      crashesByBoroughWithStats,
      crashesByBoroughObj,
      pedestriansInjuredByBoroughObj,
      pedestriansKilledByBoroughObj,
      motoristsInjuredByBoroughObj,
      motoristsKilledByBoroughObj,
      crashesByBoroughAndYear,
      crashesByYearObj,
      keywords:
        "crash statistics, crashes by borough, pedestrians killed by borough, pedestrians injured by borough, motorists killed by borough, crashes by year",
      user: req.session.user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: "Unable to retrieve crash statistics at this time.",
    });
  }
});
///////////////////////////////////////////////////
export default router;
