import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATmqnB1bnENTX7a31PGFz3L01Yod7jdoU",
  authDomain: "stree-and-burnout-reduction.firebaseapp.com",
  projectId: "stree-and-burnout-reduction",
  storageBucket: "stree-and-burnout-reduction.appspot.com",
  messagingSenderId: "1094008688436",
  appId: "1:1094008688436:web:40206ee786c2401bf91f61",
  measurementId: "G-FBJPC7BRXX"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics(app);
const db = firebase.firestore(app); // Initialize Firestore

// Get a reference to the search input field and search button
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Add event listener to the search button
searchButton.addEventListener('click', function() {
    // Get the search query entered by the user
    const query = searchInput.value.trim().toLowerCase(); // Trim and convert to lowercase
    
    // Call the searchArticles function with the search query
    searchArticles(query);
});

// Function to search articles
function searchArticles(query) {
    // Query Firestore for articles containing the search query
    const q = firebase.firestore.collection(db, "articles")
                .where("title", ">=", query)
                .where("title", "<=", query + "\uf8ff");

    firebase.firestore.getDocs(q)
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // Display matching articles on the page
                console.log(doc.data()); // Update to display on the webpage
            });
        })
        .catch((error) => {
            console.log("Error searching articles:", error);
        });
}


 
