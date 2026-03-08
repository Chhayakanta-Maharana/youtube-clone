import express from "express";
import Razorpay from "razorpay";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
    key_id: "rzp_live_XXXXXXXX",
    key_secret: "LIVE_SECRET_HERE",
});

app.post("/create-order", async (req, res) => {
    const order = await razorpay.orders.create({
        amount: 19900, // ₹199
        currency: "INR",
        receipt: "receipt_" + Date.now(),
    });

    res.json({
        orderId: order.id,
        key: "rzp_live_XXXXXXXX",
    });
});

app.listen(5000, () => {
    console.log("Backend running on port 5000");
});
