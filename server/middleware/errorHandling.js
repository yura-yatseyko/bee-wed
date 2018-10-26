
module.exports =  {
    bridegroomSignUpErrorHandling: function (errorBody) {
        var title = "Wrong data";
        var message = "";

        if (errorBody.code == 11000) {
            message = "User with this email already exist";
        }

        return {
            success: false,
            error: {
                title,
                message
            }
        }
    },
    supplierSignUpErrorHandling: function (errorBody) {
        var title = "Wrong data";
        var message = "";

        if (errorBody.code == 11000) {
            message = "User with this email already exist";
        }
        
        return {
            success: false,
            error: {
                title,
                message
            }
        }
    },
    signInErrorHandling: function (errorBody) {
        var title = "Wrong credentials";
        var message = "";

        if (errorBody.code == 11) {
            message = "User with this email does not exist";
        } else if (errorBody.code == 2) {
            message = "User with this password does not exist";
        }

        return {
            success: false,
            error: {
                title,
                message
            }
        }
    }
} 
