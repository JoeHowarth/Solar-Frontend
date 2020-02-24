import { GeoJSON } from "geojson";
import axios, { AxiosResponse } from "axios";
import { siteGeomInCarrol1, siteGeomInCarrol2, parcelsForSite1 } from "./mock-sites";

export interface Parameters {
    treeCost: number; // placeholder
    landValuePerAcre: number; // $1200/year lease
    costOfCapital: number; // 15%
    targetAcreage: number; // acres
    maxParcels: number;
    targetOutput: number; // Mw
    minOuput: number;
}

export interface SearchResponse {
    search_id: number;
    sites: Site[];
}

export interface Site {
    site_id: number;
    geometry: GeoJSON;
    profit: number;
    info?: SiteResponse 
}

export interface SiteResponse {
    parcel_geometry: GeoJSON;
    profit: number;
    mw_output: number;
    area: number;
    tree_cover: number; // ?
    topography: Array<{ gradientBuckets: any; percent: number }>;
    land_cover: Map<string, number>;
    tile_quality_heatmap: GeoJSON;
}

export interface SolarAPI {
    search(data: {
        geom: GeoJSON;
        eval_params: Parameters;
        meta: Object;
    }): Promise<SearchResponse>;

    siteInspector(data: {
        search_id: number;
        site_id: number;
        parcels: number[];
    }): Promise<SiteResponse>;
}

export default class API implements SolarAPI {
    constructor(url: string) {
        this.url = url;
    }

    url: string;

    async search(data: {
        geom: GeoJSON;
        eval_params: Parameters;
        meta: Object;
    }): Promise<SearchResponse> {
        return <SearchResponse>await axios({
            method: "post",
            url: this.url + "/search",
            data
        })
            .then(r => r.data)
            .catch(e => console.error("Solar API search error: ", e));
    }

    async siteInspector(data: {
        search_id: number;
        site_id: number;
        parcels: number[];
    }): Promise<SiteResponse> {
        return <SiteResponse>await axios({
            method: "post",
            url: this.url + "/site_inspector",
            data
        })
            .then(r => r.data)
            .catch(e => console.error("Solar API site_inspector error: ", e));
    }
}

export class MockAPI implements SolarAPI {
    async search(data: {
        geom: GeoJSON;
        eval_params: Parameters;
        meta: Object;
    }): Promise<SearchResponse> {
        return {
            search_id: 1,
            sites: [
                {
                    site_id: 1,
                    geometry: siteGeomInCarrol1,
                    profit: 5000
                },
                {
                    site_id: 2,
                    geometry: siteGeomInCarrol2,
                    profit: 6000
                }
            ]
        };
    }
    async siteInspector(data: {
        search_id: number;
        site_id: number;
        parcels: number[];
    }): Promise<SiteResponse> {
        return {
            parcel_geometry: parcelsForSite1,
            profit: 2,
            mw_output: 100,
            area: 200,
            tree_cover: 0.2, // ?
            topography: [],
            land_cover: new Map(),
            tile_quality_heatmap: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [125.6, 10.1]
                },
                properties: {
                    name: "Dinagat Islands"
                }
            }
        };
    }
}
