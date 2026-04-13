const express = require("express");
const cors = require("cors");
const db = require("./firebase");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API đang chạy");
});

app.get("/foods", async (req, res) => {
  try {
    const snapshot = await db.collection("foods").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/drinks", async (req, res) => {
  try { // 🔥 thêm try-catch (fix lỗi số 4)
    const snapshot = await db.collection("drinks").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/order", async (req, res) => {
  try { // 🔥 thêm try-catch
    const order = req.body;
    await db.collection("orders").add(order);
    res.json({ message: "Đặt hàng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server chạy tại cổng ${PORT}`);
});
