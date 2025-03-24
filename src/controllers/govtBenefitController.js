exports.getGovtBenefits = async (req, res) => {
    try {
        const targetLang = req.headers['accept-language'] || 'en';
        const benefits = await GovtBenefit.find();

        // If English is requested or language header is missing, return original
        if (targetLang === 'en') {
            return res.json(benefits);
        }

        // Translate each document
        const translatedBenefits = await Promise.all(
            benefits.map(benefit => benefit.translateTo(targetLang))
        );

        res.json(translatedBenefits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching benefits', error: error.message });
    }
};