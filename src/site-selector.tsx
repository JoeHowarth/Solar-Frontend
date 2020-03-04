import React, { useEffect, useState, useContext } from "react";
import { GeoJSON } from "geojson";
import { Site, MockAPI } from "./solar-api";
import geojsonMerge from "@mapbox/geojson-merge";
import { MapContext, mapStartBox, clickAble } from "./index";
import turf from "turf";
import Card from 'react-bulma-components/lib/components/card'
import Content from 'react-bulma-components/lib/components/content'

const SiteSelector = ({ params, county }) => {
    const api = new MockAPI();
    const [sites, setSites] = useState([]);
    const [searchId, setSearchId] = useState(null);
    const { map, rawMap } = useContext(MapContext);
    const [selected, setSelected] = useState(null);

    // call search api
    useEffect(() => {
        console.log("hi");
        if (county && county.feature !== null) {
            api.search({
                geom: county.feature.geometry,
                eval_params: params,
                meta: {}
            })
                .then(r => {
                    setSearchId(r.search_id);
                    r.sites.sort((a, b) => b.profit - a.profit);
                    setSites(r.sites);
                })
                .catch(e => console.error("Search api error: ", e));
        }
    }, [params, county]);

    // unzoom when unmount
    useEffect(
        () => () =>
            rawMap.flyTo({
                center: [mapStartBox.lng, mapStartBox.lat],
                zoom: mapStartBox.zoom,
                speed: 1
            }),
        []
    );

    // visualize sites on map
    useEffect(() => {
        map.then(map => {
            const geom = geojsonMerge.merge(sites.map(s => s.geometry));
            map.getSource("sites").setData(geom);
        });
        return () => {
            map.then(map =>
                map.getSource("sites").setData({
                    type: "FeatureCollection",
                    features: []
                })
            );
        };
    }, [sites]);

    useEffect(() => {
        if (selected === null) {
            return;
        }

        const { rank, site } = selected;
        console.log("siteInspector call", selected);
        api.siteInspector({
            search_id: searchId,
            site_id: site.id,
            parcels: []
        }).then(r => {
            setSites(sites => {
                sites[rank].info = r;
                return sites.slice();
            });
        });

        map.then(map =>
            map.flyTo(
                flyOpts(turf.centroid(site.geometry).geometry.coordinates)
            )
        );
    }, [selected]);

    // clickAble(
    //     map,
    //     "parcels",
    //     () => {},
    //     (old, clicked) => {
    //         old.id === clicked.id
    //             ? { name: null, id: null, feature: null }
    //             : {
    //                   name: clicked.properties.owner,
    //                   id: clicked.id,
    //                   feature: clicked
    //               };
    //     }
    // );

    return (
        <div className="columns">
            <div className="column">
                <ul>
                    {sites.map((s, r) => (
                        <li className="m-b-5" key={r}>
                            <SitePanel
                                site={s}
                                rank={r}
                                isSelected={selected && selected.rank === r}
                                onClick={() =>
                                    setSelected({ site: s, rank: r })
                                }
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const SitePanel = ({
    site,
    onClick,
    isSelected,
    rank
}: {
    site: Site;
    onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    isSelected: boolean;
    rank: number;
}) => {
    console.log("site", site);
    return (
        <Card onClick={onClick}>
            <Card.Header>
                <Card.Header.Title>Profit: {site.profit}</Card.Header.Title>
            </Card.Header>
            {isSelected && site.info ? (
                <Card.Content>
                    <Content>
                        {/* {Object.keys(site.info).map(k => (
                            <p key={k}>{k}: {site.info[k]})}</p>
                        ))} */}
                        <p>Profit: {site.info.profit}</p>
                        <p>Output (Mw): {site.info.mw_output}</p>
                        <p>Area: (km2): {site.info.area}</p>
                        <p>Tree Cover (%): {site.info.tree_cover}</p>
                        <p>
                            Average Gradient:{" "}
                            {site.info.topography.reduce(
                                (acc, { gradientBuckets, percent }) =>
                                    gradientBuckets * percent + acc,
                                0
                            )}
                        </p>
                        {/* <p>Land Ownder Info: {site.info.parcel_geometry.features.reduce((acc, feat) => (feat.properties && feat.properties.ownder)? acc + ", " + feat.properties.owner : acc, "")}</p> */}
                    </Content>
                </Card.Content>
            ) : null}
        </Card>
    );
};

const parcelSelector = (map, source, stateSetter, nextGetter) => {
    map.addLayer({
        id: source + "-fill",
        type: "fill",
        source: source,
        paint: {
            "fill-color": "hsl(107, 69%, 52%)",
            "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "click"], false],
                0.5,
                0.1
            ]
        }
    });

    const handler = e => {
        // set or toggle county in state
        stateSetter(old => {
            console.log(old);
            const clicked = e.features[0];
            console.log("clicked", clicked);
            console.log("geom?", clicked.geometry);
            if (old.id !== null) {
                map.removeFeatureState({
                    source: source,
                    id: old.id
                });
            }

            const next = nextGetter(old, clicked);

            map.setFeatureState(
                { source: source, id: clicked.id },
                { click: next.id !== null } // toggle
            );
            return next;
        });
    };

    const cleanup = () => {
        map.removeLayer(source + "-border");
        map.removeLayer(source + "-fill");
        map.off(handler);
    };
    return cleanup;
};

const SitePanelExpanded = ({ site, rank }) => ({});
const flyOpts = center => ({
    // These options control the ending camera position: centered at
    // the target, at zoom level 9, and north up.
    center,
    zoom: 12,
    bearing: 0,

    // These options control the flight curve, making it move
    // slowly and zoom out almost completely before starting
    // to pan.
    speed: 1.2, // make the flying slow
    curve: 1, // change the speed at which it zooms out

    // This can be any easing function: it takes a number between
    // 0 and 1 and returns another number between 0 and 1.
    easing: function(t) {
        return t;
    },

    // this animation is considered essential with respect to prefers-reduced-motion
    essential: true
});

export default SiteSelector;
