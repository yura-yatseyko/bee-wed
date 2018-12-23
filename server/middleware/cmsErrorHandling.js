
module.exports =  {
    signInErrorHandling: function () {
        var title = "Wrong credentials";
        var message = "Admin with this credentials doesn't exist";

        return {
            success: false,
            error: {
                title,
                message
            }
        }
    },

    notAuthorizedErrorHandling: function () {
        var title = "Not authorized";
        var message = "Need admin access to this api";

        return {
            success: false,
            error: {
                title,
                message
            }
        }
    }
} 