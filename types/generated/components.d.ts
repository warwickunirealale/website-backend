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

export interface FlagshipSponsersFlagshipSponsers extends Schema.Component {
  collectionName: 'components_flagship_sponsers_flagship_sponsers';
  info: {
    displayName: 'Flagship Sponsers';
    description: '';
  };
  attributes: {
    logo: Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Attribute.Required;
    link: Attribute.String;
  };
}

export interface AboutusWhoWhatWhyAboutUsWhoWhatWhy extends Schema.Component {
  collectionName: 'components_aboutus_who_what_why_about_us_who_what_whies';
  info: {
    displayName: 'AboutUs Who What Why';
    icon: 'file';
  };
  attributes: {
    header: Attribute.String & Attribute.Required;
    body: Attribute.Text & Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'homepage-about.homepage-about': HomepageAboutHomepageAbout;
      'flagship-sponsers.flagship-sponsers': FlagshipSponsersFlagshipSponsers;
      'aboutus-who-what-why.about-us-who-what-why': AboutusWhoWhatWhyAboutUsWhoWhatWhy;
    }
  }
}
