import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { FastifyRequest } from 'fastify';
import { schema, createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';

interface GqlRequestBody {
  query: string;
  variables?: Record<string, any>;
}

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req: FastifyRequest<{ Body: GqlRequestBody }>) {
      const { query, variables } = req.body;

      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: { fastify: fastify, prisma: fastify.prisma },
      });

      return result;
    },
  });
};

export default plugin;
