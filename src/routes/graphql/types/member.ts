import {GraphQLInt, GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLNonNull } from "graphql";
import { MemberTypeId } from "./memberId.js";

export const  MemberType = new GraphQLObjectType({
    name: 'Member',
    fields: () => ({
        id: { type: new GraphQLNonNull(MemberTypeId) },
        discount: { type: new GraphQLNonNull(GraphQLFloat) },
        postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    }),
});