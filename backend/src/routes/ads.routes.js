const express = require("express");
const { getAdsConfig } = require("../controllers/ads.controller");
const router = express.Router();
router.get("/config", getAdsConfig);
module.exports = router;
