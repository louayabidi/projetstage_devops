const Joi = require('joi');

exports.signupSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  age: Joi.number().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  photo: Joi.string().allow(''),
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
      department: Joi.string().required()
    }).required(),
    otherwise: Joi.object().optional()
  })
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
	newPassword: Joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')),
	oldPassword: Joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')),
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
