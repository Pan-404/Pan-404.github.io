let nr = document.getElementById("nr")
let dox = document.getElementById("dox")
let count = 0

function change() {
    count = 109 + "." + 233 + "." + 198 + "." + 58
    nr.innerText = count
    dox.innerText = "GET DOXXED"
    console.log("now the number is: " + count)
}

function erase() {
    count = 0
    nr.innerText = count
    dox.innerText = "⠀"
    console.log("now the number is: " + count)

}
