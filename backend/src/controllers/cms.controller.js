const CmsPage = require("../models/CmsPage.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/** GET /api/cms/:key — public, powers Terms, Privacy, About, FAQs, Contact, Help & Support */
const getPage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findOne({ key: req.params.key, isEnabled: true });
  if (!page) throw new ApiError(404, "Page not found or currently disabled.");
  res.status(200).json({ success: true, data: page });
});

/** PATCH /api/cms/:key — admin/superadmin content edit */
const updatePage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findOneAndUpdate(
    { key: req.params.key },
    { ...req.body, lastEditedBy: req.user._id },
    { new: true, upsert: true }
  );
  res.status(200).json({ success: true, data: page });
});

/** PATCH /api/cms/:key/toggle — superadmin-only route enable/disable */
const togglePage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findOneAndUpdate(
    { key: req.params.key },
    { isEnabled: req.body.isEnabled },
    { new: true }
  );
  res.status(200).json({ success: true, data: page });
});

module.exports = { getPage, updatePage, togglePage };
