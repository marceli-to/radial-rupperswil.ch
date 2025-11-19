/**
 * Mapbox GL JS integration module
 * Lazy loads Mapbox and initializes the map with markers
 */

const CONFIG = Object.freeze({
  accessToken: 'pk.eyJ1IjoibWFyY2VsaXRvb29vIiwiYSI6ImNtNm1hNG5vdDBmaGUya3NoZnRldnhqd3YifQ.CMI4nKvoE7I8H9Dal7IHyw',
  style: 'mapbox://styles/marcelitoooo/ck16ms7m51nlo1cmwnqrbjuyq?optimize=true',
  center: [8.132958329641724, 47.4029093076428],
  defaultZoom: 15,
  scriptUrl: 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js',
  cssUrl: 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css',
});

const GEOJSON_DATA = Object.freeze({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: CONFIG.center,
      },
      properties: {
        title: 'Radial Rupperswil',
        description: '',
      },
    },
  ],
});

class MapboxMap {
  #map = null;
  #mapElement = null;
  #loaded = false;

  constructor() {
    this.#mapElement = document.getElementById('map');
    if (this.#mapElement) {
      this.#loadMapbox();
    }
  }

  async #loadMapbox() {
    try {
      await Promise.all([
        this.#loadScript(CONFIG.scriptUrl),
        this.#loadStylesheet(CONFIG.cssUrl),
      ]);
      this.#initMap();
    } catch (error) {
      console.error('Failed to load Mapbox:', error);
    }
  }

  #loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.mapboxgl) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  #loadStylesheet(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
      document.head.appendChild(link);
    });
  }

  #initMap() {
    const zoom = parseInt(this.#mapElement.dataset.zoom, 10) || CONFIG.defaultZoom;

    mapboxgl.accessToken = CONFIG.accessToken;

    this.#map = new mapboxgl.Map({
      container: 'map',
      style: CONFIG.style,
      center: CONFIG.center,
      zoom,
    });

    this.#map.addControl(new mapboxgl.NavigationControl());
    this.#map.scrollZoom.disable();

    this.#addMarkers();
    this.#loaded = true;
  }

  #addMarkers() {
    for (const feature of GEOJSON_DATA.features) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40.8 52.8" width="41" height="53"><path d="M40.8,20.4A20.4,20.4,0,0,0,0,20.4C0,31.7,20.4,52.8,20.4,52.8S40.8,31.7,40.8,20.4ZM10.9,20a9.5,9.5,0,1,1,9.5,9.5A9.6,9.6,0,0,1,10.9,20Z" fill="#142532"/></svg>`;

      new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(feature.geometry.coordinates)
        .addTo(this.#map);
    }
  }

  get map() {
    return this.#map;
  }

  get isLoaded() {
    return this.#loaded;
  }

  destroy() {
    this.#map?.remove();
    this.#map = null;
    this.#loaded = false;
  }
}

// Initialize and export instance
const mapInstance = new MapboxMap();
export default mapInstance;
