'use strict';
var dust = require('dustjs-helpers');
var _ = require('underscore');
//var sanitize = require('validator').sanitize;
//var nconf = require('nconf');


// applicant[phone1][number] -> applicant-phone1-number
/**
 * Description
 * @method bracketToHyphenf
 * @param {} txt
 * @return CallExpression
 */
var bracketToHyphen = function (txt) {
  'use strict';
  return txt.replace(/\[/g, '-').replace(/\]/g, '');
};

/**
 * Descriptionre
 * @method tag
 * @param {} elem
 * @param {} opts
 * @param {} inner
 * @return BinaryExpression
 */
var tag = function (elem, opts, inner) {
  'use strict';
  if (typeof inner === 'function') {
    inner = inner();
  }
  var txt = ' ';
  var value = null;
  // TODO: use underscore.js to loop properties
  for (var attr in opts) {
    if (opts[attr] !== null) {
      value = opts[attr].toString();
    } else {
      value = '';
    }
    // special case because "class" is a reserved word in IE
    if (attr === 'Class') {
      attr = 'class';
    }
    if (value.indexOf('\'') !== -1) {
      txt += attr + '=\"' + value + '\" ';
    } else {
      txt += attr + '=\'' + value + '\' ';
    }
  }
  return '<' + elem + txt + '>' + inner + '</' + elem + '>';
};

/**
 * Translate helper
 * @method translate
 * @param context
 * @param chunk
 * @param string
 * @param paramsObj
 * @param done
 */
var translate = function (context, chunk, string, paramsObj, done) {
  var i18n2 = context.get('__');
  if (i18n2) {
    string = i18n2.apply(this, [string].concat(paramsObj || []));
  } else {
    logger.info("Unable to translate", string, "i18n2 not found.");
  }
  return done(string);
};

var getContextVar = function(paramsObj, context){
  //support this.item
  _.each(paramsObj, function(param, key){
    if(typeof param === 'string' && param.indexOf('this') !== -1){
      var paramArray = _.rest(param.split('.'), 1);
      var val = context.stack.head || {};
      _.each(paramArray, function(item){
        val = val[item] || {};
      });

      if(typeof val === 'string'){
        paramsObj[key] = val;
      }
    }
  });
  return paramsObj;
};

/**
 * Init custom helpers to extend dust.helpers object
 * Note: select is a reserved dustjs-helpers name which is why these are appended with *Tag
 */
