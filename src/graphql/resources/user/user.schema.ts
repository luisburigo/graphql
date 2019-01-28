const userTypes = `
    
    # Definição do tipo user
    type User {
        id: ID!
        name: String!
        photo: String
        createdAt: String!
        updatedAt: String!
    }
    
    input UserCreateInput {
        name: String!
        email: String!
        password: String!
    }
    
    input UserUpdateInput {
        name: String!
        email: String!
        photo: String!
    }
    
    input UserUpdatePasswordInput {
        password: String!
    }
    
`;

const userQueries = `
    users(first: Int!, offset: Int!): [ User! ]!
    user(id: ID!): User
`

const userMutations = `
    createUser(input: UserCreateInput!): User
    updateUser(id: Int!, input: UserUpdateInput): User
    updateUserPassword(id: ID!, input: UserUpdatePasswordInput!): Boolean
    deleteUser(id: ID!): Boolean
`

export {
    userMutations,
    userQueries,
    userTypes
}
