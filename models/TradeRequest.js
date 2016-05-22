module.exports = function (mongoose) {
	var tradeRequestSchema = mongoose.Schema({
		fromId: String,
		toId: String,
		googleBookId: String
	});
	var TradeRequest = mongoose.model("TradeRequest", tradeRequestSchema);
	return TradeRequest;
}