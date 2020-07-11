import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLFloat, GraphQLSchema } from 'graphql'

const resolverSchema = {}

const BASE_URL = 'https://api.openrouteservice.org/v2/isochrones/'
const meanOfTravel = 'driving-car'
const api = "5b3ce3597851110001cf62487a9daef655ed48d691737507e56cfb21"

function fetchResponseByURL(meanOfTravel, options) {
    return fetch(`${BASE_URL}${meanOfTravel}`, {
        method: "POST",
        headers: {
            "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
            "Authorization": api,
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(options)
    }).then(res => res.json())
}

function fetchFeatureByURL(meanOfTravel, options) {
    return fetchResponseByURL(meanOfTravel, options).then(json => json.features)
}

const QueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'La base des requêtes',
    fields: () => ({
        features: {
            type: FeatureType,
            args: {
                meanOfTravel: {
                    type: GraphQLString
                },
                attributes: {
                    type: new GraphQLList(GraphQLString)
                },
                interval: {
                    type: GraphQLInt
                },
                location_type: {
                    type: GraphQLString
                },
                locations: {
                    type: new GraphQLList(Point)
                },
                range: {
                    type: new GraphQLList(GraphQLInt)
                },
                range_type: {
                    type: GraphQLString
                },
                units: {
                    type: GraphQLString
                }
            },
            resolve: (root, args) => fetchFeatureByURL(args.meanOfTravel, {
                locations: args.locations,
                range: args.range,
                attributes: args.attributes,
                interval: args.interval,
                location_type: args.location_type,
                range_type: args.range_type,
                units: args.units
            })
        },
    })
})

const FeatureType = new GraphQLObjectType({
    name: 'FeatureType',
    description: 'geographic query result',
    fields: () => ({
        type: {
            type: GraphQLString,
            resolve: feature => feature.type
        },
        properties: {
            type: FeatureProperties,
            resolve: feature => feature.properties
        },
        geometry: {
            type: Geometry,
            resolve: feature => feature.geometry
        }
    })
})

const FeatureProperties = new GraphQLObjectType({
    name: 'FeatureProperties',
    description: 'feature properties',
    fields: () => ({
        group_index: {
            type: GraphQLInt,
            resolve: properties => properties.group_index
        },
        value: {
            type: GraphQLInt,
            resolve: properties => properties.value
        },
        center: {
            type: Point,
            resolve: properties => properties.center
        }
    })
})

const Geometry = new GraphQLObjectType({
    name: 'Geometry',
    description: 'type and coordinates',
    fields: () => ({
        coordinates: {
            type: Polygon,
            resolve: geometry => geometry.coordinates
        },
        type: {
            type: GraphQLString,
            resolve: geometry => geometry.type
        }
    })
})

const Polygon = new GraphQLObjectType({
    name: 'Polygon',
    description: 'Geographic Polygon caracterized by a list of Polyline',
    fields: () => ({
        polygon: {
            type: GraphQLList(Polyline),
            resolve: polygon => polygon
        }
    })
})

const Polyline = new GraphQLObjectType({
    name: 'Polyline',
    description: 'Geographic Polyline caracterized by a list of Point',
    fields: () => ({
        polyline: {
            type: GraphQLList(Point),
            resolve: polyline => polyline
        }
    })
})

const Point = new GraphQLObjectType({
    name: 'Point',
    description: 'Geographic Point caracterized by a LatLngTuple',
    fields: () => ({
        lnglat: {
            type: GraphQLList(GraphQLFloat),
            resolve: point => [point[0], point[1]]
        },
        latlng: {
            type: GraphQLList(GraphQLFloat),
            resolve: point => [point[1], point[0]]
        }
    })
})

export default new GraphQLSchema({
    query: QueryType
})