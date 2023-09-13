import logger from "../../utils/logger";
import { getCommonAPIResponseByData, getCommonAPIResponseByError, getNewGuid } from "../../utils/commonUtils";
import { deleteDoc, insertDoc, queryDoc, scanDocs, updateDoc } from "../../utils/dynamoDB";
import { DeleteFileFromS3, uploadFileToS3 } from "../../utils/s3";
import { DeleteInput, UpdateInput, UpdateUserImage, UserInput, UserInputDoc } from "./interface";
import { loginInput } from "../authentication/interface";

export const createUser = async (input: UserInput): Promise<any> => {
    try {
        const userId = getNewGuid();
        const userInput: UserInputDoc = {
            userId: userId,
            userName: input.userName,
            userEmail: input.userEmail,
            userAddress: input.userAddress,
            userPhone: input.userPhone,
            userPassword: input.userPassword
        }

        const params = {
            TableName: process.env.USERS_TABLE,
            Item: userInput
        }
        const data = await insertDoc(params);
        logger.info(data);

        return getCommonAPIResponseByData({ success: true });
    } catch (err) {
        throw getCommonAPIResponseByError(err);
    }
}


export const getUsers = async (): Promise<any> => {
    try {
        const params = {
            tableName: process.env.USERS_TABLE
        }

        const data = await scanDocs(params.tableName, {});
        logger.info(data);

        return getCommonAPIResponseByData(data);
    } catch (err) {
        console.error(err);
        throw getCommonAPIResponseByError(err);
    }
}

export const getUserByEmailAndPwd = async (input: loginInput) => {
    try {
        const params = {
            tableName: process.env.USERS_TABLE,
        }

        const data = await scanDocs(params.tableName, {
            FilterExpression: "userEmail = :userEmail and userPassword = :userPassword",
            ExpressionAttributeValues: {
                ":userEmail": input.userEmail,
                ":userPassword": input.userPassword
            }
        });
        return getCommonAPIResponseByData(data);
    } catch (err) {

    }
}

export const queryUserFromDB = async (input: object): Promise<any> => {
    try {
        const params = {
            TableName: process.env.USERS_TABLE,
            KeyConditionExpression: "userEmail == :key and userPassword == :key2",
            ExpressionAttributeValues: {
                ":key": {
                    "S": input['email']
                },
                ":key2": {
                    "S": input['password']
                }
            }
        }

        const data = await queryDoc(params);

        return getCommonAPIResponseByData(data);
    } catch (err) {
        console.error(err);
        throw getCommonAPIResponseByError(err);
    }
}

export const updateUser = async (input: UpdateInput) => {
    try {
        const params = {
            TableName: process.env.USERS_TABLE,//common place for tablename
            primaryKey: {
                userId: input.userId
            },
            updateKey: {
                userName: input.userName,
                userAddress: input.userAddress,
            }
        }

        const data = await updateDoc(params);

        return getCommonAPIResponseByData(data);
    } catch (err) {
        console.error(err);
        throw getCommonAPIResponseByError(err);
    }
}


export const deleteUser = async (input: DeleteInput) => {
    try {
        const params = {
            TableName: process.env.USERS_TABLE,
            Key: {
                userId: input.userId

            }
        }

        const data = await deleteDoc(params);

        return getCommonAPIResponseByData(data);
    } catch (error) {
        return error;
    }
}

export const updateUserImage = async (input: UpdateUserImage) => {
    try {

        const userImageName = getNewGuid();

        const resp = await uploadFileToS3({
            bucketName: process.env.MEDIA_BUCKET,
            fileName: userImageName,
            fileContent: input.userImage,
            type: 'image/jpeg',
            fileEncoding: 'base64'
        });
        console.log(resp);
        if (resp) {
            const params = {
                TableName: process.env.USERS_TABLE,
                primaryKey: {
                    userId: input.userId
                },
                updateKey: {
                    userImage: userImageName
                }
            }

            const data = await updateDoc(params);
            console.log(data);
        }
        return getCommonAPIResponseByData({
            success: true,
        });
    } catch (err) {
        getCommonAPIResponseByError(err);
    }
}


export const updateUserFile = async (input) => {
    try {
        const userFileName = getNewGuid();
        const resp = await uploadFileToS3({
            bucketName: process.env.MEDIA_BUCKET,
            fileName: userFileName,
            fileContent: input.files.userFile.data,
            type: input.files.userFile.mimetype,
        });

        console.log(resp);
        // if(resp) {
        //     const params = {
        //         TableName: process.env.USERS_TABLE,
        //         primaryKey: {
        //             userId: input.body.userId
        //         },
        //         updateKey: {
        //             userFile: userFileName
        //         }
        //     }

        //     const data = await updateDoc(params);
        //     console.log(data);
        // }
        return getCommonAPIResponseByData({
            success: true,
        });
    } catch (err) {
        getCommonAPIResponseByError(err);
    }
}

export const deleteUserFile = async (input) => {
    try {

        const resp = await DeleteFileFromS3(process.env.MEDIA_BUCKET, input.userFile);

        console.log(resp);

        // if(resp) {
        //     const params = {
        //         TableName: process.env.USERS_TABLE1,
        //         primaryKey: {
        //             userId: input.userId
        //         },
        //         updateKey: {
        //             userFile: null
        //         }
        //     }

        //     const data = await updateDoc(params);
        //     console.log(data);
        // }


        return getCommonAPIResponseByData({ success: true });
    } catch (err) {
        getCommonAPIResponseByError(err);
    }
}


export const getUser = async (input) => {
    try {

        const data = await scanDocs(process.env.userTable, { Key: { userId: input.userId } });
        
        return getCommonAPIResponseByData(data);
    } catch (err) {
        getCommonAPIResponseByError(err);
    }
}