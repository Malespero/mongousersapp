const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const token = jwt.sign({ sub: user.id, isAdmin: user.isAdmin }, config.secret, { expiresIn: '7d' });
        return {
            ...user.toJSON(),
            token
        };
    }
}

async function getAll(user) {
    console.log(user)
    if(user.isAdmin === true)
    {
        return await User.find();
    }else
    {
        throw 'Only admin users can see all users';
    }
}

async function getById(id, user) {
    console.log(id);
    console.log(user);
    if(user.isAdmin === true || user.sub === id) {
        return await User.findById(id);
    }
    else{
        throw 'You are not allowed to do that';
    }
    
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam, user) {
    if(user.sub === id){
        const user = await User.findById(id);

        // validate
        if (!user) throw 'User not found';
        if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
            throw 'Username "' + userParam.username + '" is already taken';
        }

        // hash password if it was entered
        if (userParam.password) {
            userParam.hash = bcrypt.hashSync(userParam.password, 10);
        }

        // copy userParam properties to user
        Object.assign(user, userParam);

        await user.save();
        throw 'You are updated';
    }
    else
    {
        throw 'You can only change yourself';
    }

    
    
}

async function _delete(id, user) {
    if(user.isAdmin === true || user.sub === id) {
        await User.findByIdAndRemove(id);
        throw 'User ' + id + ' has been deleted'
    }
    else{
        throw 'You are not allowed to do that';
    }

    
}