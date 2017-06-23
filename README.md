# Tuster-Type
*Proyecto Final Desarrollo de Viedeojuegos Mediante Tecnologías Web*
23 de junio de 2017

## 1. Diseño del juego
####Controles
- __Y-U-I-H-J-K:__ los puntos en los meteoritos hacen referencia a estas teclas, para destruir un meteorito hay que pulsar las teclas seguidas de izquierda a derecha.
- __T:__ ralentizar el tiempo.
- __P:__ pausar el juego.
- __Espacio:__ estallar una bomba.
![Controles](/controles.jpg)

### 1.1 Objetivo del juego
__Tuster Type__ es un juego arcade que nos pone en la piel de una pequeña criatura con la responsabilidad de proteger su mundo de una lluvia de meteoritos usando una varita mágica.
Cada meteorito requerirá de una combinación de teclas específica para destruirlo. El objetivo del juego será aguantar el máximo tiempo posible para conseguir una mayor puntuación, la partida terminará cuando el jugador se quede sin vidas.
### 1.2 Principales mecánicas
* __Puntos:__ el jugador obtendrá puntos según avance el tiempo, además, también conseguirá puntos al destruir meteoritos.
* __Destruir meteoritos:__ los meteoritos no dejarán de caer nunca, el jugador tiene que ser rápido pulsando las teclas correctas para destruirlos todos. Los puntos en los meteoritos hacen referencia a las teclas __Y-U-I-H-J-K__, para destruir un meteorito hay que pulsar las teclas seguidas de izquierda a derecha.
* __Vidas:__ el jugador tendrá un número determinado de vidas, por cada meteorito que llegue al suelo el jugador perderá una vida acabando el juego al quedarse este sin vidas.
* __Bombas:__ el jugador tendrá un número determinado de bombas, al estallar una bomba todos los meteoritos en pantalla serán destruidos dando un respiro al jugador.
* __Combos:__ el jugador podrá realizar combos al destruir más de un meteorito a la vez, esto le otorgará una mayor cantidad de puntos obtenidos.
* __Aumento dificultad:__ según avance el tiempo el juego se volverá cada vez más difícil, aumentando el número de meteoritos que caen y su velocidad.
* __Ralentizar el tiempo:__ el jugador podrá ralentizar el tiempo durante un corto periodo de tiempo, esto se podrá realizar tras acumular una cantidad de *'zumo de tiempo'* determinada, el *'zumo de tiempo'* se consigue destruyendo meteoritos.
* __Nivel del jugador:__ el jugador podrá subir de nivel obteniendo más vidas, más bombas a su disposición, un mayor pérido de ralentización del tiempo y un mayor multiplicador de puntuación durante el juego.

* __Movimiento del jugador y coleccionables *(No implementada)*:__ *el jugador podrá moverse por el nivel recogiendo objetos que puedan soltar los meteoritos al ser destruidos.* Esta mecánica no fue implementada ya que se ha considerado que no aportaba nada al juego llegando a ser solo una distracción. La implementación hubiese sido sencilla, un Sprite que se pudiese mover por el suelo del nivel detectando colisiones de posibles coleccionables.

## 2. Diseño de la implementación
Para el desarrollo del juego se ha utilizado Quintus. Se ha modificado el componente *'tween'* para poder cambiar la velocidad de las animaciones; ha sido un cambio menor, solo se ha añadido la variable *'_anim_rate'*, un setter y se ha modificado la función *'step'* para modificar la velocidad de la animación.
Se han usado cookies para guardar algunos datos como la experiencia acumulada del jugador o las puntuaciones máximas, pudiendo cerrar el juego sin perder los datos.

El juego tiene cinco escenas:
1. __Menú principal__
2. __Puntuaciones máximas__
3. __Información del jugador:__ en esta pantalla se puede ver el nivel del jugador así como que beneficios tiene acumulados, además en esta pantalla se encuentran los créditos del juego.
4. __Pantalla de fin de partida:__ en esta pantalla el jugador ve la puntuación obtenida durante la partida y la información actualizada de su nivel y bonificaciones.
5. __Pantalla principal:__ esta es la pantalla principal del juego, a su vez está formada por cuatro escenarios:
   5.1. __Información:__ este escenario muestra el HUD del juego, vidas, bombas, puntuación, *'zumo de tiempo'* y combos realizados.
   5.2. __Pausa:__ desde este escenario el jugador podrá resumir el juego, reiniciar la partida, salir de la partida o activar/desactivar la música y efectos de sonido.
   5.3. __Fondo:__ fondo del juego, las nubes y el sol son sprites con animaciones en bucle para dar más vida al mundo.
   5.4. __Juego:__ en este escenario aparecen los meteoritos, es este el escenario que se encarga de reconocer las combinaciones pulsadas destruyendo los meteoritos, maneja la gestión de bombas, ralentización del tiempo, combos y puntuación. El Sprite principal del juego es el *'Meteorite'*, hay seis tipos de meteorito con distintas combinaciones y atributos.

## 3. Equipo de trabajo y reparto de tareas
Guillermo Cique Fernández: al ser el único miembro del equipo no ha habido reparto de tareas y toda la carga del desarrollo ha caido sobre mi.

## 4. Fuentes y referencias
Todos los recursos gráficos son propios.
La música fue creada por un amigo específicamente para el juego.
La mayoría de los efectos de sonido fueron encontrados en internet hace unos años, de páginas como [SoundBible](http://soundbible.com/) o [Free Sound Effects](https://www.freesoundeffects.com), algunos de los efectos de sonidos, como el sonido de destruir un meteorito, fueron grabados por mi.
Las fuentes del juego son fuentes gratuitas encontradas en internet.

* __Tuster iOS:__ juego desarrollado en iOS con una mecánica parecida y el mismo protagonista.
* __Magic Touch DS:__ el referente original del juego, un mago tiene que estallar los globos que sujetan a unos monstruos que caen lentamente del cielo antes de que lleguen al suelo.