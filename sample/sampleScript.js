const { validateRequest } = require('../index');

// Define the path to the rule set file
const ruleSetPath = './ruleSet.json';

// Our express request object.
let req = {
    method: 'POST',
    originalUrl: '/login',
    body: {
        username: 'test',
        password: 'test'
    },
    query: {}
}

// ValidateRequest middleware return an array of errors if any are found.
var errors = validateRequest(req, ruleSetPath);

for(var err of errors){
    throw new Error(err);
}

