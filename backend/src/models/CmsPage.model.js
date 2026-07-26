const mongoose = require("mongoose");


const faqItemSchema = new mongoose.Schema(
  { question: String, answer: String, order: { type: Number, default: 0 } },
  { _id: true }
);

const cmsPageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "home",
        "terms_and_conditions",
        "privacy_policy",
        "refund_policy",
        "shipping_policy",
        "about_us",
        "contact_us",
        "help_support",
        "faqs",
      ],
    },
    title: { type: String, required: true },
    content: { type: String }, // rich-text/HTML body (rendered as sanitized HTML on frontend)
    faqItems: [faqItemSchema], // used only for the "faqs" key
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
    isEnabled: { type: Boolean, default: true }, // superadmin route-level disable
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CmsPage", cmsPageSchema);
