let rnr = document.getElementById("rnr")
let count = 0

function change() {
    count = "109.233.198.58";
    rnr.innerText = count
    console.log("now the number is: " + count)
}

function erase() {
    count = 0
    rnr.innerText = count
    console.log("now the number is: " + count)

}
