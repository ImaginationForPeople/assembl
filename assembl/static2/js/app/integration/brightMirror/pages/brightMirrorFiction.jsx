import React, { Component } from 'react';
import CircleAvatar from '../../../components/debate/brightMirror/circleAvatar';

class BrightMirrorFiction extends Component {
  render() {
    return (
      <article>
        <header>
          <CircleAvatar src="https://loremflickr.com/300/300" />
          <p>Helen Aguilar</p>
          <p>Le <time dateTime="2018-07-09 11:11:11-0200" pubdate>09/07/2018</time></p>
        </header>
        <h1>Les émotifs</h1>
        <p>
          15 janvier 2050 : je suis assis paisiblement chez moi en train de lire un épisode de la série « Ceux qui restent » en
          version émotive. L’histoire me rend triste mais je la lis parce que j’y entrevois la profondeur des sentiments. Avant
          l’arrivée de la tablette sensorielle, quand les films et les séries n’avaient pas d’émo-description, je préférais les
          histoires écrites. Au moins dans les livres, les sentiments sont détaillés. Je les comprends. Je suis là, dans
          l’histoire, dans la vie des personnages, dans leur tête, dans leur âme. J’entre en introspection pour sonder puis
          ranger dans les tiroirs de mon esprit les nouvelles émotions que je découvre.<br /><br />
          Maintenant, avec les sous-titres c’est plus facile pour moi de regarder une vidéo : « Confusion indice 5 + Honte
          indice 1 » ; ou « Joie indice 3 + Nostalgie indice 2 » ; ou encore « Colère indice 8 + Amour indice 9 + Regret indice
          4 » Ces idéogrammes qui apparaissent à chaque scène que je parcours du doigt, je sais les lire couramment maintenant.
          C’est comme du braille digital, mais pour les gens que le monde des interactions déroute. C’est généré par une IA qui
          analyse le format facial des inférences émotionnelles pour les traduire en émo-signes qui se dessinent et se déploient
          comme des fleurs sur l’écran. En lisant, je prends en moi la palette des émotions qui existent. Et j’apprends à lier
          le signe au sentiment. Cela me donne une sensation d’universalité qui se manifeste presque de façon physique. Comme
          un courant électrique qui me traverse. Très intime, personnel. Mais tellement collectif : je me sens comme tout le
          monde. J’appartiens moi aussi. Je peux entrer en interférence émotionnelle avec un univers de sensations, toucher le
          monde des impressions et des consciences humaines.
        </p>
      </article>
    );
  }
}

export default BrightMirrorFiction;