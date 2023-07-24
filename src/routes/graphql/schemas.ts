import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLBoolean, GraphQLSchema, GraphQLNonNull } from 'graphql';
import { UserType, PostType, MemberType, MemberTypeId, ProfileType, SubscriptionsType, UUIDType } from "./types/index.types.js";
import { Type } from '@fastify/type-provider-typebox';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve: async (parent, args, { prisma } ) => {
                const users = await prisma.user.findMany();
                return users;
            },
        },
        user: {
            type: UserType,
            args: {
                id: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma }) => {
                const { id } = args;
                const user = await prisma.user.findUnique({ where: { id: id }});
                return user || null;
            },
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve: async (parent, args, { prisma }) => {
                const posts = await prisma.post.findMany();
                return posts;
            },
        },
        post: {
            type: PostType,
            args: {
                id: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma }) => {
                const { id } = args;
                const post = await prisma.post.findUnique({ where: { id: id }});
                return post || null;
            },
        },
        profiles: {
            type: new GraphQLList(ProfileType),
            resolve: async (parent, args, { prisma }) => {
                const profiles = await prisma.profile.findMany();
                return profiles;
            },
        },
        profile: {
            type: ProfileType,
            args: {
                id: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma }) => {
                const { id } = args;
                const profile = await prisma.profile.findUnique({ where: { id: id }});
                return profile || null;
            },
        },
        getProfileByUserId: {
            type: ProfileType,
            args: {
                userId: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma }) => {
                const { userId } = args;
                const profile = prisma.profile.findUnique({ where: { userId: userId }});
                return profile || null;
            },
        },
        memberTypes: {
            type: new GraphQLList(MemberType),
            resolve: async (parent, args, { prisma }) => {
                const memberTypes = await prisma.memberType.findMany();
                return memberTypes;
            },
        },
        memberType: {
            type: MemberType,
            args: {
                id: { type: MemberTypeId },
            },
            resolve: async (parent, args, { prisma }) => {
                const { id } = args;
                const memberType = await prisma.memberType.findUnique({ where: { id: id }});
                return memberType || null;
            },
        },
        /*prismaStats: {
            type: PrismaStatsType,
            resolve: async (fastify) => {
                const prismaStats = await fastify.prismaStats
                return { operationHistory: prismaStats } || null;
            },
        }, */
        getPostByUserId: {
            type: new GraphQLList(PostType),
            args: {
                userId: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma }) => {
                const { userId } = args;
                const post = await prisma.post.findMany({ where: { authorId: userId }});
                return post || null;
            },
        },
        userSubscribedTo: {
            type: new GraphQLList(UserType),
            args: {
                id: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma } ) => {
                const { id } = args;
                const subscriptions = await prisma.subscribersOnAuthors.findMany({ where: { subscriberId: id }});
                if (subscriptions.length === 0) {
                    return null;
                }
                const authorIds = subscriptions.map((subscription) => subscription.authorId);
                return prisma.user.findMany({ where: { id: { in: authorIds}}});
            }},
        subscribedToUser: {
            type: new GraphQLList(UserType),
            args: {
                id: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma } ) => {
                const { id } = args;
                const subscriptions = await prisma.subscribersOnAuthors.findMany({ where: { authorId: id }});
                if (subscriptions.length === 0) {
                    return null;
                }
                const subscribersIds = subscriptions.map((subscription) => subscription.subscriberId);
                return prisma.user.findMany({ where: { id: { in: subscribersIds}}});
            }},

    },
});


