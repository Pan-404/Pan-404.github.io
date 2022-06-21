let nr = document.getElementById("nr")
let count = 0

function change() {
    count = 109 + "." + 233 + "." + 198 + "." + 58
    nr.innerText = count
    console.log("now the number is: " + count)
}

function erase() {
    count = 0
    nr.innerText = count
    console.log("now the number is: " + count)

}
