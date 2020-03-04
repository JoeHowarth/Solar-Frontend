import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import mapboxgl, { Map } from "mapbox-gl";
// import 'react-bulma-components/dist/react-bulma-components.min.css';
import Counties from "./counties.json";
import App from "./app";
import './solar-styles.scss'

console.log("ping...ping...");

mapboxgl.accessToken =
    "pk.eyJ1Ijoiam9laG93YXJ0aCIsImEiOiJjazRkM2ly" +
    "YXMwdXo2M21ydjlqd3Rzd2x6In0.S-ZZic4QmOguvvRkFPzV6w";

export const MapContext = React.createContext({ rawMap: null, map: null });
export const mapStartBox = { lat: 39.174483, lng: -77.008021, zoom: 8 };

window.addEventListener("DOMContentLoaded", e => {
    console.log("at top of content load");
    let rawMap: Map = new mapboxgl.Map({
        container: "mapElem", // container id
        style: "mapbox://styles/mapbox/streets-v11", //hosted style id
        // style: "mapbox://styles/joehowarth/ck5rl48wi0h0g1isvjtih1zns",
        center: [mapStartBox.lng, mapStartBox.lat],
        zoom: mapStartBox.zoom // starting zoom
    });

    const mapPromise = new Promise((resolve, abort) => {
        rawMap.on("load", () => {
            resolve(rawMap);
            addCountyLayers(rawMap);
        });
    });

    // mapPromise.then(map => {
    ReactDOM.render(
        <BrowserRouter>
            <MapContext.Provider value={{ map: mapPromise, rawMap }}>
                <App />
            </MapContext.Provider>
        </BrowserRouter>,
        document.getElementById("app")
    );
    // });
});

const addCountyLayers = (map: Map) => {
    map.addSource("counties-data", {
        type: "vector",
        url: "mapbox://joehowarth.27x1jzti"
    });
    map.addSource("counties-json", {
        type: "geojson",
        data: Counties,
        generateId: true
    });
    map.addSource("parcels", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: []
        },
        generateId: true
    });
    map.addSource("sites", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: []
        },
        generateId: true
    });
    map.addLayer({
        id: "sites-fill",
        type: "fill",
        source: "sites",
        paint: {
            "fill-color": "hsl(207, 69%, 52%)",
            "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "click"], false],
                0.5,
                0.1
            ]
        }
    });
    map.addLayer({
        id: "sites-border",
        type: "line",
        source: "sites",
        paint: {
            "line-color": "hsl(228, 73%, 46%)",
            'line-opacity': 0.5,
            "line-width": 1
        }
    });
};