const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createUser: {
            type: UserType,
            resolve: async (parent, args,  { prisma }) => {
                const { dto } = args;
                const newUser = await prisma.user.create({
                    data: dto,
                });
                return newUser;
            },
        },
        updateUser: {
            type: UserType,
            args: {
                userId: { type: UUIDType },
                name: { type: new GraphQLNonNull(GraphQLString) },
                balance: { type: new GraphQLNonNull(GraphQLInt) },

            },
            resolve: async (parent, args, { prisma } ) => {
                const { userId, name, balance } = args;
                const user = await prisma.user.update({
                    where: { id: userId } , data: { name, balance }});

                if (!user) {
                    return null
                }
                return null;
            },
        },
        deleteUserById: {
            type: UserType,
            args: {
                userId: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma } ) => {
                const { userId } = args;
                const user = await prisma.user.findUnique({
                    where: { id: userId } });

                if (!user) {
                    return null
                }
                await prisma.user.delete({ where: { id: userId } });
                return null;
            },
        },
        createPost: {
            type: PostType,
            args: {
                title: { type: new GraphQLNonNull(GraphQLString) },
                content: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma } ) => {
                const { title, content, authorId } = args;
                const newPost = await prisma.post.create({
                    data: { title, content, authorId },
                });
                return newPost;
            },
        },
        updatePostById: {
            type: PostType,
            args: {
                postId: { type: UUIDType },
                title: { type: new GraphQLNonNull(GraphQLString) },
                content: { type: new GraphQLNonNull(GraphQLString) },

            },
            resolve: async (parent, args, { prisma } ) => {
                const { postId, title, content } = args;
                const post = await prisma.post.update({
                    where: { id: postId } , data: { title, content }});
                if (!post) {
                    return null
                }
                return null;
            },
        },
        deletePostById: {
            type: PostType,
            args: {
                postId: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma } ) => {
                const { postId } = args;
                const post = await prisma.post.findUnique({
                    where: { id: postId } });

                if (!post) {
                    return null
                }
                await prisma.post.delete({ where: { id: postId } });
                return null;
            },
        },
        createProfile: {
            type: ProfileType,
            args: {
                isMale: { type: GraphQLBoolean },
                yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
                memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
                userId: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma } ) => {
                const { isMale, yearOfBirth, memberTypeId, userId } = args;
                const newProfile = await prisma.profile.create({
                    dto: { isMale, yearOfBirth, memberTypeId, userId },
                });
                return newProfile;
            },
        },
        updateProfileById: {
            type: ProfileType,
            args: {
                profileId: { type: UUIDType },
                isMale: { type: GraphQLBoolean },
                yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
                memberTypeId: { type: new GraphQLNonNull(GraphQLString) },

            },
            resolve: async (parent, args, { prisma } ) => {
                const { profileId, isMale, yearOfBirth, memberTypeId } = args;
                const profile = await prisma.profile.update({
                    where: { id: profileId } , data: { isMale, yearOfBirth, memberTypeId }});
                if (!profile) {
                    return null
                }
                return null;
            },
        },
        deleteProfileById: {
            type: ProfileType,
            args: {
                profileId: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma } ) => {
                const { profileId } = args;
                const profile = await prisma.profile.findUnique({
                    where: { id: profileId } });

                if (!profile) {
                    return null
                }
                await prisma.profile.delete({ where: { id: profileId } });
                return null;
            },
        },

        subscribeTo: {
            type: UserType,
            args: {
                userId: { type: UUIDType },
                authorId: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma } ) => {
                const { userId, authorId } = args;
                const user = await prisma.user.findUnique({ where: { id: userId }});
                const author = await prisma.user.findUnique({ where: { id: authorId }});
                if (!user || !author) {
                    return null;
                }
                /*const existingSubscription = await prisma.subscribersOnAuthors.findUnique({
                    where: { authorId_subscriberId: { authorId, userId } },
                });

                if (existingSubscription) {
                    return null;
                }*/
                const subscription = await prisma.subscribersOnAuthors.create({
                    data: {
                        authorId: authorId,
                        subscriberId: userId,
                    },
                });
                return author;
            }

        },
        deleteSubscription: {
            type: UserType,
            args: {
                userId: { type: UUIDType },
                authorId: { type: UUIDType },
            },
            resolve: async (parent, args, { prisma }) => {
                const { userId, authorId } = args;

                await prisma.subscribersOnAuthors.deleteMany({
                    where: { AND: [{ subscriberId: userId }, { authorId: authorId }] },
                });

                return null;
            },
        },
    },
});

export const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});

