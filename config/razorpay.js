const Razorpay = require('razorpay')

let razorpayInstance = null

function createRazorpayInstance() {
	if (!razorpayInstance) {
		razorpayInstance = new Razorpay({
			key_id: process.env.RAZORPAY_API_KEY || 'sld',
			key_secret: process.env.RAZORPAY_API_SECRET || 'sldl',
		})
	}
	return razorpayInstance
}

module.exports = createRazorpayInstance()