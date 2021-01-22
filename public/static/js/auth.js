var firebaseConfig = {
    apiKey: "AIzaSyABCi0lM7c-fE5YE8_Dwk2UAXn7hoPo9Bw",
    authDomain: "square-piece.firebaseapp.com",
    projectId: "square-piece",
    storageBucket: "square-piece.appspot.com",
    messagingSenderId: "221464693855",
    appId: "1:221464693855:web:b6750b4c5d6462049b9fea",
    measurementId: "G-2ZZCSBQYQN"
};
$(function () {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    $('#github').click(loginGithub);
    $('#signout').click(signOut);

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            try {
                document.getElementById('login').hidden = true;
                document.getElementById('account').hidden = false;
                firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
                    document.getElementById('username').value = doc.data().username;
                })
                document.getElementById('username').classList.add("touched");
            } catch (err) {}
            try {
                if (document.getElementById('play') != null) {
                    document.getElementById('play').hidden = false;
                }
            } catch (err) {}
            updatePFP(user.photoURL);
            try{
            document.getElementById('a-sign-in').innerHTML = "Account";
            }
            catch(err){}
        } else {
            try {
                document.getElementById('login').hidden = false;
                document.getElementById('account').hidden = true;
            } catch (err) {}
            try {
                if (document.getElementById('play') != null) {
                    window.location.replace("404.html")
                }
            } catch (err) {}
            updatePFP();
        }
    });
});

function loginGithub() {
    const auth = firebase.auth();
    var provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider).then(function (result) {
        return firebase.firestore().collection('users').doc(result.user.uid).set({
            username: result.additionalUserInfo,
            pfp: result.user.photoURL
        });
        //console.log(result);
        //console.log(result.additionalUserInfo.profile);
        //console.log(result.additionalUserInfo.username);
    }).catch(function (error) {})
}

function updatePFP(path) {
    const canvas = document.getElementById("pic");
    if (canvas != null) {
        const context = canvas.getContext("2d");
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 60;
        canvas.width = 119;
        canvas.width = 120;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = "rgba(255,255,255,0.6)";
        context.fill();
        context.clip();
        var img = new Image();
        img.addEventListener('load', function (e) {
            context.drawImage(this, 0, 0, 120, 120);
        }, true);
        if (path) {
            img.src = path;
        } else {
            img.src = "/static/default.png";
        }
    }
}

function signOut() {
    firebase.auth().signOut();
}