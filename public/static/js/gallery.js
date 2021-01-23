$(window).on("load resize ", function () {
    var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
    $('.tbl-header').css({
        'padding-right': scrollWidth
    });
}).resize();

var StrokeStore = function (stor, curr) {
    if (stor === undefined && curr === undefined) {
        this.store = [];
        this.current = [];
    } else {
        this.store = stor;
        this.current = curr;
    }
}

StrokeStore.prototype.moveTo = function (x, y) {
    if (this.current.length !== 0) {
        this.store.push(this.current);
        this.current = [];
    }
    this.current.push({
        x: x,
        y: y
    });
};

StrokeStore.prototype.lineTo = function (x, y, color, size) {
    this.current.push({
        x: x,
        y: y,
        c: color,
        s: size
    });
};

StrokeStore.prototype.stroke = function (ctx) {
    ctx.beginPath();
    var color = "black";
    var size = 2;
    var count = 0;
    ctx.lineCap = 'round';
    this.store.forEach(function (line) {
        scale = 100 / 400;
        if (count == 0) {
            color = line[1].c;
            size = line[1].s;
            ctx.strokeStyle = color;
            ctx.lineWidth = size * scale;
        }
        if (color != line[1].color || size != line[1].size) {
            ctx.stroke();
            color = line[1].c;
            size = line[1].s;
            ctx.lineWidth = size * scale;
            ctx.strokeStyle = color;
            ctx.beginPath();
        }
        ctx.moveTo(line[0].x * scale, line[0].y * scale);
        var pt;
        pt = line[1];
        ctx.lineTo(pt.x * scale, pt.y * scale);
        count++;
    }, this);
    //this._stroke(this.current);
    ctx.stroke();
};

function getParams() {
    const queryString = window.location.search;
    const params = (new URLSearchParams(queryString)).toString();
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(params);
        }, 200);
    })
}

$(async function () {
    let par = await getParams();
    let go = par === "";
    fbwait(go, par.substring(0, par.length - 1));
});

function fbwait(go, params) {
    if (firebase.apps.length === 0) {
        setTimeout(fbwait, 100);
        return;
    } //wait until firebase is init
    if (go) {
        loadTable();
    } else {
        loadArt(params);
    }
}

async function loadArt(slug) {
    let allArt = JSON.parse(window.localStorage.getItem("art"));
    if (allArt == null) {
        let art = await readArt();
        window.localStorage.setItem("art", JSON.stringify(art));
        allArt = JSON.parse(window.localStorage.getItem("art"));
    }
    let index = -1;
    let count = 0;
    let key = "";
    allArt.forEach(function (ele) {
        if (ele.slug === slug) {
            index = count;
            key = ele.key;
        }
        count++;
    });
    if (key === "") {
        window.location.replace("gallery.html");
    } else {
        document.getElementById("all").hidden = true;
        document.getElementById("view").hidden = false;
        document.getElementById("title").innerHTML = allArt[index].artwork;
        document.getElementById("artist-h").innerHTML = "Created by " + allArt[index].artist;
        drawCanvases(allArt[index]);
    }
}

