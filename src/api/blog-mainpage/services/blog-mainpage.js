'use strict';

/**
 * blog-mainpage service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::blog-mainpage.blog-mainpage');
