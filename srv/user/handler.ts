import 'reflect-metadata';
import { UserController } from './controller';

export const createUser = UserController.createUser;
export const findUsers = UserController.findUsers;
export const findUser = UserController.findUser;
export const updateUser = UserController.updateUser;
export const deleteUser = UserController.deleteUser;
