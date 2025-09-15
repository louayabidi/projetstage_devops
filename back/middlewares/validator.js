const Joi = require('joi');

exports.signupSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  age: Joi.number().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  photo: Joi.string().allow(''), // Optional, can be empty string
  role: Joi.string().valid('passenger', 'boat_owner', 'admin').required(),
  boatInfo: Joi.when('role', {
    is: 'boat_owner',
    then: Joi.object({
      boatLicense: Joi.string().required(),
      boatType: Joi.string().required(),
      boatCapacity: Joi.number().required(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
  adminInfo: Joi.when('role', {
    is: 'admin',
    then: Joi.object({
      adminId: Joi.string().required(),
      department: Joi.string().required(),
    }).required(),
    otherwise: Joi.object().optional(),
  }),
});


exports.signinSchema = Joi.object({
	email: Joi.string()
		.min(6)
		.max(60)
		.required()
		.email({
			tlds: { allow: ['com', 'net', 'tn'] },
		}),
	password: Joi.string()
		.required()
		//.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')),
});

exports.acceptCodeSchema = Joi.object({
	email: Joi.string()
		.min(6)
		.max(60)
		.required()
		.email({
			tlds: { allow: ['com', 'net', 'tn'] },
		}),
	providedCode: Joi.number().required(),
});

exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(8).required().messages({
    "string.empty": "Old password is required",
    "string.min": "Old password must be at least 8 characters long",
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .required()
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 8 characters long",
      "string.pattern.base":
        "New password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

exports.acceptFPCodeSchema = Joi.object({
	email: Joi.string()
		.min(6)
		.max(60)
		.required()
		.email({
			tlds: { allow: ['com', 'net', 'tn'] },
		}),
	providedCode: Joi.number().required(),
	newPassword: Joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')),
});
