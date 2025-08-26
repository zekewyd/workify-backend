const Inquiry = require("../models/inquiries");
const PersonalInfo = require("../models/personalInfo");

// create inquiry (employee only)
exports.createInquiry = async (req, res) => {
  try {
    const { requestName, type, description } = req.body;
    if (!requestName || !type || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }
    // userID from token
    const inquiry = await Inquiry.create({
      requestName,
      type,
      description,
      userID: req.user._id
    });
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get inquiries
// admin/hr: all, employee: own inquiries
exports.getInquiries = async (req, res) => {
  try {
    const { role, _id } = req.user;

    let filter = {};
    if (role === "employee") {
      filter.userID = _id;
    }

    const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 }).lean();

    // attach employee name (from personalInfo)
    const userIDs = inquiries.map(i => i.userID);
    const infos = await PersonalInfo.find({ userID: { $in: userIDs } })
      .select("userID firstName middleName lastName")
      .lean();
    const infoMap = {};
    infos.forEach(i => {
      infoMap[i.userID.toString()] = `${i.firstName} ${i.middleName ? i.middleName + ' ' : ''}${i.lastName}`.trim();
    });

    const inquiriesWithName = inquiries.map(i => ({
      ...i,
      name: infoMap[i.userID.toString()] || "N/A"
    }));

    res.json(inquiriesWithName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// approve inquiry (admin/hr only)
exports.approveInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    inquiry.status = "Approved";
    inquiry.declineNotes = "";
    await inquiry.save();
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// decline inquiry (admin/hr only)
exports.declineInquiry = async (req, res) => {
  try {
    const { declineNotes } = req.body;
    if (!declineNotes) {
      return res.status(400).json({ message: "Decline reason required" });
    }
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    inquiry.status = "Declined";
    inquiry.declineNotes = declineNotes;
    await inquiry.save();
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};