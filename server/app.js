var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { MongoClient } = require('mongodb');
const cors = require('cors'); // Import the cors middleware
const bodyParser = require('body-parser'); // Import body-parser
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer(); // Initialize multer middleware

// Express
var app = express();
// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // Enable JSON parsing for POST requests
app.use(bodyParser.json()); // Use body-parser for JSON parsing
app.use(cookieParser());
app.use(logger('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection details
const mongoURI = 'mongodb://localhost:27017/';
//const mongoURI = 'mongodb://admin:chAP%7Br%40v!z)%2416@35.158.125.247:27017/?authSource=admin';
const dbName = 'bizchat_db';



// API endpoint for deleting a message by message_id
app.delete('/api/messages/:messageId', async (req, res) => {
  const messageId = req.params.messageId;
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();

  const db = client.db(dbName);
  try {
    // Use deleteMany to find and delete a document by message_id
    const result = await db.collection('messages').deleteMany({ message_id: parseInt(messageId) });

    if (result.deletedCount > 0) {
      res.json({ success: true, message: 'Message deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Message not found' });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    // Close the MongoDB client connection
    await client.close();
  }
});





app.get('/api/users', async (req, res) => {
  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const users = await db.collection('users').find({}).toArray();

    await client.close();

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

//send message
app.post('/api/sendMessage', async (req, res) => {
  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);

    const { sender, receiver, date, time, chat } = req.body;

    // Fetch the last message to get the latest message_id
    const lastMessage = await db.collection('messages').findOne({}, { sort: { message_id: -1 } });

    // Calculate the new message_id
    const newMessageId = (lastMessage ? lastMessage.message_id : 0) + 1;

    // Create a new message document
    const newMessage = {
      message_id: newMessageId,
      sender,
      receiver,
      date,
      time,
      chat,
      status: "1", // Status should always be "1"
    };

    // Insert the new message into the database
    await db.collection('messages').insertOne(newMessage);

    await client.close();

    res.json({ message: 'Message sent successfully', newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/api/sendDocument', upload.single('file'), async (req, res) => {
  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);

    const { sender, receiver, date, time, documentName, contentType } = req.body;

    // Fetch the last message to get the latest message_id
    const lastMessage = await db.collection('messages').findOne({}, { sort: { message_id: -1 } });

    // Calculate the new message_id
    const newMessageId = (lastMessage ? lastMessage.message_id : 0) + 1;

    // Access the file content from req.file.buffer
    const documentBuffer = req.file.buffer;

    // Save document to the database with entire content
    const documentMessage = {
      message_id: newMessageId,
      sender,
      receiver,
      date,
      time,
      documentName,
      contentType,
      content: documentBuffer.toString('base64'), // Convert Buffer to base64 string
      status: '3',
    };

    await db.collection('messages').insertOne(documentMessage);

    res.json({ message: 'Document message sent successfully', documentMessage });

    await client.close();
  } catch (error) {
    console.error('Error sending document message:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/adverts', async (req, res) => {
  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const adverts = await db.collection('advert').find({ status: 0 }).toArray();

    await client.close();

    res.json(adverts);
  } catch (error) {
    console.error('Error fetching adverts:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/api/getMessages', async (req, res) => {
  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);

    const { userId, otherUserId } = req.body;

    // Fetch and sort messages between the current user and the selected user by date and time
    const messages = await db.collection('messages').find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ date: 1, time: 1 }).toArray();

    await client.close();

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Internal Server Error');
  }
});
/// push notification
app.post('/api/getNotifications', async (req, res) => {
  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);

    const { userFullName } = req.body;
    const notifications = await db.collection('messages')
      .find({ receiver: userFullName })

      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Function to fetch user details

app.post('/api/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const user = await db.collection('users').findOne({ username, password });

    await client.close();

    if (user) {
      // Include the complete user information in the JSON response
      const response = {
        _id: user._id,
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        country: user.country,
        project: user.project,
        invoice: user.invoice,
        deadline: user.deadline,
        budget: user.budget,
        session_id: user.session_id,
        status: user.status,
      };
      res.json(response);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/api/getUserInfo', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const user = await db.collection('users').findOne({ id });

    await client.close();

    if (user) {
      const response = {
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        country: user.country,
        project: user.project,
        invoice: user.invoice,
        deadline: user.deadline,
        budget: user.budget,
        session_id: user.session_id,
        status: user.status,
      };
      res.json(response);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/getUserInfoByName', async (req, res) => {
  try {
    const { full_name } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const user = await db.collection('users').findOne({ full_name });

    await client.close();

    if (user) {
      const response = {
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        country: user.country,
        project: user.project,
        invoice: user.invoice,
        deadline: user.deadline,
        budget: user.budget,
        session_id: user.session_id,
        status: user.status,
      };
      res.json(response);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Function to fetch user transactions
app.post('/api/userTransactions', async (req, res) => {
  try {
    const { full_name } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const userTransactions = await db.collection('user_transaction').find({ full_name }).toArray();

    await client.close();

    res.json(userTransactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/userOrderDetails', async (req, res) => {
  try {
    const { full_name } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const userOrderDetails = await db.collection('user_details').find({ full_name }).toArray();

    await client.close();

    res.json(userOrderDetails);
  } catch (error) {
    console.error('Error fetching user order details:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Define a route to fetch notes
app.post('/api/notes', async (req, res) => {
  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const myColl = db.collection('note');

    const { note, user, date, status } = req.body;

    if (!note || !user || !date || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await myColl.insertOne({ note, user, date, status });

    await client.close();

    console.log('MongoDB Insert Result:', result);

    if (result && result.insertedId) {
      // If the insertion was successful, construct the created note
      const createdNote = { _id: result.insertedId, note, user, date, status };
      return res.json(createdNote);
    } else {
      console.error('Error creating note: InsertedId is undefined or empty');
      return res.status(500).json({ error: 'Internal Server Error', details: 'Failed to create note' });
    }
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Define a route to fetch notes based on message, status, or date
app.get('/api/notesSearch', async (req, res) => {
  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const notesCollection = db.collection('note');

    const { search } = req.query;

    // Use a regular expression to perform a case-insensitive search
    const query = {
      $or: [
        { note: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
        { date: { $regex: search, $options: 'i' } },
      ],
    };

    const sort = { _id: 1 }; // Sort by _id field in descending order

    const notes = await notesCollection.find(query).sort(sort).toArray();

    await client.close();

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Add this route to your existing code
app.get('/api/stopServer', (req, res) => {
  // This will stop the server
  res.send('Server is stopping...');
  process.exit();
});



// Routes
app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;