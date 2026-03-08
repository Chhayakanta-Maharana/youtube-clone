import {
    CognitoUser,
    AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { userPool } from "./cognitoConfig";

export const loginUser = (email, password) =>
    new Promise((resolve, reject) => {
        const user = new CognitoUser({ Username: email, Pool: userPool });
        const auth = new AuthenticationDetails({
            Username: email,
            Password: password,
        });

        user.authenticateUser(auth, {
            onSuccess: (result) => {
                localStorage.setItem("idToken", result.getIdToken().getJwtToken());
                resolve(result);
            },
            onFailure: reject,
        });
    });
