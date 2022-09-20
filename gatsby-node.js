const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const camelcaseKeys = require('camelcase-keys');

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type RecruiteeOffer implements Node {
        id: ID!
        title: String!
        employmentTypeCode: String!
        slug: String!
        careersUrl: String!
        careersApplyUrl: String!
        position: Int!
    }
  `)
}

exports.sourceNodes = async ({ actions }, { companyName, department, tag }) => {
  const { createNode } = actions;

  if (!companyName) {
    console.log(
      "Error in gatsby-source-recruitee plugin: 'companyName' not found. Make sure add it in the gatsby-config.js."
    );
    return;
  }
  const resp = await fetch(`https://${companyName}.recruitee.com/api/offers/?${new URLSearchParams({
    ...(department && { department }),
    ...(tag && { tag }),
  })}`);

  const data = await resp.json();

  data.offers.forEach(offer =>
    createNode({
      ...camelcaseKeys(offer, { deep: true }),

      id: `recruitee-${offer.id}`,
      parent: null,
      children: [],
      internal: {
        type: `RecruiteeOffer`,
        contentDigest: "Job offer published by recruitee"
      }
    })
  );
  return;
};
