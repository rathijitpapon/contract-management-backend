const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || 'defaultsecret';

const generateAuthResponse = (principalId: string, effect: string, methodArn: string) => {
  const policyDocument = generatePolicyDocument(effect, methodArn);

  return {
    principalId,
    policyDocument
  };
}

const generatePolicyDocument = (effect: string, methodArn: string) => {
  if (!effect || !methodArn) return null;

  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: methodArn
      }
    ]
  };

  return policyDocument;
}

export const verifyToken = (event: any, context: any, callback: any) => {
  const token = event.authorizationToken.replace("Bearer ", "");
  const methodArn = event.methodArn;

  if (!token || !methodArn) return callback(null, "Unauthorized");

  const decoded = jwt.verify(token, jwtSecret);

  if (decoded && decoded.id) {
    return callback(null, generateAuthResponse(decoded.id, "Allow", methodArn));
  } else {
    return callback(null, generateAuthResponse(decoded.id, "Deny", methodArn));
  }
};