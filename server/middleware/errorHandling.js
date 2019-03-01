
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
        var title = "Error";
        var message = "";

        if (errorBody.code == 11) {
            message = "Wrong credentials";
        } else if (errorBody.code == 2) {
            message = "Wrong credentials";
        }

        return {
            success: false,
            error: {
                title,
                message
            }
        }
    },
    resetPasswordErrorHandling: function (errorBody) {
        var title = "Wrong credentials";
        var message = "";

        if (errorBody == 11) {
            message = "User with this email does not exist";
        } else if (errorBody == 12) {
            title = "Error!";
            message = "Password was not updated";
        } else if (errorBody == 13) {
            title = "Warning!";
            message = "Something wrong when sending password to your email";
        }

        return {
            success: false,
            error: {
                title,
                message
            }
        }
    },
    updateUserPasswordErrorHandling: function (errorBody) {
        var title = "Wrong data";
        var message = "";

        if (errorBody.code == 1) {
            message = "Wrong credentials";
        } else {
            title = "Error!";
            message = "Password was not updated";
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
