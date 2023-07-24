import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString, GraphQLNonNull } from "graphql";
import { UUIDType } from "./uuid.js";
import { ProfileType } from "./profile.js";
import { PostType } from "./post.js";

export const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
        profile: {
            type: ProfileType,
            resolve: async (parent, args, { prisma }) => {
                const { id } = parent;
                const profile = await prisma.profile.findUnique({ where: { userId: id }});
                return profile || null;
            },
        },
        posts: {
            type: PostType,
            resolve: async (parent, args, { prisma }) => {
                const { id } = parent;
                const post = await prisma.post.findUnique({ where: { id: id }});
                return post || null;
            },
        },
        userSubscribedTo: {
            type: new GraphQLList(UserType),
            resolve: async (parent, args, { prisma } ) => {
                const { id } = parent;
                const subscriptions = await prisma.subscribersOnAuthors.findMany({ where: { subscriberId: id }});
                if (subscriptions.length === 0) {
                    return null;
                }
                const authorIds = subscriptions.map((subscription) => subscription.authorId);
                return prisma.user.findMany({ where: { id: { in: authorIds}}}) || null;
            }

        },
        subscribedToUser: {
            type: new GraphQLList(UserType),
            resolve: async (parent, args, { prisma } ) => {
                const { id } = parent;
                const subscriptions = await prisma.subscribersOnAuthors.findMany({ where: { authorId: id }});
                if (subscriptions.length === 0) {
                    return null;
                }
                const subscriberIds = subscriptions.map((subscription) => subscription.subscriberId);
                return prisma.user.findMany({ where: { id: { in: subscriberIds}}}) || null;
            }
        },
    }),
});