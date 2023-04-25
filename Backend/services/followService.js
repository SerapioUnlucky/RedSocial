const Follow = require('../models/followModel')

const followUserIds = async (identityUserId) => {

    try {

        // Sacar informacion de seguimiento
        let following = await Follow.find({user: identityUserId}).select({"followed": 1, "_id": 0});

        let followers = await Follow.find({followed: identityUserId}).select({"user": 1, "_id": 0});

        // Procesar array de identificadores
        let followingClean = [];

        following.forEach((follow) => {

            followingClean.push(follow.followed);

        });

        let followersClean = [];

        followers.forEach((follow) => {

            followersClean.push(follow.user);

        });

        return {
            following: followingClean,
            followers: followersClean
        }
        
    } catch (error) {

        return {};
        
    }

}

const followThisUser = async (identityUserId, profileUserId) => {

    try {

        // Sacar informacion de seguimiento
        let following = await Follow.findOne({user: identityUserId, followed: profileUserId});

        let follower = await Follow.findOne({followed: identityUserId, user: profileUserId});
        
        return {
            following,
            follower
        }

    } catch (error) {

        return {};
        
    }

}

module.exports = {
    followUserIds,
    followThisUser
}
