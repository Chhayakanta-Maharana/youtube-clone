import { CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "./cognitoConfig";

export const requestPasswordReset = (email) => {
    return new Promise((resolve, reject) => {
        const user = new CognitoUser({ Username: email, Pool: userPool });
        user.forgotPassword({
            onSuccess: (data) => resolve(data),
            onFailure: (err) => reject(err),
            inputVerificationCode: (data) => resolve(data), // Required if confirmation needed
        });
    });
};

export const confirmPasswordReset = (email, code, newPassword) => {
    return new Promise((resolve, reject) => {
        const user = new CognitoUser({ Username: email, Pool: userPool });
        user.confirmPassword(code, newPassword, {
            onSuccess: () => resolve(),
            onFailure: (err) => reject(err),
        });
    });
};
