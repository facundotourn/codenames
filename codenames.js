var palabras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', '1', '2'];
var cartitas = [];

$(document).ready(function() {
    for(i = 1; i < 6; i++) {
        for(j = 1; j < 6; j++) {
            $('#crd' + i + j).text(palabras.pop());
        }
    }
});