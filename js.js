let nr = document.getElementById("number")
let count = 0

function increase() {
    count += 1
    nr.innerText = count
    console.log("now the number is: " + count)
}

function erase() {
        count = 0
        nr.innerText = count
        console.log("now the number is: " + count)

}
