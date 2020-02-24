import React, {
    useEffect,
    useContext,
    useState,
    Dispatch,
    SetStateAction
} from "react";
import { withRouter, history } from "react-router-dom";
import ParameterEditor from "./parameter-editor";
import { Link } from "react-router-dom";
import { Button } from "bloomer";
import mapboxgl, { Map } from "mapbox-gl";
import { MapContext } from "./index";
import { County } from "~app";

const NewQuery = withRouter(
    ({
        history,
        setCounty
    }: {
        setCounty: Dispatch<SetStateAction<County>>;
        history;
    }) => {
        const { map, rawMap } = useContext(MapContext);

        useEffect(() => enableCountySelection(map, rawMap, setCounty), []);

        return (
            <div className="columns">
                <div className="column">
                    <div className="has-margin-top-1">
                        <Button
                            onClick={() => {
                                history.push("site-selector");
                            }}
                            className="is-primary is-fullwidth "
                        >
                            Solve
                        </Button>
                    </div>
                    <div>
                        <Link
                            className="button is-secondary is-fullwidth"
                            to="edit-parameters"
                        >
                            Edit Parameters
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
);

const enableCountySelection = (
    map: Promise<Map>,
    rawMap: Map,
    setCounty: Dispatch<SetStateAction<County>>
) => {
    map.then(map => {
        console.log("re-render");
        map.addLayer({
            id: "counties-border",
            type: "line",
            source: "counties-data",
            "source-layer": "counties-9h975g",
            paint: {
                "line-color": "hsl(228, 73%, 46%)",
                "line-width": 1
            }
        });
        map.addLayer({
            id: "counties-fill",
            type: "fill",
            source: "counties-json",
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
    });

    const handler = e => {
        // set or toggle county in state
        setCounty(county => {
            console.log(county);
            const clicked = e.features[0];
            console.log("clicked", clicked);
            console.log("geom?", clicked.geometry);
            if (county.id !== null) {
                rawMap.removeFeatureState({
                    source: "counties-json",
                    id: county.id
                });
            }

            const next =
                county.id === clicked.id
                    ? { name: null, id: null, feature: null }
                    : {
                          name: clicked.properties.county,
                          id: clicked.id,
                          feature: clicked
                      };

            rawMap.setFeatureState(
                { source: "counties-json", id: clicked.id },
                { click: next.id !== null } // toggle
            );
            return next;
        });
    };
    rawMap.on("click", "counties-fill", handler);

    const cleanup = () => {
        rawMap.removeLayer("counties-border");
        rawMap.removeLayer("counties-fill");
        rawMap.off(handler);
        // setCounty(county => {
        //     if (county.id !== null) {
        //         rawMap.removeFeatureState({
        //             source: "counties-json",
        //             id: county.id
        //         });
        //     }
        //     return { name: null, id: null, feature: null };
        // });
    };

    return cleanup;
};

export default NewQuery;
