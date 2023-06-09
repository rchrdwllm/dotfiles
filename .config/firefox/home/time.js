function realtimeClock() {

    var clockerhehe = new Date();
    var hrs = clockerhehe.getHours();
    var mins = clockerhehe.getMinutes();
    var amPm = ( hrs < 12) ? "AM" : "PM";

    hrs = (hrs > 12) ? hrs - 12 : hrs;
    hrs = ("0" + hrs).slice(-2);
    mins = ("0" + mins).slice(-2);

    document.getElementById('clock').innerHTML = hrs + ":" + mins + " " + amPm;
    var t = setTimeout(realtimeClock, 500);
}