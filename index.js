

const express = require ('express');
const cors = require("cors")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")
const app = express();


const PORT = 5000;

app.use(cors())
app.use(express.json())



// Increase payload size limit (default is 100kb)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

mongoose.connect("mongodb+srv://arun:arun123@cluster0.zgcjldn.mongodb.net/form?retryWrites=true&w=majority&appName=Cluster0").then(()=>{console.log("mongodb connect")})
.catch(()=>{console.log("db connect fail")})


//Models

const Contacts = mongoose.model("Contacts",{name:String,email:String,message:String},"contacts")
const CartItem = mongoose.model("CartItem",{name: String,
  price: Number,
  image: String,},"cart")



  const Order = mongoose.model("Order",{ 
    userId: String,
    name: String,
    email: String,
    address: String,
    phone: String,
   CartItems: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalPrice: Number,
    status: {
      type: String,
      default: 'Processing',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },},"orders")

    const Product = mongoose.model("Product",{ id: Number,
      name: String,
      brand: String,
      price: Number,
      rating: Number,
      image: String, 
      details: String,
      instock: Number,
         
      reviews: [
        {
          user: String,
          comment: String,
          rating: Number,
          date: { type: Date, default: Date.now }
        }
      ]                            ,},"products")

//Add products


app.post('/api/products', async (req, res) => {
  
  try {
    const products = req.body;

    const insertedProducts = await Product.insertMany(products);
    res.status(201).json(insertedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert products' });
  }
});
  



// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(); // fetch all products
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

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
    const mailOptions = {
      from: 'delishkumar800@gmail.com',
      to: 'delishkumar39@gmail.com', 
      subject: 'New Order',
      text: `
        Name: ${req.body.name}
        Email: ${req.body.email}
        Message: ${req.body.message}
      `
    };
  
  await transporter.sendMail(mailOptions);
  res.send("sucessfull")
    
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






// GET single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ✅ PUT Route to update product or add a review
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { user, comment, rating } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add review to product
    const newReview = {
      user,
      comment,
      rating,
    };

    product.reviews.push(newReview);

    //  update average rating
    product.rating =
  Number(
    (
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length
    ).toFixed(1)
  );


    await product.save();

    res.status(200).json({ message: 'Review added successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
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
