var palabras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', '1', '2'];
var cartitas = {};

$(document).ready(function() {
    for(i = 1; i < 6; i++) {
        for(j = 1; j < 6; j++) {
            var tipo;
            var aux = Math.random();
            if (aux < 0.5) {
                tipo = 'A';
            } else {
                tipo = 'R';
            }
            cartitas["" + i + j] = new Tarjeta(i, j, palabras.pop(), tipo);
            $('#crd' + i + j).text(cartitas["" + i + j].palabra);
        }
    }

    /* for(i = 0; i < cartitas.length; i++) {
        $('#crd' + cartitas[i].fil + cartitas[i].col).text(cartitas[i].palabra);
    } */

    $('.tarjeta').addClass('trj-oculta');

    $('.trj-oculta').click(function() {
        var id = $(this).attr('id');
        var fil = id.substr(id.length - 2, 1);
        var col = id.substr(id.length - 1);

        var cardClicked = cartitas["" + fil + col];

        switch(cardClicked.equipo) {
            case 'A':
                $(this).addClass('trj-visible-azul');
                break;
            case 'R':
                $(this).addClass('trj-visible-roja');
                break;
            default:
                break;
        }

        $(this).removeClass('trj-oculta');
        $(this).addClass('trj-visible');

        
    });

    $('#btnJugador').click(function() {
        $(this).addClass('active');
        $('#btnEspia').removeClass('active');
    });

    $('#btnEspia').click(function() {
        $(this).addClass('active');
        $('#btnJugador').removeClass('active');
    });
});

class Tarjeta {
    constructor(fil, col, palabra, equipo) {
        this.fil = fil;
        this.col = col;
        this.palabra = palabra;
        this.equipo = equipo;
    }
}