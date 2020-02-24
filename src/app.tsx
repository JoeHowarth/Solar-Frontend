import React, { Component, useState, Dispatch, SetStateAction } from "react";
import { Route, Switch } from "react-router-dom";
import { Container, Box } from "bloomer";
import mapboxgl, { Map } from "mapbox-gl";
import SolarMenu, { Base } from "./menu";
import NewQuery from "./new-query";
import ParameterEditor from "./parameter-editor";
import SiteSelector from "./site-selector";
import { Parameters } from "./solar-api";

export type State<T> = [T, Dispatch<SetStateAction<T>>];
export interface County {name: string, id: number, feature: any}

const App = () => {
    const [params, setParams]: State<Parameters> = useState({
        treeCost: 15, // placeholder
        landValuePerAcre: 1200, // $1200/year lease
        costOfCapital: 15, // 15%
        targetAcreage: 10, // acres
        maxParcels: 3,
        targetOutput: 10, // Mw
        minOuput: 5
    });

    const [county, setCounty]: State<County> = useState({ name: null, id: null, feature: null });

    return (
        <Container className="floater">
            <Base>
                <Switch>
                    <Route path="/" component={SolarMenu} exact />
                    <Route
                        path="/new-query"
                        component={() => <NewQuery setCounty={setCounty} />}
                    />
                    {/* <Route path="/results" component={Results} /> */}
                    <Route
                        path="/edit-parameters"
                        component={props => (
                            <ParameterEditor params={[params, setParams]} />
                        )}
                    />
                    <Route
                        path="/site-selector"
                        component={() => (
                            <SiteSelector params={params} county={county} />
                        )}
                    />
                    <Route
                        component={() => (
                            <div className="notification is-danger">
                                Page not implemented yet {":("}
                            </div>
                        )}
                    />
                </Switch>
            </Base>
        </Container>
    );
};
export default App;
