var app={
  inicio: function(){
    velocidadX = 0;
    velocidadY = 0;
    
    alto  = document.documentElement.clientHeight;
    ancho = document.documentElement.clientWidth;

    app.vigilaSensores();
    app.iniciaJuego();
  },

  iniciaJuego: function(){

    var plataforma;
    var suelo;
    var personaje;
    var gotas;
    var umbrella;

    var txtPuntaje;
    var txtVidas;
    var txtNivel;

    var sndPunto;

    function preload() {
      game.load.image('plataforma', 'assets/platform.png');
      game.load.image('suelo', 'assets/suelo.png');
      game.load.audio('punto', 'assets/numkey.wav');
      game.stage.backgroundColor = '#3d6a99';
      game.load.image('umbrella', 'assets/umbrella.png');
      game.load.image('gota', 'assets/gota.png');
      game.load.image('bear', 'assets/carebear.png');
    }

    function create() {
     plataforma = game.add.sprite(0, 100, 'plataforma');
     plataforma.width = ancho;
     
     suelo = game.add.sprite(0, alto - 10, 'suelo');
     suelo.width = ancho;
     suelo.height = 10;
     
     umbrella = game.add.sprite(50, alto - 200, 'umbrella');
     umbrella.scale.setTo(0.5,0.5);
     personaje = game.add.sprite(32, 0, 'bear');
     
     game.physics.startSystem(Phaser.Physics.ARCADE);
     
     game.physics.arcade.enable(plataforma);
     game.physics.arcade.enable(suelo);
     game.physics.arcade.enable(umbrella);
     game.physics.arcade.enable(personaje);
     
     personaje.body.gravity.y = 300;
     plataforma.body.immovable = true;
     
     personaje.body.velocity.x = 250;
     
     umbrella.body.collideWorldBounds = true;
     umbrella.body.onWorldBounds = new Phaser.Signal();  
     gotas = game.add.group();
     
     game.giro = ancho / 3;
     game.velocidadGotas = 500;
     game.gravedadGotas = 150;
     game.puntaje = 0;
     game.vidas = 50;
     game.nivel = 1;
     
      game.subirNivel = game.time.events.loop(10000, subirNivel, this);
       
      txtPuntaje = game.add.text(5, 5, 'Puntaje: 0 - Nivel: 1 - Vidas: 5', { font: '14px Arial', fill: '#FFF' });
      //txtPos = game.add.text(5, alto-30, 'Pos: 5', {font: '14px Arial', fill: '#FFF'});
       
      sndPunto = game.add.audio('punto');
    }

    function update(){
       game.physics.arcade.collide(personaje, plataforma);
       game.physics.arcade.overlap(gotas, suelo, perderVida, null, this);
       game.physics.arcade.overlap(umbrella, gotas, recogerGota, null, this); 
           
       if(personaje.body.velocity.x > 0 && personaje.x > game.giro){
           personaje.body.velocity.x *= -1;
           game.giro = game.rnd.integerInRange(20, personaje.x-1);
           soltarGota();
       }
       
       if(personaje.body.velocity.x < 0 && personaje.x < game.giro){
           personaje.body.velocity.x *= -1;
           game.giro = game.rnd.integerInRange(personaje.x+1, ancho-20);
           soltarGota();
       }
       
       umbrella.body.velocity.x = velocidadX * (-300);
    }

    function soltarGota() {
     var gota = gotas.create(personaje.x, 100, 'gota');
     game.physics.arcade.enable(gota);
     gota.body.gravity.y = game.gravedadGotas;
    }

    function subirNivel(){
      game.gravedadGotas *= 1.2;
      personaje.body.velocity.x *= 1.2;
      game.nivel += 1;
      txtPuntaje.setText('Puntaje: '+game.puntaje+' - Nivel: '+game.nivel+' - Vidas: '+game.vidas);
    }

    function recogerGota(umbrella, gota){
        gota.kill();
        game.puntaje += 5;
        txtPuntaje.setText('Puntaje: '+game.puntaje+' - Nivel: '+game.nivel+' - Vidas: '+game.vidas);
        sndPunto.play();
    }
     
    function perderVida(suelo, gota){
        gota.kill();
        game.vidas -= 1;
        txtPuntaje.setText('Puntaje: '+game.puntaje+' - Nivel: '+game.nivel+' - Vidas: '+game.vidas);

        if(game.vidas == 0){
          suelo.kill();
          umbrella.kill();
          game.add.text(80, 250, 'Perdiste', {font:'40px Arial', fill: '#FFF'});
          game.add.text(80, 350, 'Nivel: '+game.nivel, {font:'25px Arial', fill: '#FFF'});
          game.add.text(80, 400, 'Puntaje: '+game.puntaje, {font:'25px Arial', fill: '#FFF'});
        }
    }
    var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, '', { preload: preload, create: create, update: update });
  },

  vigilaSensores: function(){
    
    function onError() {
        console.log('onError!');
    }

    function onSuccess(datosAceleracion){
      app.detectaAgitacion(datosAceleracion);
      app.registraDireccion(datosAceleracion);
    }

    navigator.accelerometer.watchAcceleration(onSuccess, onError,{ frequency: 10 });
  },

  detectaAgitacion: function(datosAceleracion){
    var agitacionX = datosAceleracion.x > 10;
    var agitacionY = datosAceleracion.y > 10;

    if (agitacionX || agitacionY){
      setTimeout(app.recomienza, 1000);
    }
  },

  recomienza: function(){
    document.location.reload(true);
  },

  registraDireccion: function(datosAceleracion){
    velocidadX = datosAceleracion.x ;
    velocidadY = datosAceleracion.y ;
  }

};

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function() {
        app.inicio();
    }, false);
}