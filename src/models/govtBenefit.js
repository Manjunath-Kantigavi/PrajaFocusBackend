const mongoose = require("mongoose");
const translate = require('@vitalets/google-translate-api');

const govtBenefitSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String, required: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    applicationLink: { type: String, required: true },
    subscriptionRequired: { type: Boolean, default: false }
}, { timestamps: true });

// Add a method to translate the document
govtBenefitSchema.methods.translateTo = async function(targetLang) {
    try {
        const fieldsToTranslate = ['title', 'department', 'description', 'eligibility'];
        const translatedDoc = this.toObject();

        await Promise.all(fieldsToTranslate.map(async (field) => {
            if (this[field]) {
                const result = await translate(this[field], { to: targetLang });
                translatedDoc[field] = result.text;
            }
        }));

        return translatedDoc;
    } catch (error) {
        console.error('Translation error:', error);
        return this; // Return original document if translation fails
    }
};

module.exports = mongoose.model("GovtBenefit", govtBenefitSchema);
