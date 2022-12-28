const fs = require('fs');

const validateRequest = (req, ruleSetFilePath, next) => {
    let errors = applyValidation(req, getValidationRuleSet(req, ruleSetFilePath));

    if(errors && errors.length > 0) {
        throw new Error(errors.join('. \n'));
    }

    next();
}

const getValidationRuleSet = (req, ruleSetFilePath) => {
    let ruleSet = JSON.parse(fs.readFileSync(ruleSetFilePath));
    console.log(ruleSet);
    let validation = ruleSet.find((ruleSet) => {
        return ruleSet.method === req.method && ruleSet.endpoint === req.originalUrl;
    });

    if (!validation) {
        throw new Error('Validation Rule Set not found');
    }

    return validation;
}

const applyValidation = (req, validationRuleSet) => {
    let errors = [];
    if (validationRuleSet.body) {
        errors.concat(validateBody(req, validationRuleSet.body, errors));
    }

    if (validationRuleSet.query) {
        errors.concat(validateQuery(req, validationRuleSet.query, errors));
    }

    return errors;
}

const validateBody = (req, bodyValidationRuleSet, errors) => {
    bodyValidationRuleSet.forEach((rule) => {
        if (rule.required && !req.body[rule.name]) {
            errors.push(`${rule.name} is required`);
            return;
        }

        if (rule.type && typeof req.body[rule.name] !== rule.type) {
            errors.push(`${rule.name} must be of type ${rule.type}`);
            return;
        }

        if (rule.minLength && req.body[rule.name].length < rule.minLength) {
            errors.push(`${rule.name} must be at least ${rule.minLength} characters`);
        }

        if (rule.maxLength && req.body[rule.name].length > rule.maxLength) {
            errors.push(`${rule.name} must be at most ${rule.maxLength} characters`);
        }

        if (rule.regex && !new RegExp(rule.regex).test(req.body[rule.name])) {
            errors.push(`${rule.name} must match the regex ${rule.regex}`);
        }
    });

    return errors;
}

const validateQuery = (req, queryValidationRuleSet, errors) => {
    queryValidationRuleSet.forEach((rule) => {
        if (rule.required && !req.query[rule.name]) {
            errors.push(`${rule.name} is required`);
            return;
        }

        if (rule.type && typeof req.query[rule.name] !== rule.type) {
            errors.push(`${rule.name} must be of type ${rule.type}`);
            return;
        }

        if (rule.minLength && req.query[rule.name].length < rule.minLength) {
            errors.push(`${rule.name} must be at least ${rule.minLength} characters`);
        }
        
        if (rule.maxLength && req.query[rule.name].length > rule.maxLength) {
            errors.push(`${rule.name} must be at most ${rule.maxLength} characters`);
        }

        if (rule.regex && !rule.regex.test(req.query[rule.name])) {
            errors.push(`${rule.name} must match the regex ${rule.regex}`);
        }
    });

    return errors;
}

module.exports = {
    validateRequest
}