exports.init = function () {
  if (!dust.helpers) dust.helpers = {};

  /**
   * {@selectTag/}
   * ------------
   * * Create a select tag with label.
   * <code>
   *      {@selectTag
   *        label="Select Gender"
   *        required=true
   *        firstOption="-- Choose One --"
   *        selected="FEMALE"
   *        collection=genders
   *        // defaults to "id"
   *        value="id"
   *        // defaults to "description", also takes a function
   *        description="description"
   *        name="applicant[gender]"
   *        // defaults to the hyphenated name
   *        id="applicant-gender"
   *        htmlClass="input-block-level"
   *      /}
   * </code>
   * @method selectTag
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   */
  dust.helpers.selectTag = function (chunk, context, bodies, params) {
    if(params.nameIdx || params.nameIdx === 0){
      if(params.name.slice(-1) === ']'){
        params.name = params.name.slice(0, params.name.length-1) + params.nameIdx + params.name.slice(params.name.length-1);
      } else {
        params.name += params.nameIdx;
      }

    }
    params.id = params.id || bracketToHyphen(params.name);
    params.value = params.value || 'id';
    params.description = params.description || 'description';
    params.collection = params.collection || [];
    var txt = '';
    txt += tag('label', { 'for': params.id, class: params.labelHidden ? 'hidden' : ''}, function () {
      var result = '';
      if (params.required) {
        result += tag('span', { 'class': 'required' }, '*&nbsp;');
      }
      if (typeof params.label === 'string') {
        result += translate.call(this, context, chunk, params.label, null, function (txt) {
          return txt;
        });
      } else if (params.label.msg) {
        result += translate.call(this, context, chunk, params.label.msg, params.label.params || [], function (txt) {
          return txt;
        });
      }
      return result;
    });
    txt += '\n';
    var selectOpts = {
      id: params.id,
      name: params.name
    };
    params.htmlClass = dust.helpers.tap(params.htmlClass, chunk, context);
    if (params.htmlClass) {
      selectOpts['class'] = params.htmlClass;
    }
    if (params.disabled) {
      selectOpts.disabled = 'disabled';
    }
    if (params.readonly) {
      selectOpts.readonly = 'readonly';
      selectOpts['class'] = (selectOpts['class'] || '') + ' disabled-input';
    }

    txt += tag('select', selectOpts, function () {
//      params.collection = dust.helpers.tap(params.collection, chunk, context);
      var arr = params.collection && params.collection.map(function (option) {
        var optionOptions = {
          value: option[params.value]
        };
        // these are not the droids you are looking for
        if (params.selected + '' === option[params.value] + '') {
          optionOptions.selected = "selected";
        }
        var optionDescription = null;
        if (typeof params.description === 'function') {
          optionDescription = params.description(option);
        } else {
          optionDescription = option[params.description];
        }
        return tag('option', optionOptions, optionDescription);
      });
      // see if we have a '-- Choose One --' type of option
      //noinspection JSUnresolvedVariable
      if (params.firstOption) {
        arr.reverse();
        //noinspection JSUnresolvedVariable
        arr.push(tag('option', {value: ''}, translate.call(this, context, chunk, params.firstOption, null, function (txt) {
          return txt;
        })));
        arr.reverse();
      }
      return arr.join('\n');
    });

    return chunk.write(txt);
  };

  /**
   * {@textboxTag/}
   * -------------
   * Create a text input.
   * <code>
   *       {@textboxTag
   *         name="applicant[phone2][number]"
   *         label="Phone"
   *         value=applicant.phone2?formatPhone(applicant.phone2.number):""
   *         htmlClass="input-block-level phonemask"
   *         placeHolder="555-555-5555"
   *         disabled=true
   *       /}
   * </code>
   * @method textboxTag
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   */
  dust.helpers.textboxTag = function (chunk, context, bodies, params) {
    'use strict';
    params.id = params.id || bracketToHyphen(params.name);
    var txt = '';
    if (params.label || params.required) {
      txt += tag('label', { 'for': params.id, class: params.labelHidden ? 'hidden' : ''}, function () {
        var result = '';
        if (params.required) {
          result += tag('span', { 'class': 'required' }, '*&nbsp;');
        }
        if (typeof params.label === 'string') {
          result += translate.call(this, context, chunk, params.label, null, function (txt) {
            return txt;
          });
        } else if (params.label && params.label.msg) {
          result += translate.call(this, context, chunk, params.label.msg, params.label.params || [], function (txt) {
            return txt;
          });
        }
        return result;
      });
    }
    txt += '<input id="';
    txt += params.id;
    txt += '" name="';
    txt += params.name;
    txt += '" value="';
    if (params.value) {
      txt += params.value;
    }
    txt += '" autocomplete="off" class="';
    txt += params.htmlClass;
    txt += '"';
    if (params.type) {
      txt += ' type="' + params.type + '"';
      if (params.type === "number") {
        txt += ' onkeyup="this.value=this.value.replace(/[^\\d+]/,\'\')"';
      }
    } else {
      txt += ' type="text"';
    }

    if(params.accept) {
      txt += ' type="' + params.accept + '"';
    }
    //noinspection JSUnresolvedVariable
    if (params.placeHolder) {
      //noinspection JSUnresolvedVariable
      var translatedPlaceHolder;
      translatedPlaceHolder = translate.call(this, context, chunk, params.placeHolder, null, function (txt) {
        return txt;
      });
      if (!translatedPlaceHolder) {
        translatedPlaceHolder = params.placeHolder;
      }
      txt += ' placeholder="' + translatedPlaceHolder + '"';
    }
    if (params.maxLength) {
      txt += ' maxlength="' + params.maxLength + '"';
    }
    if (params.disabled) {
      txt += ' disabled';
    }
    if (params.readonly) {
      txt += ' readonly="readonly"';
    }
    if (params.min) {
      txt += ' min="' + params.min + '"';
    }
    if (params.max) {
      txt += ' max="' + params.max + '"';
    }
    txt += ' />';

    return chunk.write(txt);
  };

  /**
   * {@textareaTag/}
   * -------------
   * Create a text area.
   * <code>
   *       {@textareaTag
   *         rows="4"
   *         cols="50"
   *         name="applicant[comment]"
   *         label="Question/Comment"
   *         value=applicant.comment
   *         htmlClass ="input-block-level phonemask"
   *       /}
   * </code>
   * @method textareaTag
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   */
  dust.helpers.textareaTag = function (chunk, context, bodies, params) {
    params.id = params.id || bracketToHyphen(params.name);
    var txt = '';
    txt += tag('label', { 'for': params.id, class: params.labelHidden ? 'hidden' : ''}, function () {
      var result = '';
      if (params.required) {
        result += tag('span', { 'class': 'required' }, '*&nbsp;');
      }
      if (typeof params.label === 'string') {
        result += translate.call(this, context, chunk, params.label, null, function (txt) {
          return txt;
        });
      } else if (params.label.msg) {
        result += translate.call(this, context, chunk, params.label.msg, params.label.params || [], function (txt) {
          return txt;
        });
      }
      return result;
    });
    txt += '<textarea rows="';
    txt += params.rows;
    txt += '" cols="';
    txt += params.cols;
    txt += '" id="';
    txt += params.id;
    txt += '" name="';
    txt += params.name;
    txt += '" class="';
    txt += params.htmlClass;
    if (params.maxLength) {
      txt += '" maxlength="' + params.maxLength;
    }
    txt += '" >';
    if (params.value) {
      txt += params.value;
    }
    txt += '</textarea>';

    return chunk.write(txt);
  };

  /**
   * {@radiogroupTag/}
   * -------------
   * Create a radio group.
   * <code>
   *    {@radiogroupTag
   *      name="applicant[disclosure_a1a]"
   *      selected=applicant.disclosure_a1a
   *      label="Disclosure A1A"
   *      description="Description text"
   *      required=true
   *      collection=[
   *        { id:"YES", description:"Yes"},
   *        { id:"NO", description:"No"}]
   *      translateColDesc: true
   *    /}
   * </code>
   * @method radiogroupTag
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   */
  dust.helpers.radiogroupTag = function (chunk, context, bodies, params) {
    params.value = params.value || 'id';
    params.description = params.description || 'description';
    var txt = '';
    txt += tag('fieldset', {}, function () {
      var txt = '';
      txt += tag('legend', {'class': 'legend-radio', 'style': 'margin-bottom: 0;' }, function () {
        var pResult = '';

        var pParams = params.htmlClass ? {class: params.htmlClass} : {};
        pResult = tag('p', pParams, function () {
          var result = '';
          if (params.required) {
            result += tag('span', { 'class': 'required' }, '*&nbsp;');
          }
          if (params.doNotTranslateLabel === 'true') {
            result += params.label;
          } else {
            if (typeof params.label === 'string') {
              result += translate.call(this, context, chunk, params.label, null, function (txt) {
                return txt;
              });
            } else if (params.label.msg) {
              result += translate.call(this, context, chunk, params.label.msg, params.label.params || [], function (txt) {
                return txt;
              });
            }
          }
          return result;
        });
        return pResult;
      });
      txt += '\n';

      var arr = params.collection && params.collection.map(function (option) {
        var dataClass = params.htmlClass ? ' ' + params.htmlClass : '';
        var labelOptions = { 'class': 'radio-inline' + dataClass + (params.labelHidden ? ' hidden' : '')};
        //noinspection JSUnresolvedVariable
        if (params.notInline) {
          labelOptions.class = 'radio' + dataClass;
        }
        var label = tag('label', labelOptions, function () {
          var txt = '';
          var inputOptions = {
            type: 'radio',
            name: params.name,
            value: option[params.value]
          };
          if (params.disabled) {
            inputOptions.disabled = 'disabled';
          }
          if (params.selected + '' === option[params.value] + '') {
            inputOptions.checked = 'checked';
          }
          if (params.htmlClass) {
            inputOptions.class = params.htmlClass;
          }
          txt += tag('input', inputOptions, '');
          var optionDescription = null;
          if (typeof params.description === 'function') {
            optionDescription = params.description(option);
          } else {
            optionDescription = option[params.description];
          }
          if (params.translateColDesc) {
            optionDescription = translate.call(this, context, chunk, optionDescription, null, function (txt) {
              return txt;
            })
          }
          txt += optionDescription;
          return txt;
        });
        return label;
      });
      txt += "<div class='yes-no'>" + arr.join('\n') + "</div>";

      return txt;
    });

    return chunk.write(txt);
  };

  /**
   * @method modalLink
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {string}
   */
  dust.helpers.modalLink = function (chunk, context, bodies, params) {
    params = params || {};
    // TODO: extract into utility class
    // if no modalId passed in, use a rfc4122 GUID
    params.modalId = params.modalId || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    var text = '';
    if (params.icon) {
      text += '<i class="glyphicon-' + params.icon + '"></i> ';
    }
    if (typeof params.inner === 'function') {
      params.inner = params.inner();
    }
    if (typeof params.modalHeader === 'function') {
      params.modalHeader = params.modalHeader();
    }
    if (typeof params.modalContent === 'function') {
      params.modalContent = params.modalContent();
    }

    if (params.translateInner) {
      params.inner = translate.call(this, context, chunk, params.inner, null, function (txt) {
        return txt;
      });
    }
    if (params.translateModalHeader) {
      params.modalHeader = translate.call(this, context, chunk, params.modalHeader, null, function (txt) {
        return txt;
      });
    }

    var classString = params.htmlClass || '';
    text += '<a class="' + classString + '" href="#' + params.modalId + '" data-toggle="modal">' + params.inner + '</a>';
    text += '<div id="' + params.modalId + '" class="modal fade">';
    text += '<div class="modal-dialog">';
    text += '<div class="modal-content">';
    if (params.modalHeader && params.modalHeader.length > 0) {

      text += '<div class="modal-header">';
      text += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
      text += '<h4>' + params.modalHeader + '</h4>';
      text += '</div>';
    }
    text += '<div class="modal-body">';
    if (params.translateModalContent) {
      params.modalContent = translate.call(this, context, chunk, params.modalContent.msg, params.modalContent.params, function (txt) {
        return txt;
      });
      params.closeButton = translate.call(this, context, chunk, params.closeButton, null, function (txt) {
        return txt;
      });
    }
    text += params.modalContent;
    text += '</div>';
    if (params.closeButton || params.confirmButton) {
      text += '<div class="modal-footer">';
      if (params.closeButton) {
        text += '<a href="#" class="btn btn-default" aria-hidden="true" data-dismiss="modal">' + params.closeButton + '</a>';
      }
      if (params.confirmButton) {
        text += '<a href="#" class="btn btn-default" aria-hidden="true" data-dismiss="modal">' + params.confirmButton + '</a>';
      }
      text += '</div>';
    }
    text += '</div>';
    text += '</div>';
    text += '</div>';

    if(chunk.write){
      return chunk.write(text);
    } else {
      return text;
    }
  };

  /**
   * {@viewmapLink/}
   * -------------
   * Create a mailto link.
   * <code>
   *       {@viewmapLink
   *         geocode=location.geocode
   *         inner=(function | text)
   *         htmlClass="btn"
   *       /}
   *   -%>
   * </code>
   * @method viewmapLink
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   */
  dust.helpers.viewmapLink = function (chunk, context, bodies, params) {
    params = params || {};
    params.translate = params.translate || function (txt) {
      return translate.call(this, context, chunk, txt, null, function (txt) {
        return txt;
      });
    };
    params.inner = params.inner || params.translate('View Map');
    if (typeof params.inner === 'function') {
      params.inner = params.inner();
    }

    if(typeof params.geocode === 'string'){
      try {
        logger.debug(params.geocode);
        params.geocode = JSON.parse(params.geocode);
      } catch (e) {
        logger.info("error occurred while parsing dust i18n2 helper params: %s", params.opts, e);
      }
    }

    var linkString = 'https://maps.google.com/?q=' + params.geocode.latitude + ',' + params.geocode.longitude;
    params.icon = params.icon || 'map-marker';
    params.href = linkString;

    return chunk.write(dust.helpers.redirectLink({}, context, bodies, params));
  };

  /**
   * @method redirectLink
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @param showModal used for map helper
   * @returns {text|*}
   */
  dust.helpers.redirectLink = function (chunk, context, bodies, params, showModal) {
    'use strict';

    //to ignore modal
    var globalDisable = params.overrideGlobalDisable ? false : nconf.get('ignore-redirect-modal');
    if(!showModal && globalDisable){

      params.htmlClass = params.htmlClass || '';
      params.target = params.target || '_blank';
      var text = '';

	    if (params.icon) {
		    text += '<i class="glyphicon-' + params.icon + '"></i> ';
	    }

	    text += '<a target="'+params.target+'" class="' + params.htmlClass + '" href="'+params.href+'">' +
	    params.inner + '</a>';

      if (chunk.write) {
        return chunk.write(text);
      } else {
        return text;
      }
    }

    params = params || {};
    params.translate = params.translate || function (txt) {
      return translate.call(this, context, chunk, txt, null, function (txt) {
        return txt;
      });
    };
	  
	  var tsaRedirectMsg = 'You are now leaving an official website of the Transportation Security Administration. Links to non-TSA sites are provided for the visitor\'s convenience and do not represent an endorsement by TSA of any commercial or private issues, products or services. Note that the privacy policy of the linked site may differ from that of TSA.';
	  var uepRedirectMsg = 'You are now leaving IdentoGO.com. Links to external sites are provided for the visitor\'s convenience and do not represent an endorsement by MorphoTrust USA of any commercial or private issues, products or services. Note that the privacy policy of the linked site may differ from that of MorphoTrust USA.';
	  
	  var redirectMsg = nconf.get('enable-uep') ? uepRedirectMsg : tsaRedirectMsg;
	  		  
    params.modalContent = (params.translateModalContent ? params.translate(params.modalContent) : params.modalContent || params.translate(redirectMsg)) + '<br /><br />' + params.translate('Proceed to') + ' <a target="_blank" href="' + params.href + '">' + params.href + '</a>';
    params.modalHeader = params.modalHeader || params.translate('Redirect');
    params.closeButton = params.closeButton || params.translate('Close');

    if(params.translateInner) {
      params.inner = params.translate(params.inner);
      // prevent modalLink from translating inner too
      delete params.translateInner;
    }
    delete params.translateModalContent;

    return dust.helpers.modalLink(chunk, context, bodies, params);
  };

  /**
   * @method confirmAppointmentCancellation
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   */
  dust.helpers.confirmAppointmentCancellation = function (chunk, context, bodies, params) {
    params.modalContent = params.modalContent || params.translate('This will cancel your appointment') + '<br /><br />' + params.translate('Are you sure you want to cancel?');
    params.modalHeader = params.modalHeader || params.translate('Confirm Cancel Appointment');
    params.closeButton = params.closeButton || params.translate('Close');
    params.confirmButton = params.confirmButton || params.translate('Yes');

    return chunk.write(modalLink(chunk, context, bodies, params));
  };

  /**
   * @method routingHelper
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   **/
  dust.helpers.routingHelper = function (chunk, context, bodies, params) {
    if(params.route && typeof routingHelper[params.route] === 'function') {
      var route = params.route;
      delete params.route;
      return chunk.write(routingHelper[route](params));
    }
    return chunk.write();
  };

  dust.helpers.dateReformat = function(chunk, context, bodies, params) {
    var date = params.date ? params.date : '';

    if (params.date instanceof Array) {
      date = params.date[1] + '/' + params.date[2] + '/' + params.date[0];
    } else if (typeof params.date === 'string' && params.date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
      var parts = params.date.split('-');
      date = parts[1] + '/' + parts[2] + '/' + parts[0];
    }

    return chunk.write(date);
  };

  /**
   * {@i18n2/}
   * -------------
   * Any of the following should work. ot suports prematives (string literals, numbers), references
   * <code>
   *   {@i18n2 opts=[1,2]}Steps %s of %s{/i18n2}
   *   {@i18n2 opts="[\"1\",\"2\"]"}Steps %s of %s{/i18n2}
   *   {@i18n2 opts=args}Steps %s of %s{/i18n2}
   * </code>
   * @method i18n2
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   */
  dust.helpers.i18n2 = function (chunk, context, bodies, params) {
    var paramsObj;
    paramsObj = params.opts;
    if (params && params.opts) {
      //already in array format
      if(!(_.isArray(params.opts))){
        try {
          logger.debug(params.opts);
          paramsObj = JSON.parse(params.opts);

          //support this.item
          paramsObj = getContextVar(paramsObj, context);
        } catch (e) {
          logger.info("error occurred while parsing dust i18n2 helper params: %s", params.opts, e);
        }
      }
    }

    if (bodies.block) {
      return chunk.capture(bodies.block, context, function (string, chunk) {
        translate.call(this, context, chunk, string, paramsObj || [], function (txt) {
          chunk.end(txt);
        });
      });
    }
    return chunk;
  };

  /**
   * {@assetFingerprint/>
   * --------------------
   * <code>
   *   {@assetFingerprint url="/js/analytics.js" /}
   *   {@assetFingerprint url=urlLink /}
   * </code>
   * @method assetFingerprint
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   */
  dust.helpers.assetFingerprint = function (chunk, context, bodies, params) {
    params = params || {};
    if (params.url) {
      var assetFingerprint = context.get('assetFingerprint');
      return chunk.write(assetFingerprint(params.url));
    }
    return chunk;
  };

  /**
   * {@cardReplacementReasonDetail/>
   * --------------------
   * <code>
   *   {@cardReplacementReasonDetail propKey="id"}{.}{/cardReplacementReasonDetail}
   *   {@cardReplacementReasonDetail propKey="displayReason"}{.}{/cardReplacementReasonDetail}
   *   {@cardReplacementReasonDetail propKey="paymentDescription"}{.}{/cardReplacementReasonDetail}
   * </code>
   * @method cardReplacementReasonDetail
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   */
  dust.helpers.cardReplacementReasonDetail = function (chunk, context, bodies, params) {
    if (bodies.block && params.propKey) {
      return chunk.capture(bodies.block, context, function (bodyObj, chunk) {
        var detail = cardReplacementReasonDetail(bodyObj);
        if (detail) {
          var detailPropVal = detail[params.propKey];
          if (detailPropVal) {
            return chunk.end(detailPropVal);
          }
        }
      });
    }
    return chunk;
  };

  dust.helpers.contains = function(chunk, context, bodies, params) {
    if (bodies.block) {
      return chunk.capture(bodies.block, context, function (string, chunk) {
        if(_.contains(params.list, params.value)){
          return chunk.end(string);
        } else if(bodies.else){
          bodies.else(chunk, context);
        }
        chunk.end('')
      });
    }
    return chunk;
  };
  /**
   * {@nconf/>
   * --------------------
   * <code>
   *   {@nconf get="server-host"/}
   *   {@nconf get="enable-foo" type="boolean"}
   *     foo enabled
   *   {:else}
   *     foo not enabled
   *   {/nconf}
   * </code>
   *
   * @param chunk
   * @param context
   * @param bodies
   * @param params
   * @returns {*}
   */
  dust.helpers.nconf = function (chunk, context, bodies, params) {
    var nconf = context.get('nconf');
    params = params || {};
    if (params.type && params.type === "boolean" && bodies.block) {
      chunk.capture(bodies.block, context, function (bodyObj, chunk) {
        if (nconf.get(params.get)) {
          chunk.end(bodyObj);
        } else {
          chunk.end('');
        }
      })
    } else {
      return chunk.write(nconf.get(params.get));
    }
    return chunk;
  };

  dust.helpers.isActiveLocation = function (chunk, context, bodies, params) {
    var locationDetail = context.get('locationDetail');
    params = params || {};
    if (params.externalId && typeof locationDetail === 'function') {
      chunk.capture(bodies.block, context, function (bodyObj, chunk) {
        if (locationDetail(params.externalId)) {
          chunk.end(bodyObj);
        } else {
          chunk.end('');
        }
      })
    }
    return chunk;
  };

  dust.helpers.findWhere = function(chunk, context, bodies, params) {
    if (bodies.block) {
      return chunk.capture(bodies.block, context, function (string, chunk) {
        var testData = {};
        var keys = [];
        var values = [];

        //check for stringified object
        if(typeof params.key === 'string'){
          try {
            keys = JSON.parse(params.key);
            values = JSON.parse(params.value);
          } catch (e) {
            keys = [params.key];
            values = [params.value];
          }
        }

        //check for context vars
        params.key = getContextVar(keys, context);
        params.value = getContextVar(values, context);

        //build out testData
        _.each(params.key, function(key, idx){
          testData[key] = params.value[idx];
        });

        //look for match
        if(_.findWhere(params.list, testData)){
          return chunk.end(string);
        } else if(bodies.else){
          bodies.else(chunk, context);
        }
        chunk.end('')
      });
    }
    return chunk;
  };

  dust.helpers.toFixed = function(chunk, context, bodies, params) {
    var newVal = typeof params.value === 'string' ? parseInt(params.value) : typeof params.value === 'number' ? params.value : 0;
    newVal = newVal.toFixed(params.length || 0);

    return chunk.write(newVal);
  };

  dust.helpers.toLowerCase = function(chunk, context, bodies, params) {
	  return chunk.capture(bodies.block, context, function (string, chunk) {
		  if(typeof string === 'string'){
			  string = string.toLowerCase();
		  }
		  chunk.end(string);
	  });
  };

  dust.helpers.toUpperCase = function(chunk, context, bodies, params) {
	  return chunk.capture(bodies.block, context, function (string, chunk) {
		  if(typeof string === 'string'){
			  string = string.toUpperCase();
		  }
		  chunk.end(string);
	  });
  };

  //dust filters
  if (!dust.filters) dust.filters = {};
  /**
   * @param markup
   * @returns {*}
   */
  dust.filters.md = function(markup) {
    'use strict';
    markup = (markup || '') + '';
    return Markdown(sanitize(markup).xss());
  };

  dust.filters.date = function(dateString, format) {
    'use strict';
    var date = new Date(dateString);
    //TODO: support dynamic formats

  };
};
