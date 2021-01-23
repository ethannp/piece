const firebaseConfig = {
    apiKey: "AIzaSyABCi0lM7c-fE5YE8_Dwk2UAXn7hoPo9Bw",
    authDomain: "square-piece.firebaseapp.com",
    databaseURL: "https://square-piece-default-rtdb.firebaseio.com",
    projectId: "square-piece",
    storageBucket: "square-piece.appspot.com",
    messagingSenderId: "221464693855",
    appId: "1:221464693855:web:b6750b4c5d6462049b9fea",
    measurementId: "G-2ZZCSBQYQN"
};
var curUser, curName, pfp;

const getUser = async (user) => {
    const dbref = firebase.firestore().collection('users').doc(user.uid).get();
    const doc = await dbref;
    return doc;
}

async function read(user) {
    const doc = await getUser(user);
    curName = doc.data().username;
    try {
        document.getElementById('username').value = curName;
    } catch (err) {}
    pfp = doc.data().pfp;
    updatePFP(pfp);
}
$(function () {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    $('#github').click(loginGithub);
    $('#signout').click(signOut);
    $('#savebtn').click(saveUser);

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            curUser = user;
            window.curUser = curUser;
            read(user);
            try {
                document.getElementById('username').value = curName;
            } catch (err) {}
            try {
                document.getElementById('login').hidden = true;
                document.getElementById('account').hidden = false;
                document.getElementById('username').classList.add("touched");
            } catch (err) {}
            try {
                if (document.getElementById('play') != null) {
                    document.getElementById('play').hidden = false;
                }
            } catch (err) {}
            try {
                document.getElementById('a-sign-in').innerHTML = "Account";
            } catch (err) {}
        } else {
            curUser = null;
            try {
                document.getElementById('login').hidden = false;
                document.getElementById('account').hidden = true;
            } catch (err) {}
            try {
                if (document.getElementById('play') != null) {
                    window.location.replace("nologin.html")
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
            username: result.additionalUserInfo.username,
            pfp: result.user.photoURL
        });
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

async function saveUser() {
    if (document.getElementById("username").value != curName) {
        try {
            const ref = firebase.firestore().collection('users').doc(curUser.uid);
            const res = await ref.set({
                username: document.getElementById("username").value
            }, {
                merge: true
            });
            document.getElementById('saved').innerHTML = `Your username has been updated to ${document.getElementById("username").value}!`
        } catch (err) {}
    }
}

function genUUID() {
    return '' + Math.random().toString(36).substr(2, 10);
};