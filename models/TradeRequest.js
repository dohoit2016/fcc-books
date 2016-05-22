module.exports = function (mongoose) {
	var tradeRequestSchema = mongoose.Schema({
		fromId: String,
		toId: String,
		bookId: String,
		bookTitle: String,
		processed: Number
	});
	var TradeRequest = mongoose.model("TradeRequest", tradeRequestSchema);
	return TradeRequest;
}