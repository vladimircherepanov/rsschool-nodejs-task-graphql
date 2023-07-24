import { GraphQLEnumType } from "graphql";

export const MemberTypeId = new GraphQLEnumType({
    name: "MemberTypeId",
    values: {
        BASIC: { value: "basic" },
        BUSINESS: { value: "business" },
    },
});
