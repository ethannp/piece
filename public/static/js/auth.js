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
var file;

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

function upload() {
    let sl = document.getElementById('slug').value;
    let artistn = document.getElementById('artistname').value;
    let artw = document.getElementById('artworkname').value;
    if (slug != "" && artistn != "" && artw != "") {
        var storageref = firebase.storage().ref('/images/' + file.name);
        storageref.put(file);
        //file placed
        var rdb = firebase.database();
        let pid = genUUID();
        rdb.ref("/pieces/" + pid).set(file.name);
        rdb.ref("/pieces-info/" + pid).set({
            artist: artistn,
            artwork: artw,
            slug: sl
        });
        let nums = [];
        for (let i = 0; i < 25; i++) {
            nums.push(i);
        }
        console.log(nums);
        rdb.ref("/avail/" + pid).set(nums);
        //realtime db updated
        document.getElementById('slug').value = "";
        document.getElementById('artistname').value = "";
        document.getElementById('artworkname').value = "";
        document.getElementById('final').innerHTML = "File " + file.name + " was uploaded!";
    } //[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
}

$(function () {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    $('#github').click(loginGithub);
    $('#google').click(loginGoogle);
    $('#signout').click(signOut);
    $('#savebtn').click(saveUser);

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            try {
                if (document.getElementById("admincheck") != null) {
                    if (user.uid != "IeG7cIheRNS8N6J4r4Xn9Gj2FmX2") {
                        window.location.replace("404.html");
                    } else {
                        document.getElementById("filebtn").addEventListener('change', function (e) {
                            file = e.target.files[0];
                        });
                        $('#submitpiece').click(upload);
                    }
                }
            } catch (err) {}
            try {
                if (document.getElementById("adminc") != null) {
                    if (user.uid == "IeG7cIheRNS8N6J4r4Xn9Gj2FmX2") {
                        document.getElementById("adminc").hidden = false;
                    }
                }
            } catch (err) {}
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
            try {
                document.getElementById("loggedin").hidden = false;
                document.getElementById("notloggedin").hidden = true;
            } catch (err) {}
        } else {
            try {
                if (document.getElementById("admincheck") != null) {
                    window.location.replace("404.html");
                }
            } catch (err) {}
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
            try {
                document.getElementById("loggedin").hidden = true;
                document.getElementById("notloggedin").hidden = false;
            } catch (err) {}
            updatePFP();
        }
    });
});

function loginGithub() {
    const auth = firebase.auth();
    var provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider).then(function (result) {
        const ref = firebase.firestore().collection('users').doc(result.user.uid).get()
            .then(docSnap => {
                if (docSnap.exists) {
                    return;
                } else {
                    return firebase.firestore().collection('users').doc(result.user.uid).set({
                        username: result.additionalUserInfo.username,
                        pfp: result.user.photoURL
                    });
                }
            });
    }).catch(function (error) {})
}

function loginGoogle() {
    const auth = firebase.auth();
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(function (result) {
        const ref = firebase.firestore().collection('users').doc(result.user.uid).get()
            .then(docSnap => {
                if (docSnap.exists) {
                    return;
                } else {
                    return firebase.firestore().collection('users').doc(result.user.uid).set({
                        username: ((result.user.email.match(/([^@]+)/))[0]).replace(/[^0-9a-zA-Z]/g, ''),
                        pfp: result.user.photoURL
                    });
                }
            });
    });
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