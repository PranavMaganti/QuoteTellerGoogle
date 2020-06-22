"use strict";

process.env.DEBUG = "actions-on-google:*";
const App = require("actions-on-google").ApiAiApp;
const functions = require("firebase-functions");
const firebase = require("firebase");

var config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId
};

firebase.initializeApp(config);
var database = firebase.database();

exports.quotey = functions.https.onRequest((request, response) => {
  const app = new App({ request, response });
  console.log("Request headers: " + JSON.stringify(request.headers));
  console.log("Request body: " + JSON.stringify(request.body));

  function context() {
    let action = app.getArgument("my-action");
    console.log(action);
    sendQuote(app, "my-action");
  }

  function quote() {
    sendQuote(app, "quote-type");
  }

  function getQuote(app, parameter, callback) {
    var promise = new Promise(function (resolve, reject) {
      var quoteType = app.getArgument(parameter);

      if (quoteType != null) {
        resolve(quoteType);
      } else {
        reject(Error("It broke"));
      }
    });

    promise.then(function (quoteType) {
      var path = "/" + quoteType;
      var ref = database.ref(path);
      ref.on("value", gotData, errData);

      function gotData(data) {
        let quotes = data.val();
        let randomIndex = (Math.random() * (quotes.length - 1)).toFixed();
        console.log(quotes);
        return callback(quotes[randomIndex]);
      }

      function errData(err) {
        console.log("Error");
        console.log(err);
      }
    });
  }

  function sendQuote(app, parameter) {
    getQuote(app, parameter, function (quote) {
      if (quote.constructor === Array) {
        let res = quote[0] + ". Would you like to hear another quote?";
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          app.ask(
            app
              .buildRichResponse()
              .addSimpleResponse("Here's a quote for you: ")
              .addSuggestions(["Famous", "Inspirational", "Elgoog", "Books"])
              .addBasicCard(
                app.buildBasicCard(res).setImage(quote[1], "Picture")
              )
          );
        } else {
          app.tell(res);
        }
      } else {
        let res = quote + ". Would you like to hear another quote?";
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          app.ask(
            app
              .buildRichResponse()
              .addSimpleResponse("Here's a quote for you: " + res)
              .addSuggestions(["Famous", "Inspirational", "Elgoog", "Books"])
          );
        } else {
          app.tell(res);
        }
      }
    });
  }

  function welcomeIntent() {
    let resFancy =
      "I have a variety of different quotes so if you would like to hear one just ask me for one";
    if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
      app.ask(
        app
          .buildRichResponse()
          .addSimpleResponse(resFancy)
          .addSuggestions(["Famous", "Inspirational", "Elgoog", "Books"])
      );
    } else {
      let res =
        "I can tell you a variety of different quotes such as Famous, Boook, Inspirational or Google quotes, so if you would like hear one just ask me for one";
      app.tell(res);
    }
  }

  const actionMap = new Map();
  actionMap.set("welcome.intent", welcomeIntent);
  actionMap.set("previous.context", context);
  actionMap.set("tell.quote", quote);
  app.handleRequest(actionMap);
});
