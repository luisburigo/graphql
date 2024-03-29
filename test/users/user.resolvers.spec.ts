import * as jwt from 'jsonwebtoken'
import {app, chai, db, expect, handleError} from './../text-utils'
import {UserInstance} from "../../src/models/UserModel";
import {JWT_SECRET} from "../../src/utils";

describe('User', () => {

    let token: string;
    let userId: number;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => db.User.bulkCreate([
                {
                    name: 'Peter Quill',
                    email: 'peter@guardians.com',
                    password: '1234'
                },
                {
                    name: 'Gamora',
                    email: 'gamora@guardians.com',
                    password: '1234'
                },
                {
                    name: 'Groot',
                    email: 'groot@guardians.com',
                    password: '1234'
                }
            ])).then((users: UserInstance[]) => {
                userId = users[0].get('id');
                const payload = {sub: userId};
                token = jwt.sign(payload, JWT_SECRET);
            });
    });

    describe('Queries', () => {

        describe('application/json', () => {

            describe('users', () => {

                it('should return a list of users', () => {

                    const body = {
                        query: `
                            query{
                                users {
                                    name
                                    email
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const userList = res.body.data.users;
                            expect(res.body.data).to.be.an('object');
                            expect(userList).to.be.an('array');
                            expect(userList[0]).to.not.have.keys(['id', 'photo', 'createdAt', 'updatedAt', 'posts']);
                            expect(userList[0]).to.have.keys(['name', 'email'])
                        }).catch(handleError)
                });

                it('should paginate a list of users', () => {

                    const body = {
                        query: `
                            query getUsersList($first: Int, $offset: Int){
                                users(first: $first, offset: $offset){
                                    name
                                    email
                                    createdAt
                                }
                            }
                        `,
                        variables: {
                            firs: 2,
                            offset: 1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const userList = res.body.data.users;
                            expect(res.body.data).to.be.an('object');
                            expect(userList).to.be.an('array').of.length(2);
                            expect(userList[0]).to.not.have.keys(['id', 'photo', 'updatedAt', 'posts']);
                            expect(userList[0]).to.have.keys(['name', 'email', 'createdAt'])
                        }).catch(handleError)
                });

            });

            describe('user', () => {

                it('should return a single user', () => {

                    const body = {
                        query: `
                            query getUser($id: ID!){
                                user(id: $id){
                                    id
                                    name
                                    email
                                    posts {
                                        title
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.keys(['id', 'name', 'email', 'posts']);
                            expect(singleUser.name).to.equal('Peter Quill');
                            expect(singleUser.email).to.equal('peter@guardians.com');
                        }).catch(handleError)
                });

                it('should return only \'name\' attribute', () => {

                    const body = {
                        query: `
                            query getUser($id: ID!){
                                user(id: $id){
                                    name
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singleUser = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.key('name');
                            expect(singleUser.name).to.equal('Peter Quill');
                            expect(singleUser.email).to.be.undefined;
                        }).catch(handleError)
                });

                it('should return an error if user not exist', () => {

                    const body = {
                        query: `
                            query getUser($id: ID!){
                                user(id: $id){
                                    name
                                }
                            }
                        `,
                        variables: {
                            id: -1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data.user).to.be.null;
                            expect(res.body.errors).to.be.an('array');
                            expect(res.body).to.have.keys(['data', 'errors']);
                            expect(res.body.errors[0].message).to.equal('Error: User with id -1 not found!')
                        }).catch(handleError)
                });

            })

        })

    });

    describe('Mutations', () => {

        describe('application/json', () => {

            describe('createUser', () => {

                it('should create new User', () => {

                    const body = {
                        query: `
                            mutation createNewUser($input: UserCreateInput!){
                                createUser(input: $input){
                                    id
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Drax',
                                email: 'drax@guardians.com',
                                password: '1234'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {

                            const createdUser = res.body.data.createUser;

                            expect(createdUser).to.be.an('object');
                            expect(createdUser.name).to.equal('Drax');
                            expect(createdUser.email).to.equal('drax@guardians.com');
                            expect(parseInt(createdUser.id)).to.be.an('number');

                        }).catch(handleError)
                });

            });

            describe('updateUser', () => {

                it('should update an existing User', () => {

                    const body = {
                        query: `
                            mutation updateExistingUser($input: UserUpdateInput!){
                                updateUser(input: $input){
                                    name
                                    email
                                    photo
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Star Lord',
                                email: 'peter@guardians.com',
                                photo: 'photo'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {

                            const updatedUser = res.body.data.updateUser;

                            expect(updatedUser).to.be.an('object');
                            expect(updatedUser.name).to.equal('Star Lord');
                            expect(updatedUser.email).to.equal('peter@guardians.com');
                            expect(updatedUser.photo).to.not.be.null;
                            expect(updatedUser.id).to.be.undefined;

                        }).catch(handleError)
                });

                it('should block operation if token is invalid', () => {

                    const body = {
                        query: `
                            mutation updateExistingUser($input: UserUpdateInput!){
                                updateUser(input: $input){
                                    name
                                    email
                                    photo
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Star Lord',
                                email: 'peter@guardians.com',
                                photo: 'photo'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer testeinvalid`)
                        .send(JSON.stringify(body))
                        .then(res => {

                            expect(res.body.data.updateUser).to.be.null;
                            expect(res.body).to.have.keys(['data', 'errors']);
                            expect(res.body.errors).to.be.an('array');
                            expect(res.body.errors[0].message).to.equal('JsonWebTokenError: jwt malformed');

                        }).catch(handleError)
                });
            });

            describe('updateUserPassword', () => {

                it('should update the password of an existing User', () => {

                    const body = {
                        query: `
                            mutation updateUserPassword($input: UserUpdatePasswordInput!){
                                updateUserPassword(input: $input)
                            }
                        `,
                        variables: {
                            input: {
                                password: 'teste123'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {

                            expect(res.body.data.updateUserPassword).to.be.true;

                        }).catch(handleError)
                });

            })

            describe('deleteUser', () => {

                it('should delete an existing User', () => {

                    const body = {
                        query: `
                            mutation {
                                deleteUser
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {

                            expect(res.body.data.deleteUser).to.be.true;

                        }).catch(handleError)
                });

            })

        })

    })

});
