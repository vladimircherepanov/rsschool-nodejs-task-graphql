import {GraphQLInt, GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLNonNull} from "graphql";
import { UUIDType } from "./uuid.js";
import { MemberType } from "./member.js";
import { MemberTypeId } from "./memberId.js";

export const  ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        userId: { type: new GraphQLNonNull(UUIDType) },
        memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
        memberType: {
            type: MemberType,
            resolve: async (parent, args, { prisma }) => {
                const { memberTypeId } = parent;
                const memberType = await prisma.memberType.findUnique({ where: { id: memberTypeId }});
                return memberType || null;
            },
        }

    }),
});