(function(window, $, undefined) {
	/**
	 * Rules for validation
	 * Return object of functions for get, add or modify rules
	 * 
	 * @constructor
	 * @param {ValidateOptions} Config
	 * @return {Object} Methods
	 */
	var ValidationRules = function (Config) {
		var form = this;
		Config.setOption('rules', $.extend({
			'required': {
				'check': function() {
					var isNotEmpty = $.trim($(this).val()) != "";
					return isNotEmpty;
				},
			
				message: 'Трябва да попълните всички полета'
			}
		}, Config.getOption('rules')));
		return {
			/**
			 * Returns object of rule
			 *
			 * @method getRule
			 * @param {String} ruleName
			 * @return {Object}
			 */
			getRule: function(ruleName) {
				var rules = Config.getOption('rules');
				return rules[ruleName];
			},
			
			/**
			 * Add or replace rule
			 *
			 * @method setRule
			 * @param {String} ruleName
			 * @param {Object} ruleData
			 * @return {Object} Current form
			 */
			setRule: function(ruleName, ruleData) {
				var rules =  Config.getOption('rules');
				rules[ruleName] = ruleData;
				Config.setOption('rules', rules);
				return this;
			},
			
			/**
			 * Returns object of custom or all rules
			 *
			 * @method getRules
			 * @param {String[]} ruleNames OPTIONAL
			 * @return {Object} Custom rules
			 */
			getRules: function(ruleNames) {
				var rules = Config.getOption('rules');
				if (typeof ruleNames  == "undefined") return rules;
				var returnRules = {};
				$.each(ruleNames, function(index, ruleName) {
					returnRules[ruleName] = rules[ruleName];
				});
				
				return returnRules;
			},
			
			/**
			 * Add or Replace rules
			 *
			 * @method setRules
			 * @param {String[]} ruleData OPTIONAL 
			 * @return {Object} Form
			 */
			setRules: function(ruleData) {
				var rules =  Config.getOption('rules');
				$.each(ruleData, function(ruleName, ruleData) {
					rules[ruleName] = ruleData;
				});
				Config.setOption('rules', rules);
			}
		}
	};
	
	/**
	 * Fields validation
	 * Return Methods for validate, add or modify fields
	 * 
	 * @constructor
	 * @param {ValidateOptions} Config
	 * @param {ValidationRules} Rules
	 * @return {Object} Methods
	 */
	var Fields = function(Config, Rules) {
		var form = this;
		var defaults = {
				'rules'         : [],
				'auto'          : false,
				'validateBind'  : 'blur',
				'resetErrorBind': 'click focus',
				'success'       : function() {},
				'messagePlace'  : false,
				'messages'      : {}
		};
		
		/**
		 * Create place for error messages
		 *
		 * @param {String} field name
		 * @return {String} field id (type CSS)
		 */
		var createErrorPlace = function (fieldName) {
				var optionNames = ['errorPlacePrefix', 'errorCSS', 'messagesPlace'];
				var options     = Config.getOptions(optionNames);
				
				var fieldID = options.errorPlacePrefix;
				fieldID    += fieldName;
				
				var msgParagraph = document.createElement('p');
				msgParagraph.setAttribute('id', fieldID);
				$(msgParagraph).css(options.errorCSS).appendTo(options.messagesPlace).hide();
				return '#' + fieldID;
			}
		/**
		 * Binds functions for validation, before submit
		 *
		 * @param {Object} options
		 * @param {String} fieldName
		 * @return {String} field id (type CSS)
		 */
		var autoValidate = function(options, fieldName) {
			var form = this;		
			$('[name="'+fieldName+'"]', form).bind(options.validateBind, function() {
				//validate Data
				$(options.messagePlace).empty().hide();
				var isValid = $(form).validator('fields', 'validate', fieldName, options.messagePlace);
				if (isValid) {
					options.success.call(this);
				}
			}).bind(options.resetErrorBind, function() {
				$(options.messagePlace).empty().hide();
			});
		};
		
		var Methods = {
			/**
			 * Add a field in the list for validation
			 *
			 * @method addField
			 * @param {String} fieldName
			 * @param {Object} fieldOptions Options for current field
			 * @return {Object} Current form
			 */
			addField: function (fieldName, fieldOptions) {
					if (fieldName) {
					
						//configure field options
						fieldOptions = $.extend(defaults, fieldOptions);
						if (!fieldOptions.messagePlace) {
							fieldOptions.messagePlace = createErrorPlace(fieldName);
						}
						
						//save options
						var fields        = Config.getOption('fields');
						$.extemd(fields, {fieldName: fieldOptions});
						var rules         = Config.setOption('fields', fields);

						
						//if no submit validation
						if (fieldOptions.auto) {
							autoValidate.call(this, fieldOptions, fieldName);
						}
					}
					
				return this;
			},
			
			/**
			 * Adding fields to the list for validation
			 *
			 * @method addFields
			 * @param {Object} fieldData fields and their options
			 * @return {Object} Current form
			 */
			addFields: function(fieldData) {
				var form = this;
				if (fieldData) {
					var fields = Config.getOption('fields');
					
					for (var fieldName in fieldData)
					{
					
							//get validation rules for currect field
							var fieldOptions = $.extend(defaults, fieldData[fieldName]);
							if (!fieldOptions.messagePlace) {
								fieldOptions.messagePlace = createErrorPlace(fieldName);
							}
							
							//If no submit validation
							$.extend(fields, {fieldName: fieldOptions});
							if (fieldOptions.auto) {
								autoValidate.call(form, fieldOptions, fieldName);
							}
					}
					Config.setOption('fields', fields);
				}
				return this;
			},
			
			/**
			 * Remove field on this validation
			 *
			 * @method removeField
			 * @param {String} fieldName
			 * @return {Object} Current form
			 */
			removeField: function(fieldName) {
				var fields = Config.getOption('fields');
				if (fields && fields[fieldName]) {
					$(fields[fieldName].messagePlace).remove();
					$('[name="'+fieldName+'"]', this).unbund(fields[fieldName].binds);
					delete fields[fieldName];
					Config.getOptions('fields', fields);
				}
				
				return this;
			},
			
			/**
			 * Get field options
			 *
			 * @method getField
			 * @param {String} fieldName
			 * @return {Object|Boolean} return field options
			 */
			getField: function(fieldName){
				var fields = Config.getOption('fields');
				
				if (fields[fieldName]) {
					return fields[fieldName];
				}
				
				return false;
			},
			
			/**
			 * Returns Object of custom or all field options
			 *
			 * @method getFields
			 * @param {Object} fieldNames
			 * @return {Object|Boolean} Objects of custom or all fields
			 */
			getFields: function(fieldNames) {
				var fields = Config.getOption('fields');

				if (typeof fieldNames == "undefined") return fields;
				
				var outFields = {};
				
				$.each(fieldNames, function(index, fieldName) {
				
					outFields[fieldName] = fields[fieldName];
					
				});
				return outFields;
			},
			
			/**
			 * Returns Object of error messages
			 *
			 * @method getMessages
			 * @param {Object} fieldName
			 * @return {Object|Boolean} rules and their messages
			 */
			getMessages: function (fieldName){
				var fields = Config.getOption('fields');
				
				if (fields && fields[fieldName]) {
					return fields[fieldName]['messages'];
				}
				return false;
			},
			
			/**
			 * Add or Replace rule(s) for custom field
			 *
			 * @method addRules
			 * @param {String} fieldName
			 * @param {Object|String} ruleNames
			 * @return {Object} Current Form
			 */
			addRules: function(fieldName, ruleNames) {
				if (typeof ruleNames == "string") {
					ruleNames = [ruleNames];
				}
				
				var fields = Config.getOption('fields');
				
				if (fields && fields[fieldName]) {
				
					var newRules = $.merge(fields[fieldName]['rules'], ruleNames);
					
					fields[fieldName]['rules'] = $.unique(newRules);
					
					Config.setOption('fields', fields);
					
				}
				
				return this;
			},
			
			/**
			 * Remove rule(s) by custom field
			 *
			 * @method removeRules
			 * @param {String|String[]} ruleNames
			 * @return {Object} Current Form
			 */
			removeRules: function(ruleNames) {
				var fields = Config.getOption('fields');
				if (fields && fields[fieldName]) {
				
					var deleteRule = function() {
						if (fields[fieldName]['rules'][ruleName]) {
							delete fields[fieldName]['rules'][ruleName];
						}
					}
					//delete rules
					if (typeof rulenames == "string") {
						deleteRule();
					} else {
						for (var ruleName in ruleNames) {
						deleteRule()
						}
					}
					
					//save new rules
					Config.setOption('fields', fields);
				}
				
				return this;
			},
			
			/**
			 * Add or Modify messages 
			 *
			 * @method setMessage
			 * @param {String} fieldName
			 * @param {Object}  newMessages
			 * @return {Object} Current form
			 */
			setMessages: function(fieldName, newMessages) {
				var fields = Config.getOption('fields');
				if (fields && fields[fieldName]) {
					fields[fieldName]['messages'] = $.extend(fields[fieldName]['messages'], newMessages);
				}
				return this;
			},
			
			/**
			 * Returns Object of rules by custom field
			 *
			 * @method getRules
			 * @param {String} fieldName
			 * @return {Object|Boolean} Rules
			 */
			getRules: function (fieldName) {
				var fields = Config.getOption('fields');
				if (fields && fields[fieldName]) {
					var rules = Rules.getRules(fields[fieldName]['rules']);
					if (rules) {
						return rules;
					}
				}
				return false;
			}
		}
		
		/**
		 * Validate field. If is valid return true, otherwise print errors in place of errors
		 *
		 * @method validate
		 * @param  {String} fieldName
		 * @param  {String} messagePlace
		 * @return {Boolean} is valid
		 */
		Methods.validate = function(fieldName, messagePlace) {
				var message;
				var isValid      = true;
				var form         = this;
				messagePlace = messagePlace || Config.getOption('messagesPlace');
				var messages     = Methods.getMessages(fieldName) || {};
				var field        = $('[name="'+fieldName+'"]', form)
				if (field.length) {
					//Extract field rules
					var rules = Methods.getRules.call(form, fieldName);
					if (rules['required'] || $.trim(field.val()) != "") {
					//check
						for (var ruleName in rules) {
						
							isValid = rules[ruleName].check.call(field);
							
							if (!isValid) {
							
								message = messages[ruleName] || rules[ruleName].message;
								//set Message
								$(messagePlace).show().append('<p>'+ message + '</p>');
								
								isValid = false;
								
								break;
							}
						}
					}
				}
				return isValid;
		}
		
		//Set fields
		var fields = Config.getOption('fields');
		Methods.addFields.call(this, fields);
		
		return Methods;
	};
	
	/**
	 * Configure validation
	 * Returns methods for modify, get options
	 *
	 * @constructor
	 * @param {Object} options
	 * @return {Object} Methods
	 */
	var ValidateOptions = function(options) {
		options = options || {};
		var form = this;
		var defaults = {
				messagesPlace   : '',
				stopOnError     : false,
				fieldBind       : 'keyup keydown keypress',
				success         : function() {return true},
				rules           : {},
				errorTime       : 5000,
				fields          : {},
				errorPlacePrefix: 'erorr_',
				errorCSS        : {color: 'red'},
				errorEffect     : 'fade'
			};
		options = $.extend(defaults, options);
		var ValidateOptionFunctions = {
			/**
			 * Get option value
			 *
			 * @method getOption
			 * @param {String} optionName
			 * @return mixed option value
			 */
			getOption: function (optionName) {
					this._load();
					return options[optionName];
				},
				
			/**
			 * Replace option
			 *
			 * @method setOption
			 * @param {String} optionName
			 * @param Mixed optionValue
			 */
			setOption: function(optionName, optionValue) {
					this._load();
					options[optionName] = optionValue;
					this._save();
					return this;
			},
				
			/**
			 * Returns object of custom options 
			 *
			 * @method getOptions
			 * @param {Object} optionNames OPTIONAL
			 * @return {Object} options
			 */
			getOptions: function (optionNames) {
					this._load();
					if (typeof optionNames != "object") {
						return options;
					}
					var outOptions = {};
					$.each(optionNames, function (index, optionName) {
						outOptions[optionName] = options[optionName];
					});
					return outOptions;
			},
			
			/**
			 * Add or Replace options
			 *
			 * @method setOptions
			 * @param {Object} newOptions
			 * @return {Object} Current Form
			 */
			setOptions: function(newOptions) {
					this._load();
					
					for (var optionName in newOptions){
						options[optionName] = newOptions[optionName];
					}
					this._save();
					return this;
				},
				
			/*
			 * Loading options from form
			 */
			_load: function () {
				options = $(form).data('options');
			},
			
			/*
			 * Save options
			 */
			_save: function() {
				$(form).data('options', options);
			}
				
		}
		ValidateOptionFunctions._save();
		return ValidateOptionFunctions;
	}
$.fn.extend({
		validator: function(options) {
			var timeoutHandle = false;
			
			//saved configuration
			var data = $(this).data('validate');
			
			if (data) {
				var params = Array.prototype.slice.call(arguments);
				params.shift();
				var callback = params.shift();
				return data[options][callback].apply(this, params);
			}
			
			var ValidateData = {};	
			ValidateData.option = ValidateOptions.call(this, options);
			ValidateData.rules  = ValidationRules(ValidateData.option);
			ValidateData.fields = Fields.call(this, ValidateData.option, ValidateData.rules);
			$(this).submit(function(){
				if (timeoutHandle) {
					//Stop the previous function to remove messages 
					clearTimeout(timeoutHandle);
				}
				var isValid = true;
				//Get All fields for validation
				var fields       = ValidateData.fields.getFields();
				var optionNames  = ['stopOnError', 'success', 
									'messagesPlace', 'errorTime',
									'errorEffect'];
				var options      = ValidateData.option.getOptions(optionNames);
				
				//reset messages
				$(options.messagesPlace).show(options.errorEffect).empty();
				
				//Validate
				for (var fieldName in fields) {
					 if (!ValidateData.fields.validate.call(this, fieldName)) {
						isValid = false;
						if (options.stopOnError) {
							break;
						}
					 }
				}
				
				//Hide errors
				timeoutHandle = setTimeout(function () {
					$(options.messagesPlace).empty().hide(options.errorEffect);
				}, options.errorTime);
				
				if (isValid) {
					return options.success.call(this);
				} else {
					return false;
				}
			});
			
			//save
			$(this).data('validate', ValidateData);
			return ValidateData;
		}
});

})(window, $)