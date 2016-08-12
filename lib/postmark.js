/* Copyright (c) 2013 Richard Rodger, MIT License */
"use strict";

var _              = require('underscore')
var postmark       = require("postmark");

var name = "postmark-mail"

module.exports = function( options ){
  var postmarkinstance = new postmark.Client( options.key )
  var seneca = this

  options = this.util.deepextend({
  },options)

  var aliasmap = {
    'from':    'From',
    'to':      'To',
    'cc':      'Cc',
    'bcc':     'Bcc',
    'subject': 'Subject',
    'text':    'TextBody',
    'html':    'HtmlBody',
    'replyTo': 'ReplyTo'
  }

  function postmarkaliases( mailoptions ) {
    var out = {}
    var mailoptionsclean = _.pick( mailoptions, _.keys(aliasmap) )
    _.each( mailoptionsclean, function(v,k) {
      var alias = aliasmap[k]
      if( void 0 != v ) { 
        out[alias] = v
      }
    })
    return out
  }

  seneca.add({role:'mail',hook:'send'},function( args, done ){

    var mailoptions = _.extend({}, options, args)

    mailoptions = postmarkaliases(mailoptions)

    postmarkinstance.sendEmail( mailoptions, function( err, out) {
      if( err ) {
        return done(err);
      }
      done(null,{ok:true,details:out})
    })
  })

  seneca.add({role:'mail',hook:'init',sub:'transport'},function( args, done ){
    done(null)
  })

  return {name:name}
}
