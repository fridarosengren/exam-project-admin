// Check if user is logged in, otherwise redirect to start
module.exports = {
    authenticateUser: (req, res, next) => {
        if(req.isAuthenticated()) {
            return next();
        } else {
            res.redirect("/");
        }
    }
}