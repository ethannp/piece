$(window).on("load resize ", function () {
    var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
    $('.tbl-header').css({
        'padding-right': scrollWidth
    });
}).resize();

$(function () {
    const queryString = window.location.search;
    const params = (new URLSearchParams(queryString)).toString();
    let go = params==="";
    fbwait(go,params.substring(0,params.length-1));
});

function fbwait(go, params) {
    if (firebase.apps.length === 0) {
        setTimeout(fbwait, 100);
        return;
    } //wait until firebase is init
    if (go) {
        loadTable();
    }
    else{
        loadArt(params);
    }
}

async function loadArt(slug){
    let allArt = JSON.parse(window.localStorage.getItem("art"));
    if(allArt.length == 0){
        let art = await readArt();
        window.localStorage.setItem("art", JSON.stringify(art));
        allArt = JSON.parse(window.localStorage.getItem("art"));
    }
    let index=-1;
    let count=0;
    let key="";
    allArt.forEach(function (ele){
        if(ele.slug === slug){
            index = count;
            key = ele.key;
        }
        count++;
    });
    if(key===""){
        window.location.replace("gallery.html");
    }
    else{
        document.getElementById("all").hidden=true;
        document.getElementById("view").hidden=false;
        document.getElementById("title").innerHTML=allArt[index].artwork;
        document.getElementById("artist-h").innerHTML="Created by "+allArt[index].artist;
        drawCanvases();
    }
}

function drawCanvases(){
    for(let i=0; i<25; i++){
        let canvas = document.getElementById("canv"+i);
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

async function loadTable() {
    let art = await readArt();
    window.localStorage.setItem("art", JSON.stringify(art));
    const tab = document.getElementById("artcontent");
    art.forEach(function (ele) {
        let td1 = document.createElement("td");
        td1.innerHTML = ele.artwork;
        td1.setAttribute("style", "width:40%;")
        let td2 = document.createElement("td");
        td2.innerHTML = ele.artist;
        td2.setAttribute("style", "width:40%;")
        let td3 = document.createElement("td");
        td3.innerHTML = "1/25";
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