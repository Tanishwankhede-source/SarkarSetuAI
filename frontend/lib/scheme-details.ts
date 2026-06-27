export interface SchemeExtension {
  description_hi: string;
  processing_time: string;
  processing_time_hi: string;
  helpline: string;
  application_steps: { step: number; title_en: string; title_hi: string; detail_en: string; detail_hi: string }[];
  key_highlights: { en: string; hi: string }[];
}

export const SCHEME_EXTENSIONS: Record<string, SchemeExtension> = {
  "pm-jan-dhan-yojana": {
    description_hi: "वित्तीय समावेशन के लिए राष्ट्रीय मिशन — बैंकिंग, बचत, ऋण, बीमा और पेंशन तक पहुंच।",
    processing_time: "Same day at bank branch",
    processing_time_hi: "बैंक शाखा में उसी दिन",
    helpline: "1800-11-0001",
    application_steps: [
      { step: 1, title_en: "Visit nearest bank", title_hi: "नजदीकी बैंक जाएं", detail_en: "Go to any bank branch or Business Correspondent (Bank Mitra).", detail_hi: "किसी भी बैंक शाखा या बैंक मित्र केंद्र पर जाएं।" },
      { step: 2, title_en: "Submit documents", title_hi: "दस्तावेज़ जमा करें", detail_en: "Provide Aadhaar and one identity proof. No minimum balance required.", detail_hi: "आधार और एक पहचान प्रमाण दें। न्यूनतम शेष राशि की आवश्यकता नहीं।" },
      { step: 3, title_en: "Account activated", title_hi: "खाता सक्रिय", detail_en: "Receive RuPay debit card and insurance benefits within 2 weeks.", detail_hi: "2 सप्ताह में रुपे डेबिट कार्ड और बीमा लाभ प्राप्त करें।" },
    ],
    key_highlights: [
      { en: "Zero balance account", hi: "शून्य शेष खाता" },
      { en: "₹1 lakh accident cover", hi: "₹1 लाख दुर्घटना बीमा" },
      { en: "Overdraft up to ₹10,000", hi: "₹10,000 तक ओवरड्राफ्ट" },
    ],
  },
  "ayushman-bharat-pmjay": {
    description_hi: "दुनिया की सबसे बड़ी स्वास्थ्य बीमा योजना — प्रति परिवार प्रति वर्ष ₹5 लाख तक कवरेज।",
    processing_time: "7–15 days after verification",
    processing_time_hi: "सत्यापन के बाद 7–15 दिन",
    helpline: "14555 / 1800-111-565",
    application_steps: [
      { step: 1, title_en: "Check eligibility", title_hi: "पात्रता जांचें", detail_en: "Verify your name in SECC 2011 list or state BPL database.", detail_hi: "SECC 2011 सूची या राज्य BPL डेटाबेस में नाम जांचें।" },
      { step: 2, title_en: "Visit Ayushman Mitra", title_hi: "आयुष्मान मित्र से मिलें", detail_en: "Go to empanelled hospital or CSC with Aadhaar and ration card.", detail_hi: "आधार और राशन कार्ड के साथ अस्पताल या सीएससी जाएं।" },
      { step: 3, title_en: "Get Ayushman card", title_hi: "आयुष्मान कार्ड प्राप्त करें", detail_en: "Biometric verification and card issuance at enrollment centre.", detail_hi: "नामांकन केंद्र पर बायोमेट्रिक सत्यापन और कार्ड जारी।" },
    ],
    key_highlights: [
      { en: "₹5 lakh per family/year", hi: "प्रति परिवार ₹5 लाख/वर्ष" },
      { en: "Cashless at 25,000+ hospitals", hi: "25,000+ अस्पतालों में कैशलेस" },
      { en: "Covers pre & post hospitalization", hi: "पूर्व और बाद अस्पताल खर्च शामिल" },
    ],
  },
  "pm-awas-yojana-gramin": {
    description_hi: "ग्रामीण परिवारों को पक्का मकान बनाने के लिए वित्तीय सहायता।",
    processing_time: "30–90 days after approval",
    processing_time_hi: "स्वीकृति के बाद 30–90 दिन",
    helpline: "1800-11-6446",
    application_steps: [
      { step: 1, title_en: "Register on PMAY-G portal", title_hi: "पोर्टल पर पंजीकरण", detail_en: "Apply via gram panchayat or pmayg.nic.in with BPL and land documents.", detail_hi: "ग्राम पंचायत या pmayg.nic.in से BPL और भूमि दस्तावेज़ के साथ आवेदन।" },
      { step: 2, title_en: "Gram Sabha verification", title_hi: "ग्राम सभा सत्यापन", detail_en: "Your name is verified in village priority list.", detail_hi: "ग्राम प्राथमिकता सूची में नाम सत्यापित होता है।" },
      { step: 3, title_en: "Fund release", title_hi: "धनराशि जारी", detail_en: "Installments credited to bank account in 3–4 tranches.", detail_hi: "3–4 किस्तों में बैंक खाते में राशि जमा।" },
    ],
    key_highlights: [
      { en: "₹1.2–1.3 lakh assistance", hi: "₹1.2–1.3 लाख सहायता" },
      { en: "MGNREGA labour support", hi: "मनरेगा श्रम सहायता" },
      { en: "Toilet under SBM included", hi: "एसबीएम शौचालय शामिल" },
    ],
  },
  "pm-awas-yojana-urban": {
    description_hi: "शहरी क्षेत्रों में सभी के लिए आवास — ब्याज सब्सिडी और निर्माण सहायता।",
    processing_time: "15–45 days",
    processing_time_hi: "15–45 दिन",
    helpline: "1800-11-6163",
    application_steps: [
      { step: 1, title_en: "Apply on PMAY portal", title_hi: "पीएमएवाई पोर्टल पर आवेदन", detail_en: "Register at pmaymis.gov.in with Aadhaar and income proof.", detail_hi: "आधार और आय प्रमाण के साथ pmaymis.gov.in पर पंजीकरण।" },
      { step: 2, title_en: "ULB verification", title_hi: "नगर निकाय सत्यापन", detail_en: "Urban local body verifies eligibility and property status.", detail_hi: "नगर निकाय पात्रता और संपत्ति स्थिति सत्यापित करता है।" },
      { step: 3, title_en: "Subsidy credited", title_hi: "सब्सिडी जमा", detail_en: "Interest subsidy applied to home loan or direct assistance released.", detail_hi: "गृह ऋण पर ब्याज सब्सिडी या प्रत्यक्ष सहायता जारी।" },
    ],
    key_highlights: [
      { en: "Up to 6.5% interest subsidy", hi: "6.5% तक ब्याज सब्सिडी" },
      { en: "EWS/LIG/MIG categories", hi: "ईडब्ल्यूएस/एलआईजी/एमआईजी श्रेणियां" },
      { en: "No pucca house ownership rule", hi: "कहीं भी पक्का मकान न हो नियम" },
    ],
  },
  "pm-kisan-samman-nidhi": {
    description_hi: "किसान परिवारों को प्रति वर्ष ₹6,000 की आय सहायता।",
    processing_time: "2–4 weeks per installment",
    processing_time_hi: "प्रति किस्त 2–4 सप्ताह",
    helpline: "155261 / 011-24300606",
    application_steps: [
      { step: 1, title_en: "Register on PM-KISAN", title_hi: "पीएम-किसान पर पंजीकरण", detail_en: "Apply via pmkisan.gov.in or visit agriculture office.", detail_hi: "pmkisan.gov.in या कृषि कार्यालय में आवेदन।" },
      { step: 2, title_en: "Land record verification", title_hi: "भूमि रिकॉर्ड सत्यापन", detail_en: "Revenue department verifies cultivable land up to 2 hectares.", detail_hi: "राजस्व विभाग 2 हेक्टेयर तक की खेती योग्य भूमि सत्यापित करता है।" },
      { step: 3, title_en: "Direct benefit transfer", title_hi: "प्रत्यक्ष लाभ अंतरण", detail_en: "₹2,000 credited every 4 months to bank account.", detail_hi: "हर 4 महीने में ₹2,000 बैंक खाते में जमा।" },
    ],
    key_highlights: [
      { en: "₹6,000/year in 3 installments", hi: "₹6,000/वर्ष 3 किस्तों में" },
      { en: "Direct to bank account", hi: "सीधे बैंक खाते में" },
      { en: "For small & marginal farmers", hi: "छोटे और सीमांत किसानों के लिए" },
    ],
  },
  "nsap-widow-pension": {
    description_hi: "बीपीएल विधवाओं को मासिक पेंशन — सामाजिक सुरक्षा और आर्थिक सहारा।",
    processing_time: "30–60 days",
    processing_time_hi: "30–60 दिन",
    helpline: "1800-11-4477",
    application_steps: [
      { step: 1, title_en: "Apply at block office", title_hi: "ब्लॉक कार्यालय में आवेदन", detail_en: "Submit form at BDO office or nsap.nic.in with death certificate.", detail_hi: "बीडीओ कार्यालय या nsap.nic.in पर मृत्यु प्रमाण पत्र के साथ आवेदन।" },
      { step: 2, title_en: "Field verification", title_hi: "क्षेत्र सत्यापन", detail_en: "Social welfare officer verifies BPL status and age.", detail_hi: "समाज कल्याण अधिकारी BPL स्थिति और आयु सत्यापित करता है।" },
      { step: 3, title_en: "Pension starts", title_hi: "पेंशन शुरू", detail_en: "Monthly amount credited to bank account.", detail_hi: "मासिक राशि बैंक खाते में जमा।" },
    ],
    key_highlights: [
      { en: "₹300/month from Centre", hi: "केंद्र से ₹300/माह" },
      { en: "State top-up available", hi: "राज्य अतिरिक्त राशि" },
      { en: "Age 40–79 years", hi: "आयु 40–79 वर्ष" },
    ],
  },
  "pmsby": {
    description_hi: "केवल ₹20 प्रति वर्ष में दुर्घटना बीमा — मृत्यु और विकलांगता कवर।",
    processing_time: "Instant via bank",
    processing_time_hi: "बैंक से तत्काल",
    helpline: "1800-11-0001",
    application_steps: [
      { step: 1, title_en: "Visit your bank", title_hi: "अपने बैंक जाएं", detail_en: "Enroll at any bank branch with active savings account.", detail_hi: "सक्रिय बचत खाते के साथ किसी भी बैंक शाखा में नामांकन।" },
      { step: 2, title_en: "Auto-debit consent", title_hi: "ऑटो-डेबिट सहमति", detail_en: "₹20/year auto-debited from account before June 1.", detail_hi: "1 जून से पहले खाते से ₹20/वर्ष ऑटो-डेबिट।" },
      { step: 3, title_en: "Coverage active", title_hi: "कवरेज सक्रिय", detail_en: "₹2 lakh cover valid till May 31 next year.", detail_hi: "₹2 लाख कवर अगले 31 मई तक मान्य।" },
    ],
    key_highlights: [
      { en: "Only ₹20/year premium", hi: "केवल ₹20/वर्ष प्रीमियम" },
      { en: "₹2 lakh accident cover", hi: "₹2 लाख दुर्घटना कवर" },
      { en: "Renewable annually", hi: "वार्षिक नवीनीकरण" },
    ],
  },
  "pmjjby": {
    description_hi: "किसी भी कारण से मृत्यु पर ₹2 लाख जीवन बीमा कवर।",
    processing_time: "Instant via bank",
    processing_time_hi: "बैंक से तत्काल",
    helpline: "1800-11-0001",
    application_steps: [
      { step: 1, title_en: "Bank enrollment", title_hi: "बैंक नामांकन", detail_en: "Apply at bank with Aadhaar-linked account (age 18–50).", detail_hi: "आधार-लिंक खाते के साथ बैंक में आवेदन (आयु 18–50)।" },
      { step: 2, title_en: "Premium debit", title_hi: "प्रीमियम डेबिट", detail_en: "₹436/year auto-debited annually.", detail_hi: "₹436/वर्ष स्वचालित डेबिट।" },
      { step: 3, title_en: "Life cover active", title_hi: "जीवन कवर सक्रिय", detail_en: "₹2 lakh payable to nominee on death.", detail_hi: "मृत्यु पर नामिती को ₹2 लाख।" },
    ],
    key_highlights: [
      { en: "₹2 lakh life cover", hi: "₹2 लाख जीवन कवर" },
      { en: "₹436/year premium", hi: "₹436/वर्ष प्रीमियम" },
      { en: "Any cause of death", hi: "किसी भी कारण से मृत्यु" },
    ],
  },
  "pm-ujjwala-yojana": {
    description_hi: "बीपीएल महिलाओं को मुफ्त एलपीजी कनेक्शन — स्वच्छ ईंधन तक पहुंच।",
    processing_time: "7–21 days",
    processing_time_hi: "7–21 दिन",
    helpline: "1800-266-6696",
    application_steps: [
      { step: 1, title_en: "Apply via LPG distributor", title_hi: "एलपीजी वितरक से आवेदन", detail_en: "Visit nearest LPG agency or apply on pmuy.gov.in.", detail_hi: "नजदीकी एलपीजी एजेंसी या pmuy.gov.in पर आवेदन।" },
      { step: 2, title_en: "BPL verification", title_hi: "BPL सत्यापन", detail_en: "SECC/BPL list cross-checked by oil marketing company.", detail_hi: "तेल विपणन कंपनी द्वारा SECC/BPL सूची जांच।" },
      { step: 3, title_en: "Connection & cylinder", title_hi: "कनेक्शन और सिलेंडर", detail_en: "Free connection, first refill at subsidized rate.", detail_hi: "मुफ्त कनेक्शन, पहला रिफिल सब्सिडी दर पर।" },
    ],
    key_highlights: [
      { en: "Free LPG connection", hi: "मुफ्त एलपीजी कनेक्शन" },
      { en: "Deposit waiver", hi: "जमा राशि माफ" },
      { en: "For BPL women only", hi: "केवल BPL महिलाओं के लिए" },
    ],
  },
  "pm-scholarship-sc-st": {
    description_hi: "एससी/एसटी छात्रों के उच्च शिक्षा के लिए छात्रवृत्ति — वित्तीय बाधा दूर।",
    processing_time: "60–90 days after academic session",
    processing_time_hi: "शैक्षणिक सत्र के बाद 60–90 दिन",
    helpline: "0120-6619540",
    application_steps: [
      { step: 1, title_en: "Apply on NSP portal", title_hi: "एनएसपी पोर्टल पर आवेदन", detail_en: "Register at scholarships.gov.in with institute details.", detail_hi: "संस्थान विवरण के साथ scholarships.gov.in पर पंजीकरण।" },
      { step: 2, title_en: "Institute verification", title_hi: "संस्थान सत्यापन", detail_en: "College verifies enrollment and forwards application.", detail_hi: "कॉलेज नामांकन सत्यापित कर आवेदन अग्रेषित करता है।" },
      { step: 3, title_en: "Scholarship disbursed", title_hi: "छात्रवृत्ति वितरित", detail_en: "Amount credited to student bank account.", detail_hi: "राशि छात्र बैंक खाते में जमा।" },
    ],
    key_highlights: [
      { en: "₹7,800–12,000/year", hi: "₹7,800–12,000/वर्ष" },
      { en: "Post-matric courses", hi: "पोस्ट-मैट्रिक पाठ्यक्रम" },
      { en: "SC/ST students", hi: "एससी/एसटी छात्र" },
    ],
  },
  "pm-mudra-yojana": {
    description_hi: "सूक्ष्म और लघु व्यवसायों को ऋण — बिना जमानत Shishu ऋण।",
    processing_time: "7–15 working days",
    processing_time_hi: "7–15 कार्य दिवस",
    helpline: "1800-180-1111",
    application_steps: [
      { step: 1, title_en: "Choose loan category", title_hi: "ऋण श्रेणी चुनें", detail_en: "Shishu (≤₹50K), Kishore (₹50K–5L), or Tarun (₹5L–10L).", detail_hi: "शिशु, किशोर, या तरुण श्रेणी चुनें।" },
      { step: 2, title_en: "Apply at bank/NBFC", title_hi: "बैंक/एनबीएफसी में आवेदन", detail_en: "Submit business plan, Aadhaar, PAN at any Mudra partner.", detail_hi: "व्यवसाय योजना, आधार, पैन किसी भी मुद्रा भागीदार पर जमा।" },
      { step: 3, title_en: "Loan disbursed", title_hi: "ऋण वितरित", detail_en: "Amount credited after credit assessment.", detail_hi: "क्रेडिट मूल्यांकन के बाद राशि जमा।" },
    ],
    key_highlights: [
      { en: "Up to ₹10 lakh", hi: "₹10 लाख तक" },
      { en: "No collateral for Shishu", hi: "शिशु में बिना जमानत" },
      { en: "All non-farm enterprises", hi: "सभी गैर-कृषि उद्योग" },
    ],
  },
  "standup-india": {
    description_hi: "एससी/एसटी और महिला उद्यमियों को ₹10 लाख–₹1 करोड़ का बैंक ऋण।",
    processing_time: "15–30 days",
    processing_time_hi: "15–30 दिन",
    helpline: "1800-180-1111",
    application_steps: [
      { step: 1, title_en: "Register on Stand-Up Mitra", title_hi: "स्टैंड-अप मित्रा पर पंजीकरण", detail_en: "Create profile at standupmitra.in with business details.", detail_hi: "व्यवसाय विवरण के साथ standupmitra.in पर प्रोफाइल बनाएं।" },
      { step: 2, title_en: "Bank loan processing", title_hi: "बैंक ऋण प्रक्रिया", detail_en: "Submit project report, caste certificate, bank statements.", detail_hi: "परियोजना रिपोर्ट, जाति प्रमाण पत्र, बैंक स्टेटमेंट जमा।" },
      { step: 3, title_en: "Loan sanction", title_hi: "ऋण स्वीकृति", detail_en: "75% project cost financed, up to 7 years repayment.", detail_hi: "परियोजना लागत का 75%, 7 वर्ष तक चुकौती।" },
    ],
    key_highlights: [
      { en: "₹10L–₹1Cr loan", hi: "₹10L–₹1Cr ऋण" },
      { en: "SC/ST or women entrepreneurs", hi: "एससी/एसटी या महिला उद्यमी" },
      { en: "Greenfield enterprises", hi: "नए उद्यम" },
    ],
  },
  "atal-pension-yojana": {
    description_hi: "असंगठित क्षेत्र के श्रमिकों के लिए गारंटीड मासिक पेंशन 60 वर्ष की आयु के बाद।",
    processing_time: "Same day at bank",
    processing_time_hi: "बैंक में उसी दिन",
    helpline: "1800-110-069",
    application_steps: [
      { step: 1, title_en: "Visit bank branch", title_hi: "बैंक शाखा जाएं", detail_en: "Apply at any bank with savings account (age 18–40).", detail_hi: "बचत खाते के साथ किसी भी बैंक में आवेदन (आयु 18–40)।" },
      { step: 2, title_en: "Choose pension amount", title_hi: "पेंशन राशि चुनें", detail_en: "Select ₹1,000–₹5,000/month pension target.", detail_hi: "₹1,000–₹5,000/माह पेंशन लक्ष्य चुनें।" },
      { step: 3, title_en: "Auto-debit setup", title_hi: "ऑटो-डेबिट सेटअप", detail_en: "Monthly contribution auto-debited till age 60.", detail_hi: "60 वर्ष तक मासिक योगदान ऑटो-डेबिट।" },
    ],
    key_highlights: [
      { en: "₹1,000–5,000/month pension", hi: "₹1,000–5,000/माह पेंशन" },
      { en: "Govt co-contribution 50%", hi: "सरकार 50% सह-योगदान" },
      { en: "Guaranteed returns", hi: "गारंटीड रिटर्न" },
    ],
  },
  "obc-pre-matric-scholarship": {
    description_hi: "कक्षा 9–10 में पढ़ रहे ओबीसी छात्रों के लिए छात्रवृत्ति।",
    processing_time: "60–90 days",
    processing_time_hi: "60–90 दिन",
    helpline: "0120-6619540",
    application_steps: [
      { step: 1, title_en: "Apply on NSP", title_hi: "एनएसपी पर आवेदन", detail_en: "scholarships.gov.in with OBC certificate and marksheet.", detail_hi: "ओबीसी प्रमाण पत्र और अंकपत्र के साथ scholarships.gov.in।" },
      { step: 2, title_en: "School verification", title_hi: "स्कूल सत्यापन", detail_en: "Headmaster verifies attendance and enrollment.", detail_hi: "प्रधानाध्यापक उपस्थिति और नामांकन सत्यापित करता है।" },
      { step: 3, title_en: "Scholarship credited", title_hi: "छात्रवृत्ति जमा", detail_en: "₹4,500 (day scholar) or ₹7,000 (hosteller) per year.", detail_hi: "₹4,500 (दिवास्वी) या ₹7,000 (छात्रावासी) प्रति वर्ष।" },
    ],
    key_highlights: [
      { en: "Class 9 & 10 OBC students", hi: "कक्षा 9 और 10 ओबीसी छात्र" },
      { en: "Income limit ₹1 lakh", hi: "आय सीमा ₹1 लाख" },
      { en: "Books & hostel covered", hi: "पुस्तकें और छात्रावास शामिल" },
    ],
  },
  "pm-vishwakarma-yojana": {
    description_hi: "18 पारंपरिक शिल्पों में कारीगरों को प्रशिक्षण, औजार और ऋण सहायता।",
    processing_time: "15–30 days for registration",
    processing_time_hi: "पंजीकरण 15–30 दिन",
    helpline: "1800-11-3377",
    application_steps: [
      { step: 1, title_en: "Register on PM Vishwakarma", title_hi: "पीएम विश्वकर्मा पर पंजीकरण", detail_en: "Apply at pmvishwakarma.gov.in with trade self-declaration.", detail_hi: "व्यापार स्व-घोषणा के साथ pmvishwakarma.gov.in पर आवेदन।" },
      { step: 2, title_en: "Skill verification", title_hi: "कौशल सत्यापन", detail_en: "Local committee verifies traditional trade engagement.", detail_hi: "स्थानीय समिति पारंपरिक व्यापार सत्यापित करती है।" },
      { step: 3, title_en: "Benefits released", title_hi: "लाभ जारी", detail_en: "₹15,000 toolkit + training stipend + collateral-free loan.", detail_hi: "₹15,000 औजार + प्रशिक्षण भत्ता + बिना जमानत ऋण।" },
    ],
    key_highlights: [
      { en: "₹15,000 toolkit grant", hi: "₹15,000 औजार अनुदान" },
      { en: "₹500/day training stipend", hi: "₹500/दिन प्रशिक्षण भत्ता" },
      { en: "₹3 lakh collateral-free loan", hi: "₹3 लाख बिना जमानत ऋण" },
    ],
  },
};

export function getSchemeExtension(slug: string): SchemeExtension | null {
  return SCHEME_EXTENSIONS[slug] || null;
}
