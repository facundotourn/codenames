var palabras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', '1', '2'];
var teams = ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'X']
var cartitas = {};
var pRojo = 0;
var pAzul = 0;

$(document).ready(function() {
    for(i = 1; i < 6; i++) {
        for(j = 1; j < 6; j++) {
            var tipo;
            var aux = Math.random();
            
            if(teams.length > 0) {
                tipo = teams.splice(Math.floor(Math.random()*teams.length), 1)[0];
            } else {
                if (aux > 0.5) {
                    tipo = 'A';
                } else {
                    tipo = 'R';
                }
            }

            if (tipo == 'R') {
                pRojo++;
            } else if (tipo == 'A') {
                pAzul++;
            }
            
            cartitas["" + i + j] = new Tarjeta(i, j, palabras.pop(), tipo);
            $('#crd' + i + j).text(cartitas["" + i + j].palabra);

            actualizarPuntos();
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
                pAzul--;
                break;
            case 'R':
                $(this).addClass('trj-visible-roja');
                pRojo--;
                break;
            case 'N':
                $(this).addClass('trj-visible-neutra');
                break;
            case 'X':
                $(this).addClass('trj-visible-x');
                break;
            default:
                break;
        }

        $(this).removeClass('trj-oculta');
        $(this).addClass('trj-visible');

        actualizarPuntos();
    });

    $('#btnJugador').click(function() {
        $(this).addClass('active');
        $('#btnEspia').removeClass('active');

        $('.trj-espia').each(function(index, element) {
            var id = ($(element).attr('id')).substr($(element).attr('id').length - 2, 2);

            $(element).removeClass('trj-espia');
            $(element).addClass('trj-oculta');

            switch(cartitas[id].equipo) {
                case 'A':
                    $(element).removeClass('trj-espia-azul');
                    break;
                case 'R':
                    $(element).removeClass('trj-espia-roja');
                    break;
                case 'N':
                    break;
                case 'X':
                    $(element).removeClass('trj-espia-x');
                    break;
            }
        });
    });

    $('#btnEspia').click(function() {
        $(this).addClass('active');
        $('#btnJugador').removeClass('active');

        $('.trj-oculta').each(function(index, element) {
            var id = ($(element).attr('id')).substr($(element).attr('id').length - 2, 2);
            
            $(element).removeClass('trj-oculta');
            $(element).addClass('trj-espia');
                        
            switch(cartitas[id].equipo) {
                case 'A':
                    $(element).addClass('trj-espia-azul');
                    break;
                case 'R':
                    $(element).addClass('trj-espia-roja');
                    break;
                case 'N':
                    break;
                case 'X':
                    $(element).addClass('trj-espia-x');
                    break;
            }
        });
    });
});

function actualizarPuntos() {
    $('#i-pt-rojo').html(pRojo);
    $('#i-pt-azul').html(pAzul);
}

class Tarjeta {
    constructor(fil, col, palabra, equipo) {
        this.fil = fil;
        this.col = col;
        this.palabra = palabra;
        this.equipo = equipo;
    }
}