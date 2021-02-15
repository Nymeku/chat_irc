const users = [];

const getAllUsers = () => {
    return users;
}

const addUser = ({id, name, room}) => {
    name = name;
    room = room;

    const existingUser = users.find((user) =>  user.name === name);

    if (name === "Admin")
        return {error : "You can't be Admin"};
    if (existingUser){
        return {error : 'This name is already taken'};
    }

    const user = {id, name, room};

    users.push(user);

    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom, getAllUsers};