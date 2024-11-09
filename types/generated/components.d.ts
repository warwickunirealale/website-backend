import type { Schema, Attribute } from '@strapi/strapi';

export interface HomepageAboutHomepageAbout extends Schema.Component {
  collectionName: 'components_homepage_about_homepage_abouts';
  info: {
    displayName: 'Homepage About';
    icon: 'layer';
    description: '';
  };
  attributes: {
    header: Attribute.String & Attribute.Required;
    body: Attribute.Text & Attribute.Required;
    image: Attribute.Media<'images'> & Attribute.Required;
    link: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'homepage-about.homepage-about': HomepageAboutHomepageAbout;
    }
  }
}
