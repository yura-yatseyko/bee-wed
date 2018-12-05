const express = require('express');

const router = express.Router();

router.get('/termsandconditions', (req, res) => {

    let html = "Last updated: October 25, 2018<br>" +
    "These Terms and Conditions (\"Terms\", \"Terms and Conditions\") govern your relationship with www.beewed.ie website and Bee Wed mobile application (the \"Service\") operated by Bee Wed (\"us\", \"we\", or \"our\").<br>" +
    "Please read these Terms and Conditions carefully before using our website and Bee Wed mobile application (the \"Service\").<br>" +
    "Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.<br>" +
    "By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.<br>" +
    "Subscriptions<br>" + 
    "Some parts of the Service are billed on a subscription basis (\"Subscription(s)\"). You will be billed in advance on a recurring and periodic basis (\"Billing Cycle\"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.<br>" +
    "At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or Bee Wed cancels it. You may cancel your Subscription renewal either through your online account management page or by contacting Bee Wed customer support team.<br>" +
    "A valid payment method, including credit card or PayPal, is required to process the payment for your Subscription. You shall provide Bee Wed with accurate and complete billing information including full name, address, state, zip code, telephone number, and a valid payment method information. By submitting such payment information, you automatically authorize Bee Wed to charge all Subscription fees incurred through your account to any such payment instruments.<br>" +
    "Should automatic billing fail to occur for any reason, Bee Wed will issue an electronic invoice indicating that you must proceed manually, within a certain deadline date, with the full payment corresponding to the billing period as indicated on the invoice.<br>" +
    "Free Trial<br>" +
    "Bee Wed may, at its sole discretion, offer a Subscription with a free trial for a limited period of time (\"Free Trial\").<br>" +
    "You may be required to enter your billing information in order to sign up for the Free Trial.<br>" +
    "If you do enter your billing information when signing up for the Free Trial, you will not be charged by Bee Wed until the Free Trial has expired. On the last day of the Free Trial period, unless you cancelled your Subscription, you will be automatically charged the applicable Subscription fees for the type of Subscription you have selected.<br>" +
    "At any time and without notice, Bee Wed reserves the right to (i) modify the terms and conditions of the Free Trial offer, or (ii) cancel such Free Trial offer.<br>" +
    "Fee Changes<br>" +
    "Bee Wed, in its sole discretion and at any time, may modify the Subscription fees for the Subscriptions. Any Subscription fee change will become effective at the end of the then-current Billing Cycle.<br>" +
    "Bee Wed will provide you with a reasonable prior notice of any change in Subscription fees to give you an opportunity to terminate your Subscription before such change becomes effective.<br>" +
    "Your continued use of the Service after the Subscription fee change comes into effect constitutes your agreement to pay the modified Subscription fee amount.<br>" +
    "Refunds<br>" +
    "Except when required by law, paid Subscription fees are non-refundable.<br>" +
    "Content<br>" +
    "Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (\"Content\"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.<br>" +
    "By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights. You agree that this license includes the right for us to make your Content available to other users of the Service, who may also use your Content subject to these Terms.<br>" +
    "You represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.<br>" +
    "Accounts<br>" +
    "When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.<br>" +
    "You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.<br>" +
    "You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.<br>" +
    "Intellectual Property<br>" +
    "The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of Bee Wed and its licensors. The Service is protected by copyright, trademark, and other laws of both the Ireland and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Bee Wed.<br>" +
    "Links To Other Web Sites<br>" +
    "Our Service may contain links to third-party web sites or services that are not owned or controlled by Bee Wed.<br>" +
    "Bee Wed has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that Bee Wed shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.<br>" +
    "We strongly advise you to read the terms and conditions and privacy policies of any third-party web sites or services that you visit.<br>" +
    "Termination<br>" +
    "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.<br>" +
    "Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.<br>" +
    "Limitation Of Liability<br>" +
    "In no event shall Bee Wed, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.<br>" +
    "Disclaimer<br>" +
    "Your use of the Service is at your sole risk. The Service is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.<br>" +
    "Bee Wed its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.<br>" +
    "Governing Law<br>" +
    "These Terms shall be governed and construed in accordance with the laws of Ireland, without regard to its conflict of law provisions.<br>" +
    "Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.<br>" +
    "Changes<br>" +
    "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.<br>" +
    "By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.<br>" +
    "Contact Us<br>" +
    "If you have any questions about these Terms, please contact us.<br>";

    res.send({
        success: true,
        data: {
            title: "Terms and Conditions",
            text: html
        }
    });
});

module.exports = router;