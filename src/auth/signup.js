import { CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "./cognitoConfig";

export const signupUser = (email, password, name) =>
    new Promise((resolve, reject) => {
        userPool.signUp(
            email,
            password,
            [{ Name: "name", Value: name }],
            null,
            (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }
        );
    });

export const confirmUser = (email, code) =>
    new Promise((resolve, reject) => {
        const user = new CognitoUser({ Username: email, Pool: userPool });
        user.confirmRegistration(code, true, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
