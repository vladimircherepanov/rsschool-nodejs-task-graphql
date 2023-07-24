import { GraphQLObjectType, GraphQLNonNull } from "graphql";
import { UUIDType } from "./uuid.js";

export const SubscriptionsType = new GraphQLObjectType({
    name: "Subscriptions",
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        authorId:  { type: new GraphQLNonNull(UUIDType) },
        subscriberId:  { type: new GraphQLNonNull(UUIDType) },
    }),
});
