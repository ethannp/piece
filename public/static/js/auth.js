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
            updatePFP(user.photoURL);
            document.getElementById('a-sign-in').innerHTML = "Account";
        } else {
            try {
                document.getElementById('login').hidden = false;
                document.getElementById('account').hidden = true;
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
            username: result.additionalUserInfo.username
        });
        //console.log(result);
        //console.log(result.additionalUserInfo.profile);
        //console.log(result.additionalUserInfo.username);
    }).catch(function (error) {})
}

function updatePFP(path) {
    const canvas = document.getElementById("pic");
    const context = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    canvas.width=119;
    canvas.width=120;
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
        img.src="/static/default.png";
    }
}

function signOut() {
    firebase.auth().signOut();
}