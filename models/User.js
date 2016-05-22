module.exports = function (mongoose) {
	var userSchema = mongoose.Schema({
		username: String,
		password: String,
		fullname: String,
		city: String,
		state: String,
		books: [{
			title: String,
			googleBookId: String,
			thumbnail: String
		}]
	});
	var User = mongoose.model("User", userSchema);
	return User;
}