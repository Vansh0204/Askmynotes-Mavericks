"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.findUserById = exports.findUserByEmail = void 0;
// In-memory store — replace with a real DB (MongoDB/PostgreSQL) later
const users = [];
const findUserByEmail = (email) => users.find((u) => u.email.toLowerCase() === email.toLowerCase());
exports.findUserByEmail = findUserByEmail;
const findUserById = (id) => users.find((u) => u.id === id);
exports.findUserById = findUserById;
const createUser = (user) => {
    users.push(user);
    return user;
};
exports.createUser = createUser;
