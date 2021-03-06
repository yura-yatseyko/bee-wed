const express = require('express');

const router = express.Router();

router.get('/privacypolicy', (req, res) => {

    let html = "Effective date: October 18, 2018<br>Bee Wed (\"us\", \"we\", or \"our\") operates the www.beewed.ie website and the Bee Wed mobile application (hereinafter referred to as the \"Service\").<br>This page informs you of our policies regarding the collection, use and disclosure of personal data when you use our Service and the choices you have associated with that data.<br>We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, the terms used in this Privacy Policy have the same meanings as in our Terms and Conditions.<br>Definitions<br>" +
    "<strong>Service</strong><br>" +
    "Service means the www.beewed.ie website and the Bee Wed mobile application operated by Bee Wed<br>" +
    "<strong>Personal Data</strong><br>" +
    "Personal Data means data about a living individual who can be identified from those data (or from those and other information either in our possession or likely to come into our possession).<br>" +
    "<strong>Usage Data</strong><br>" +
    "Usage Data is data collected automatically either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).<br>" +
    "<strong>Cookies</strong><br>" +
    "Cookies are small files stored on your device (computer or mobile device).<br>" +
    "<strong>Data Controller</strong><br>" +
    "Data Controller means the natural or legal person who (either alone or jointly or in common with other persons) determines the purposes for which and the manner in which any personal information are, or are to be, processed.<br>" +
    "For the purpose of this Privacy Policy, we are a Data Controller of your Personal Data.<br>" +
    "<strong>Data Processors (or Service Providers)</strong><br>" +
    "Data Processor (or Service Provider) means any natural or legal person who processes the data on behalf of the Data Controller.<br>" +
    "We may use the services of various Service Providers in order to process your data more effectively.<br>" +
    "<strong>Data Subject (or User)</strong><br>" +
    "Data Subject is any living individual who is using our Service and is the subject of Personal Data.<br>" +
    "Information Collection and Use<br>" +
    "We collect several different types of information for various purposes to provide and improve our Service to you.<br>" +
    "Types of Data Collected<br>" +
    "Personal Data<br>" +
    "While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (\"Personal Data\"). Personally identifiable information may include, but is not limited to:<br>" +
    "Email address<br>" +
    "First name and last name<br>" +
    "Phone number<br>" +
    "Address, State, Province, ZIP/Postal code, City<br>" +
    "Cookies and Usage Data<br>" +
    "We may use your Personal Data to contact you with newsletters, marketing or promotional materials and other information that may be of interest to you. You may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or the instructions provided in any email we send.<br>" +
    "Usage Data<br>" +
    "We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device (\"Usage Data\").<br>" +
    "This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.<br>" +
    "When you access the Service with a mobile device, this Usage Data may include information such as the type of mobile device you use, your mobile device unique ID, the IP address of your mobile device, your mobile operating system, the type of mobile Internet browser you use, unique device identifiers and other diagnostic data.<br>" +
    "Location Data<br>" +
    "We may use and store information about your location if you give us permission to do so (\"Location Data\"). We use this data to provide features of our Service, to improve and customise our Service.<br>" +
    "You can enable or disable location services when you use our Service at any time by way of your device settings.<br>" +
    "Tracking Cookies Data<br>" +
    "We use cookies and similar tracking technologies to track the activity on our Service and we hold certain information.<br>" +
    "Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Other tracking technologies are also used such as beacons, tags and scripts to collect and track information and to improve and analyse our Service.<br>" +
    "You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.<br>" +
    "Examples of Cookies we use:<br>" +
    "<strong>Session Cookies.</strong> We use Session Cookies to operate our Service.<br>" +
    "<strong>Preference Cookies.</strong> We use Preference Cookies to remember your preferences and various settings.<br>" +
    "<strong>Security Cookies.</strong> We use Security Cookies for security purposes.<br>" +
    "Use of Data<br>" +
    "Bee Wed uses the collected data for various purposes:<br>" +
    "To provide and maintain our Service<br>" +
    "To notify you about changes to our Service<br>" +
    "To allow you to participate in interactive features of our Service when you choose to do so<br>" +
    "To provide customer support<br>" +
    "To gather analysis or valuable information so that we can improve our Service<br>" +
    "To monitor the usage of our Service<br>" +
    "To detect, prevent and address technical issues<br>" +
    "To provide you with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless you have opted not to receive such information<br>" +
    "Legal Basis for Processing Personal Data under the General Data Protection Regulation (GDPR)<br>" +
    "If you are from the European Economic Area (EEA), Bee Wed legal basis for collecting and using the personal information described in this Privacy Policy depends on the Personal Data we collect and the specific context in which we collect it.<br>" +
    "Bee Wed may process your Personal Data because:<br>" +
    "We need to perform a contract with you<br>" +
    "You have given us permission to do so<br>" +
    "The processing is in our legitimate interests and it is not overridden by your rights<br>" +
    "For payment processing purposes<br>" +
    "To comply with the law<br>" +
    "Retention of Data<br>" +
    "Bee Wed will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes and enforce our legal agreements and policies.<br>" +
    "Bee Wed will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of our Service, or we are legally obligated to retain this data for longer periods.<br>" +
    "Transfer of Data<br>" +
    "Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.<br>" +
    "If you are located outside Ireland and choose to provide information to us, please note that we transfer the data, including Personal Data, to Ireland and process it there.<br>" +
    "Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.<br>" +
    "Bee Wed will take all the steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your Personal Data will take place to an organisation or a country unless there are adequate controls in place including the security of your data and other personal information.<br>" +
    "Disclosure of Data<br>" +
    "Business Transaction<br>" +
    "If Bee Wed is involved in a merger, acquisition or asset sale, your Personal Data may be transferred. We will provide notice before your Personal Data is transferred and becomes subject to a different Privacy Policy.<br>" +
    "Disclosure for Law Enforcement<br>" +
    "Under certain circumstances, Bee Wed may be required to disclose your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).<br>" +
    "Legal Requirements<br>" +
    "Bee Wed may disclose your Personal Data in the good faith belief that such action is necessary to:<br>" +
    "To comply with a legal obligation<br>" +
    "To protect and defend the rights or property of Bee Wed<br>" +
    "To prevent or investigate possible wrongdoing in connection with the Service<br>" +
    "To protect the personal safety of users of the Service or the public<br>" +
    "To protect against legal liability<br>" +
    "Security of Data<br>" +
    "The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.<br>" +
    "Our Policy on \"Do Not Track\" Signals under the California Online Protection Act (CalOPPA)<br>" +
    "We do not support Do Not Track (\"DNT\"). Do Not Track is a preference you can set in your web browser to inform websites that you do not want to be tracked.<br>" +
    "You can enable or disable Do Not Track by visiting the Preferences or Settings page of your web browser.<br>" +
    "Your Data Protection Rights under the General Data Protection Regulation (GDPR)<br>" +
    "If you are a resident of the European Economic Area (EEA), you have certain data protection rights. Bee Wed aims to take reasonable steps to allow you to correct, amend, delete or limit the use of your Personal Data.<br>" +
    "If you wish to be informed about what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.<br>" +
    "In certain circumstances, you have the following data protection rights:<br>" +
    "<strong>The right to access, update or delete the information we have on you.</strong> Whenever made possible, you can access, update or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.<br>" +
    "<strong>The right of rectification.</strong> You have the right to have your information rectified if that information is inaccurate or incomplete.<br>" +
    "<strong>The right to object.</strong> You have the right to object to our processing of your Personal Data.<br>" +
    "<strong>The right of restriction.</strong> You have the right to request that we restrict the processing of your personal information.<br>" +
    "<strong>The right to data portability.</strong> You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format.<br>" +
    "<strong>The right to withdraw consent.</strong> You also have the right to withdraw your consent at any time where Bee Wed relied on your consent to process your personal information.<br>" +
    "Please note that we may ask you to verify your identity before responding to such requests.<br>" +
    "You have the right to complain to a Data Protection Authority about our collection and use of your Personal Data. For more information, please contact your local data protection authority in the European Economic Area (EEA).<br>" +
    "Service Providers<br>" +
    "We may employ third party companies and individuals to facilitate our Service (\"Service Providers\"), provide the Service on our behalf, perform Service-related services or assist us in analysing how our Service is used.<br>" +
    "These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.<br>" +
    "Analytics<br>" +
    "We may use third-party Service Providers to monitor and analyse the use of our Service.<br>" +
    "<strong>Google Analytics</strong><br>" +
    "Google Analytics is a web analytics service offered by Google that tracks and reports website traffic. Google uses the data collected to track and monitor the use of our Service. This data is shared with other Google services. Google may use the collected data to contextualise and personalise the ads of its own advertising network.<br>" +
    "For more information on the privacy practices of Google, please visit the Google Privacy Terms web page: https://policies.google.com/privacy?hl=en<br>" +
    "<strong>Firebase</strong><br>" +
    "Firebase is analytics service provided by Google Inc.<br>" +
    "You may opt-out of certain Firebase features through your mobile device settings, such as your device advertising settings or by following the instructions provided by Google in their Privacy Policy: https://policies.google.com/privacy?hl=en<br>" +
    "We also encourage you to review the Google's policy for safeguarding your data: https://support.google.com/analytics/answer/6004245.<br>" +
    "For more information on what type of information Firebase collects, please visit the Google Privacy Terms web page: https://policies.google.com/privacy?hl=en<br>" +
    "Behavioral Remarketing<br>" +
    "Bee Wed uses remarketing services to advertise on third party websites to you after you visited our Service. We and our third-party vendors use cookies to inform, optimise and serve ads based on your past visits to our Service.<br>" +
    "<strong>Google Ads (AdWords)</strong><br>" +
    "Google Ads (AdWords) remarketing service is provided by Google Inc.<br>" +
    "You can opt-out of Google Analytics for Display Advertising and customise the Google Display Network ads by visiting the Google Ads Settings page: http://www.google.com/settings/ads<br>" +
    "Google also recommends installing the Google Analytics Opt-out Browser Add-on - https://tools.google.com/dlpage/gaoptout - for your web browser. Google Analytics Opt-out Browser Add-on provides visitors with the ability to prevent their data from being collected and used by Google Analytics.<br>" +
    "For more information on the privacy practices of Google, please visit the Google Privacy Terms web page: https://policies.google.com/privacy?hl=en<br>" +
    "<strong>Twitter</strong><br>" +
    "Twitter remarketing service is provided by Twitter Inc.<br>" +
    "You can opt-out from Twitter's interest-based ads by following their instructions: https://support.twitter.com/articles/20170405<br>" +
    "You can learn more about the privacy practices and policies of Twitter by visiting their Privacy Policy page: https://twitter.com/privacy<br>" +
    "<strong>Facebook</strong><br>" +
    "Facebook remarketing service is provided by Facebook Inc.<br>" +
    "You can learn more about interest-based advertising from Facebook by visiting this page: https://www.facebook.com/help/164968693837950<br>" +
    "To opt-out from Facebook's interest-based ads, follow these instructions from Facebook: https://www.facebook.com/help/568137493302217<br>" +
    "Facebook adheres to the Self-Regulatory Principles for Online Behavioural Advertising established by the Digital Advertising Alliance. You can also opt-out from Facebook and other participating companies through the Digital Advertising Alliance in the USA http://www.aboutads.info/choices/, the Digital Advertising Alliance of Canada in Canada http://youradchoices.ca/ or the European Interactive Digital Advertising Alliance in Europe http://www.youronlinechoices.eu/, or opt-out using your mobile device settings.<br>" +
    "For more information on the privacy practices of Facebook, please visit Facebook's Data Policy: https://www.facebook.com/privacy/explanation<br>" +
    "Payments<br>" +
    "We may provide paid products and/or services within the Service. In that case, we use third-party services for payment processing (e.g. payment processors).<br>" +
    "We will not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy. These payment processors adhere to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express and Discover. PCI-DSS requirements help ensure the secure handling of payment information.<br>" +
    "The payment processors we work with are:<br>" +
    "<strong>Apple Store In-App Payments</strong><br>" +
    "Their Privacy Policy can be viewed at https://www.apple.com/legal/privacy/en-ww/<br>" +
    "<strong>Google Play In-App Payments</strong><br>" +
    "Their Privacy Policy can be viewed at https://www.google.com/policies/privacy/<br>" +
    "<strong>Stripe<br></strong>" +
    "Their Privacy Policy can be viewed at https://stripe.com/us/privacy<br>" +
    "<strong>PayPal / Braintree</strong><br>" +
    "Their Privacy Policy can be viewed at https://www.paypal.com/webapps/mpp/ua/privacy-full<br>" +
    "Links to Other Sites<br>" +
    "Our Service may contain links to other sites that are not operated by us. If you click a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.<br>" +
    "We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.<br>" +
    "Children's Privacy<br>" +
    "Our Service does not address anyone under the age of 18 (\"Children\").<br>" +
    "We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.<br>" +
    "Changes to This Privacy Policy<br>" +
    "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.<br>" +
    "We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the \"effective date\" at the top of this Privacy Policy.<br>" +
    "You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.<br>" +
    "Contact Us<br>" +
    "If you have any questions about this Privacy Policy, please contact us:<br>" +
    "By email: beewed@email.com";

    res.send({
        success: true,
        data: {
            title: "Privacy Policy",
            text: html
        }
    });
});

module.exports = router;