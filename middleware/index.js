const  middlewareObject = {};

middlewareObject.isLoggedIn = function ( request,respond,next){
	if(request.isAuthenticated()){
		return next();
	}
	console.log("you reached to add movies without logging");
	// request.flash("error","Login Required");
	respond.redirect("/login");
};

module.exports= middlewareObject;