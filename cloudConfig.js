const firebase = require('firebase/app');
const { getStorage, ref } = require('firebase/storage');
const multer = require('multer');
const firebaseConfig = {
  apiKey: "AIzaSyBm0C7PXXrBz4FsV0KS8HJ5cMeiPLEhj4Y",
  authDomain: "genial-stage-414711.firebaseapp.com",
  projectId: "genial-stage-414711",
  storageBucket: "genial-stage-414711.appspot.com",
  messagingSenderId: "221217863571",
  appId: "1:221217863571:web:65ad2f27e340499c3f9a66",
  measurementId: "G-L7N7RLH61K"
};
firebase.initializeApp(firebaseConfig);

const firebaseStorage = getStorage(); // Correct usage of getStorage
const audioStorageRef = ref(firebaseStorage, 'path/to/audio'); // Specify the path to your audio storage

const audioUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed.'));
        }
    }
});

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dybgs03yy',
    api_key: 332289123789885,
    api_secret: 'PuGPKDLd8lTU37vu7MqS9JRtS-I'
});
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Music_DEV',
        allowedFormats: ['jpg', 'png', 'jpeg']
    }
});

module.exports = { cloudinary, storage };