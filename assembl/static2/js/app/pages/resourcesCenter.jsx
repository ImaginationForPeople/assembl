import React from 'react';
import Header from '../components/common/header';
import ResourceBlock from '../components/resourcesCenter/resourceBlock';

const ResourcesCenter = (props) => {
  let resourcesCenterProps;
  // I put the condition below just to be able to make a snapshot test of this component receiving props
  if (props.resources) {
    resourcesCenterProps = props.resources;
  } else {
    resourcesCenterProps = {
      headerTitle: 'Centre de ressources en ligne',
      headerImage: 'http://i.f1g.fr/media/figaro/800x_crop/2015/06/24/XVMc0167212-19a9-11e5-8467-f08c778c772f-805x453.jpg',
      resources: [
        {
          title: 'Economie - Rapport très intéressant',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
          media: {
            type: 'image',
            url: 'http://img.bfmtv.com/c/1256/708/6fe/831e6b4c6f0fb3ff26b8123515740.jpg'
          },
          doc: 'https://www.google.fr'
        },
        {
          title: 'Economie - Vidéo tout à fait fascinantet',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
          media: {
            type: 'embed',
            url: 'https://player.vimeo.com/video/32975166'
          },
          doc: undefined
        },
        {
          title: 'Economie - Des slides éblouissantes',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
          media: {
            type: 'embed',
            url: 'http://www.slideshare.net/slideshow/embed_code/key/27D5UNrUvyDJjC'
          },
          doc: undefined
        }
      ]
    };
  }

  const { headerTitle, headerImage, resources } = resourcesCenterProps;

  return (
    <div className="resources-center">
      <Header title={headerTitle} imgUrl={headerImage} />
      <section>
        {resources.map((resource, index) => {
          const { title, description, media, doc } = resource;
          return <ResourceBlock title={title} description={description} media={media} doc={doc} index={index} key={index} />;
        })}
      </section>
    </div>
  );
};

export default ResourcesCenter;