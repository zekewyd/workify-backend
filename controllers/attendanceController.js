const Attendance = require("../models/attendance");
const { toManila, manilaStartEndOfDay } = require("../helpers/timezone");
const { handleBase64Image } = require("../middlewares/upload");

function fullUrl(req, filename) {
  if (!filename) return null;
  const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/attendance/${filename}`;
}

async function findOpenAttendance(userId) {
  const { startUtc, endUtc } = manilaStartEndOfDay(new Date());
  return Attendance.findOne({
    userId,
    clockInAt: { $gte: startUtc, $lte: endUtc },
    clockOutAt: { $exists: false },
  }).sort({ clockInAt: -1 });
}

exports.clockIn = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const existingOpen = await findOpenAttendance(userId);
    if (existingOpen) {
      return res
        .status(409)
        .json({ message: "Already clocked in today", id: existingOpen._id });
    }

    let photoFilename = null;
    if (req.file?.filename) {
      photoFilename = req.file.filename;
    } else if (req.body.base64Image) {
      const saved = await handleBase64Image(req.body.base64Image);
      photoFilename = saved?.filename || null;
    }

    const now = new Date();
    const { ymd } = toManila(now);

    const attendance = await Attendance.create({
      userId,
      status: "Clocked In",
      clockInAt: now,
      clockInLocalYMD: ymd,
      clockInLocation: {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        accuracy: req.body.accuracy,
        address: req.body.address,
      },
      clockInPhoto: photoFilename,
      meta: {
        userAgent: req.get("user-agent") || "",
        ip: req.ip,
      },
    });

    res.status(201).json({
      message: "Clocked In",
      id: attendance._id,
      clockInAt: attendance.clockInAt,
      photoUrl: fullUrl(req, photoFilename),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const open = await findOpenAttendance(userId);
    if (!open) {
      return res.status(409).json({ message: "No open attendance found today" });
    }

    let photoFilename = null;
    if (req.file?.filename) {
      photoFilename = req.file.filename;
    } else if (req.body.base64Image) {
      const saved = await handleBase64Image(req.body.base64Image);
      photoFilename = saved?.filename || null;
    }

    const now = new Date();
    const duration = Math.max(
      0,
      Math.floor((now.getTime() - open.clockInAt.getTime()) / 1000)
    );

    open.status = "Clocked Out";
    open.clockOutAt = now;
    open.clockOutLocation = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      accuracy: req.body.accuracy,
      address: req.body.address,
    };
    open.clockOutPhoto = photoFilename;
    open.workDurationSec = duration;

    await open.save();

    res.json({
      message: "Clocked Out",
      id: open._id,
      clockInAt: open.clockInAt,
      clockOutAt: open.clockOutAt,
      workDurationSec: duration,
      photoUrl: fullUrl(req, photoFilename),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.myAttendance = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { from, to } = req.query;
    const query = { userId };
    if (from || to) {
      query.clockInAt = {};
      if (from) query.clockInAt.$gte = new Date(from);
      if (to) query.clockInAt.$lte = new Date(to);
    }

    const records = await Attendance.find(query).sort({ clockInAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.todayAttendance = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId; // fallback
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const { startUtc, endUtc } = manilaStartEndOfDay(new Date());

    const attendance = await Attendance.findOne({
      userId,
      clockInAt: { $gte: startUtc, $lte: endUtc }
    }).sort({ clockInAt: -1 });

    if (!attendance) {
      return res.json(null);
    }

    res.json({
      id: attendance._id,
      clockInAt: attendance.clockInAt,
      clockOutAt: attendance.clockOutAt,
      status: attendance.status,
      photoUrl: fullUrl(req, attendance.clockInPhoto || attendance.clockOutPhoto)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

