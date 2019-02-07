var admin = require('firebase-admin');

var serviceAccount = require("../../beewed-17604-firebase-adminsdk-s0zgk-c0ee9ff835.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://beewed-17604.firebaseio.com"
});

module.exports = {
    sendPushNotification: function (payloadAndroid, payloadIOS, registrationToken, platform) {
        var options = {
            priority: "high",
        };

        if (platform === 'ios') {
            admin.messaging().sendToDevice(registrationToken, payloadIOS, options)
            .then(function(response) {
             console.log("Successfully sent message:", response);
            })
            .catch(function(error) {
                console.log("Error sending message:", error);
            });
        } else {
            admin.messaging().sendToDevice(registrationToken, payloadAndroid, options)
            .then(function(response) {
             console.log("Successfully sent message:", response);
            })
            .catch(function(error) {
                console.log("Error sending message:", error);
            });
        }
    }
};