async function drawCanvases(artwork) {
    for (let i = 0; i < 25; i++) {
        let canvas = document.getElementById("canv" + i);
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    let doc = await getAllPieceData(artwork.key);
    let users = await getAllUsers();
    doc.forEach(val => {
        let speCanv = document.getElementById("canv" + val.id);
        let ctx = speCanv.getContext("2d");
        let compressed = val.data;
        let decode = compressed.decompress();
        let done = JSON.parse(decode);
        var strokes = new StrokeStore(done.store, done.current);
        strokes.stroke(ctx);
        speCanv.onmouseenter = function (e) {
            let pfpcanv = document.getElementById("art-pfp");
            let pfpctx = pfpcanv.getContext("2d");
            const centerX = pfpcanv.width / 2;
            const centerY = pfpcanv.height / 2;
            const radius = 35;
            pfpcanv.width = 70;
            pfpcanv.width = 70;
            pfpctx.beginPath();
            pfpctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            pfpctx.fillStyle = "rgba(255,255,255,0.6)";
            pfpctx.fill();
            pfpctx.clip();
            let user = (users.filter((x) => {
                return x.uuid == val.user;
            }))[0];
            if (user) {
                document.getElementById("artist-art").innerHTML = user.username;
            }
            var img = new Image();
            img.addEventListener('load', function (e) {
                pfpctx.drawImage(this, 0, 0, 70, 70);
            }, true);
            if (user.pfp) {
                img.src = user.pfp;
            } else {
                img.src = "/static/default.png";
            }
        }
    })
}

async function getAllUsers() {
    const snap = await firebase.firestore().collection("users").get();
    const users = [];
    snap.forEach(doc => {
        users.push({
            uuid: doc.id,
            username: doc.data().username,
            pfp: doc.data().pfp
        });
    });
    return users;
}

async function getAllPieceData(key) {
    const snap = await firebase.firestore().collection(key).get();
    const docs = [];
    snap.forEach(doc => {
        docs.push({
            id: doc.id,
            data: doc.data().data,
            user: doc.data().user
        });
    });
    return docs;
}

function loadNum(key) {
    const db = firebase.database();
    return new Promise(async function (resolve, reject) {
        const snap = await db.ref("avail/" + key).once("value");
        let arr = snap.val();
        avail = arr.filter(function (element) {
            return element !== undefined;
        });
        resolve(25-(avail.length));
    });
}

async function loadTable() {
    let art = await readArt();
    window.localStorage.setItem("art", JSON.stringify(art));
    const tab = document.getElementById("artcontent");
    art.forEach(async function (ele) {
        let td1 = document.createElement("td");
        td1.innerHTML = ele.artwork;
        td1.setAttribute("style", "width:40%;")
        let td2 = document.createElement("td");
        td2.innerHTML = ele.artist;
        td2.setAttribute("style", "width:40%;")
        let num = await loadNum(ele.key);
        let td3 = document.createElement("td");
        td3.innerHTML = num+"/25";
        td3.setAttribute("style", "width:20%;")
        let trmain = document.createElement("tr");
        trmain.setAttribute("onclick", "window.location=\"gallery.html?" + ele.slug + "\"")
        trmain.appendChild(td1);
        trmain.appendChild(td2);
        trmain.appendChild(td3);
        tab.appendChild(trmain);
    })
}

function readArt() {
    const db = firebase.database();
    let arts = [];

    return new Promise(async function (resolve, reject) {
        const snap = await db.ref("pieces-info/").once("value");
        snap.forEach(function (childSnap) {
            arts.push({
                key: childSnap.key,
                artist: childSnap.val().artist,
                artwork: childSnap.val().artwork,
                slug: childSnap.val().slug
            })
        });
        resolve(arts);
    });
}





String.prototype.compress = function (asArray) {
    "use strict";
    // Build the dictionary.
    asArray = (asArray === true);
    var i,
        dictionary = {},
        uncompressed = this,
        c,
        wc,
        w = "",
        result = [],
        ASCII = '',
        dictSize = 256;
    for (i = 0; i < 256; i += 1) {
        dictionary[String.fromCharCode(i)] = i;
    }

    for (i = 0; i < uncompressed.length; i += 1) {
        c = uncompressed.charAt(i);
        wc = w + c;
        //Do not use dictionary[wc] because javascript arrays
        //will return values for array['pop'], array['push'] etc
        // if (dictionary[wc]) {
        if (dictionary.hasOwnProperty(wc)) {
            w = wc;
        } else {
            result.push(dictionary[w]);
            ASCII += String.fromCharCode(dictionary[w]);
            // Add wc to the dictionary.
            dictionary[wc] = dictSize++;
            w = String(c);
        }
    }

    // Output the code for w.
    if (w !== "") {
        result.push(dictionary[w]);
        ASCII += String.fromCharCode(dictionary[w]);
    }
    return asArray ? result : ASCII;
};

String.prototype.decompress = function () {
    "use strict";
    // Build the dictionary.
    var i, tmp = [],
        dictionary = [],
        compressed = this,
        w,
        result,
        k,
        entry = "",
        dictSize = 256;
    for (i = 0; i < 256; i += 1) {
        dictionary[i] = String.fromCharCode(i);
    }

    if (compressed && typeof compressed === 'string') {
        // convert string into Array.
        for (i = 0; i < compressed.length; i += 1) {
            tmp.push(compressed[i].charCodeAt(0));
        }
        compressed = tmp;
        tmp = null;
    }

    w = String.fromCharCode(compressed[0]);
    result = w;
    for (i = 1; i < compressed.length; i += 1) {
        k = compressed[i];
        if (dictionary[k]) {
            entry = dictionary[k];
        } else {
            if (k === dictSize) {
                entry = w + w.charAt(0);
            } else {
                return null;
            }
        }

        result += entry;

        // Add w+entry[0] to the dictionary.
        dictionary[dictSize++] = w + entry.charAt(0);

        w = entry;
    }
    return result;
};