const userTypes = `
    
    # Definição do tipo user
    type User {
        id: ID!
        name: String!
        photo: String
        email: String!
        createdAt: String!
        updatedAt: String!
        posts(first: Int, offset: Int): [ Post! ]!
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
    users(first: Int, offset: Int): [ User! ]!
    user(id: ID!): User
    currentUser: User
`

const userMutations = `
    createUser(input: UserCreateInput!): User
    updateUser(input: UserUpdateInput): User
    updateUserPassword(input: UserUpdatePasswordInput!): Boolean
    deleteUser: Boolean
`

export {
    userMutations,
    userQueries,
    userTypes
}
