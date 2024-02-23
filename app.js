const express = require('express');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const flash = require('connect-flash');
const Listing = require('./models/data');
const multer = require('multer');
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

const { cloudinary, storage } = require('./cloudConfig'); // Import cloudinary and storage from cloudConfig

const app = express(); // Declare app variable here
const upload = multer({ storage: storage });
const firebaseConfig = {
    apiKey: "AIzaSyBm0C7PXXrBz4FsV0KS8HJ5cMeiPLEhj4Y",
    authDomain: "genial-stage-414711.firebaseapp.com",
    projectId: "genial-stage-414711",
    storageBucket: "genial-stage-414711.appspot.com",
    messagingSenderId: "221217863571",
    appId: "1:221217863571:web:65ad2f27e340499c3f9a66",
    measurementId: "G-L7N7RLH61K"
  };
  const firebaseApp = initializeApp(firebaseConfig); // Initialize Firebase app
const firebaseStorage = getStorage(firebaseApp); // Initialize Firebase Storage

app.engine('ejs', ejsMate);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(flash());

// Configure passport and session
app.use(require('express-session')({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware to set local variables
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

// Configure passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/favicon.ico', (req, res) => res.status(204).end());

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Please login first!');
    res.redirect('/login');
};

app.get('/Signin', (req, res) => {
    res.render('user/signup');
});

app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body.user;
        let newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                console.error(err);
                req.flash('error', 'Error signing up');
                return res.redirect('/signup');
            }
            req.flash('success', 'Registration successful! Welcome to Wanderlust.');
            res.redirect(`/user/${registeredUser._id}`);
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error signing up');
        res.redirect('/signup');
    }
});

app.get('/login', (req, res) => {
    res.render('user/login');
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect(`/${req.user._id}`);
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            res.render('users/login.ejs', { error: 'Error logging out. Please try again.' });
        }
        req.flash('success', 'You are logged out. Goodbye!');
        res.redirect('/');
    });
});

// Routes
app.get('/listings/:id', ensureAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/');
        }
        res.render('window/showlisting', { listing, currentUser: req.user });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error fetching listing');
        res.redirect('/');
    }
});

app.get('/', async (req, res) => {
    try {
        let allListings = await Listing.find({});
        res.render('window/index', { allListings, currentUser: req.user });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error fetching listings');
        res.redirect('/');
    }
});

app.get('/add', ensureAuthenticated, async (req, res) => {
    res.render('window/addlisting', { currentUser: req.user });
});

app.get('/addmusic', ensureAuthenticated, async (req, res) => {
    res.render('window/addlisting', { currentUser: req.user });
});
const storageRef = firebaseStorage.ref;
const cpupload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]);
app.post('/addmusics', cpupload, async (req, res) => {
    try {
        const imageFile = req.files['image'][0];
        const audioFile = req.files['audio'][0];

        const imageUploadResult = await cloudinary.uploader.upload(imageFile.path);

        const audioSnapshot = await storageRef.child(`audio/${audioFile.originalname}`).put(audioFile.buffer);
  
        const imageURL = imageUploadResult.secure_url;
        const audioURL = await audioSnapshot.ref.getDownloadURL();
        res.json({ image: imageURL, audio: audioURL });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while uploading files.' });
    }
});


app.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        let { id } = req.params;
        let allListings = await Listing.find({});
        let listing = await Listing.findById(id);
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/');
        }
        res.render('window/index', { listing, allListings, currentUser: req.user });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error fetching listing');
        res.redirect('/');
    }
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/MusicApp');
    console.log('Connected to DB');
}

main().catch((err) =>
    console.log(err)
);

app.listen(3000, () => {
    console.log('server started');
});
