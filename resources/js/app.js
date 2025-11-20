import Alpine from 'alpinejs';
import collapse from '@alpinejs/collapse';

Alpine.plugin(collapse);
window.Alpine = Alpine;
Alpine.start();

import './modules/maps.js';
import './modules/iso.js';
import './modules/filter.js';
import './modules/rellax.js';
