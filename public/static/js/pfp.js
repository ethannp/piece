$(function () {
    canvPFP();
});

function canvPFP() {
    const canvas = document.getElementById("pic");
    const context = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = "rgba(255,255,255,0.6)";
    context.fill();
    context.clip();
}