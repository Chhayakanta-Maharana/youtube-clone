import { CognitoUserPool } from "amazon-cognito-identity-js";

export const userPool = new CognitoUserPool({
    UserPoolId: "us-east-1_7Vq8YIwUd",
    ClientId: "3h81lsjkv1iuicshceao7c8v2p",
});
