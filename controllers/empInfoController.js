const PersonalInfo = require("../models/personalInfo");
const ParentsInfo = require("../models/parentsInfo");
const EmergencyInfo = require("../models/emergencyInfo");
const generateEmployeeNo = require("../helpers/employeeNo");

function parseMDY(input) {
  if (!input) return null;
  // if already a valid Date string (ISO), let Date parse it
  const iso = new Date(input);
  if (!isNaN(iso.getTime())) return iso;

  // accept mm/dd/yy or mm/dd/yyyy or mm-dd-yy
  const parts = String(input).trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    let mm = parseInt(parts[0], 10);
    let dd = parseInt(parts[1], 10);
    let yy = parseInt(parts[2], 10);
    if (isNaN(mm) || isNaN(dd) || isNaN(yy)) return null;
    // convert 2-digit year -> 2000+ 
    if (yy < 100) yy = 2000 + yy;
    // months in JS Date are 0-indexed
    return new Date(yy, mm - 1, dd);
  }
  return null;
}

// check if user is admin or hr
function requireAdminOrHR(user) {
  return user && (user.role === "admin" || user.role === "hr");
}

// create personal + parents + emergency info
exports.createEmpInfo = async (req, res) => {
  try {
    if (!["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { userID, personalInfo, parentsInfo, emergencyInfo } = req.body;

    if (!userID) {
      return res.status(400).json({ message: "userID is required" });
    }

    // check if personal info already exists for this user
    const existing = await PersonalInfo.findOne({ userID });
    if (existing) {
      return res.status(400).json({ message: "Personal info already exists for this user" });
    }

    // generate unique employee number
    const employeeNo = await generateEmployeeNo();

    // create personal info
    const personal = await PersonalInfo.create({
      ...personalInfo,
      userID,
      employeeNo
    });

    // create parents info linked to personal
    const parents = await ParentsInfo.create({
      ...parentsInfo,
      pInfoID: personal._id
    });

    // create emergency info linked to personal
    const emergency = await EmergencyInfo.create({
      ...emergencyInfo,
      pInfoID: personal._id
    });

    res.status(201).json({
      message: "Employee information created successfully",
      personal,
      parents,
      emergency
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get all employee infos (admin/hr)
exports.getAllEmpInfo = async (req, res) => {
  try {
    if (!["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // get personal info + user + department
    const personals = await PersonalInfo.find()
      .populate({
        path: "userID",
        select: "email role department jobTitle",
        populate: { path: "department", select: "departmentName jobTitles" }
      })
      .lean();

    // pull parents & emergency for all pInfoIDs in one go
    const pInfoIDs = personals.map(p => p._id);
    const [parentsList, emergencyList] = await Promise.all([
      ParentsInfo.find({ pInfoID: { $in: pInfoIDs } }).lean(),
      EmergencyInfo.find({ pInfoID: { $in: pInfoIDs } }).lean()
    ]);

    const parentsByP = Object.fromEntries(parentsList.map(x => [String(x.pInfoID), x]));
    const emergencyByP = Object.fromEntries(emergencyList.map(x => [String(x.pInfoID), x]));

    // attach related docs per personal
    const result = personals.map(p => ({
      ...p,
      parents: parentsByP[String(p._id)] || null,
      emergency: emergencyByP[String(p._id)] || null
    }));

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get employee info by ID
exports.getEmpInfoByID = async (req, res) => {
  try {
    const { userId } = req.params;

    // personal info for this user
    const personal = await PersonalInfo.findOne({ userID: userId })
      .populate({
        path: "userID",
        select: "username email role department isDisabled",
        populate: { path: "department", select: "departmentName jobTitle" }
      });

    if (!personal) {
      return res.status(404).json({ message: "No personal info found for this user" });
    }

    // pull linked parents and emergency info via pInfoID
    const [parents, emergency] = await Promise.all([
      ParentsInfo.findOne({ pInfoID: personal._id }),
      EmergencyInfo.findOne({ pInfoID: personal._id })
    ]);

    res.json({ personal, parents, emergency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// employee view their own info
exports.getMyInfo = async (req, res) => {
  try {
    const personal = await PersonalInfo.findOne({ userID: req.user._id })
      .populate("userID", "email role")
      .exec();
    if (!personal) return res.status(404).json({ message: "No info found" });

    const parents = await ParentsInfo.findOne({ pInfoID: personal._id });
    const emergency = await EmergencyInfo.findOne({ pInfoID: personal._id });

    res.json({ personal, parents, emergency });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePersonalInfo = async (req, res) => {
  try {
    if (!requireAdminOrHR(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { pInfoID } = req.params;
    const personal = await PersonalInfo.findById(pInfoID);
    if (!personal) return res.status(404).json({ message: "Personal info not found" });

    // disallow changing immutable fields
    const payload = { ...req.body };
    delete payload.userID;
    delete payload.employeeNo;

    // parse date fields if provided
    if (payload.hireDate) {
      const d = parseMDY(payload.hireDate);
      if (!d) return res.status(400).json({ message: "Invalid hireDate format" });
      payload.hireDate = d;
    }
    if (payload.birthDate) {
      const d = parseMDY(payload.birthDate);
      if (!d) return res.status(400).json({ message: "Invalid birthDate format" });
      payload.birthDate = d;
    }

    Object.assign(personal, payload);
    await personal.save();

    await personal.populate({ path: "userID", select: "email role username" });
    res.json(personal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateParentsInfo = async (req, res) => {
  try {
    if (!requireAdminOrHR(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { pInfoID } = req.params;
    const personal = await PersonalInfo.findById(pInfoID);
    if (!personal) return res.status(404).json({ message: "Personal info not found" });

    const parents = await ParentsInfo.findOne({ pInfoID });
    if (!parents) return res.status(404).json({ message: "Parents info not found" });

    const allowed = [
      "motherName", "mPhoneNo", "mOccupation", "mAddress", "mStatus",
      "fatherName", "fPhoneNo", "fOccupation", "fAddress", "fStatus"
    ];
    const payload = {};
    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

    Object.assign(parents, payload);
    await parents.save();

    res.json(parents);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateEmergencyInfo = async (req, res) => {
  try {
    if (!requireAdminOrHR(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { pInfoID } = req.params;
    const personal = await PersonalInfo.findById(pInfoID);
    if (!personal) return res.status(404).json({ message: "Personal info not found" });

    const emergency = await EmergencyInfo.findOne({ pInfoID });
    if (!emergency) return res.status(404).json({ message: "Emergency info not found" });

    const allowed = ["contactName", "contactNo", "relationship"];
    const payload = {};
    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

    Object.assign(emergency, payload);
    await emergency.save();

    res.json(emergency);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

