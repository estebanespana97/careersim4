const api = require('./db');
const pg = require('pg')
const client = new pg.Client('postgres://localhost/careerSim4')
jest.mock('./db');

test('fetches all users', async () => {
    const users = [{
        username: 'john@example.com',
        password: 'password123'
    },
    {
        username: 'jane@example.com',
        password: 'password456'
    }];
    api.fetchUsers.mockResolvedValue(users); // mocking the try block that fetchUsers returns
    const response = await api.fetchUsers(client); // calling the function
    expect(response).toEqual(users); // checking if the data returned is the same as the data mocked
});

test('fetches all items', async () => {
    const items = [{
        name: 'foo',
        rating: 0
    },
    {
        name: 'bar',
        rating: 0
    }];
    api.fetchItems.mockResolvedValue(items); // mocking the try block that fetchProducts returns
    const response = await api.fetchItems(client); // calling the function
    expect(response).toEqual(items); // checking if the data returned is the same as the data mocked
});

test('createUser', async () => {
    const users = [{
        username: 'john@example.com',
        password: 'password123'
    }];
    api.createUser.mockResolvedValue(users); // mocking the try block that fetchUsers returns
    const response = await api.createUser(client); // calling the function
    expect(response).toEqual(users); // checking if the data returned is the same as the data mocked
});

test('createItem', async () => {
    const items = [{
        name: 'foo',
        rating: 0
    }];
    api.createItem.mockResolvedValue(items); // mocking the try block that fetchProducts returns
    const response = await api.createItem(client); // calling the function
    expect(response).toEqual(items); // checking if the data returned is the same as the data mocked
});