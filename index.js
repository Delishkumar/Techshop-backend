

const express = require('express');
const cors = require("cors")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")
const app = express();
const PORT = 5000;

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://arun:arun123@cluster0.zgcjldn.mongodb.net/form?retryWrites=true&w=majority&appName=Cluster0").then(()=>{console.log("mongodb connect")})
.catch(()=>{console.log("db connect fail")})

const Contacts = mongoose.model("Contacts",{name:String,email:String,message:String},"contacts")
const CartItem = mongoose.model("CartItem",{name: String,
  price: Number,
  image: String,},"cart")



  const Order = mongoose.model("Order",{ name: String,
    email: String,
    address: String,
    phone: String,
    cartItems: [
      {
        name: String,
        price: Number,
        quantity: Number,
      }
    ],
    totalAmount: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    }},"orders")


  

  // Get Cart Items
app.get('/api/cart', async (req, res) => {
  const items = await CartItem.find();
  res.json(items);
});

// Add to Cart
app.post('/api/cart', async (req, res) => {
  const newItem = new CartItem(req.body);
  await newItem.save();
  res.json(newItem);
});

// Remove from Cart
app.delete('/api/cart/:id', async (req, res) => {
  await CartItem.findByIdAndDelete(req.params.id);
  res.json({ message: "Item removed" });
});


// Place new order
app.post('/api/order', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    
    await CartItem.deleteMany({});

    res.status(201).json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});


// Get total number of cart items
app.get('/count', async (req, res) => {
  try {
    const count = await CartItem.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get cart count' });
  }
});





//contactform

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'delishkumar800@gmail.com',         
    pass: 'mxod rvng qfdo rhym'             
  }
});


app.post("/api/contacts",async (req,res) => {
 
 try{
   
  const user = new Contacts({name:req.body.name,
    email:req.body.email,message:req.body.message
  })
  await user.save().then(()=>{console.log("saved")}).catch(()=>{console.log("save fail")})
  const mailOptions = {
    from: 'delishkumar800@gmail.com',
    to: 'delishkumar39@gmail.com', 
    subject: 'New Contact Form Techshop',
    text: `
      Name: ${req.body.name}
      Email: ${req.body.email}
      Message: ${req.body.message}
    `
  };

await transporter.sendMail(mailOptions);
res.send("sucessfull")
}

catch(error){
  console.log("email send fail")
}


});




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
