import {dialogflow, Image, DialogflowConversation} from 'actions-on-google';
import {Suggestions, BasicCard}
  from 'actions-on-google/dist/service/actionssdk';
import * as functions from 'firebase-functions';
import * as firebase from 'firebase';


const app = dialogflow();

const config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
};

firebase.initializeApp(config);
const database = firebase.database();

const suggestions = ['Famous', 'Inspirational', 'Elgoog', 'Books'];
const anotherQuote = 'Would you like to hear another quote?';
const reprompt = `I didn't understand that. You can ask for a famous quote, 
an inspirational quote or a book quote`;

/**
 * Retrives a quote from the firebase db
 * @param {string} quoteType type of quote to retrive
 * @return {Promise<string | Array<string>>} Returns the quote or an array with
 * the quote and an image
 */
async function getQuote(quoteType: string): Promise<string | Array<string>> {
  const dbPath = '/' + quoteType;
  return database.ref(dbPath).once('value').then((data) => {
    const quotes: Array<string> = data.val();
    const randomIndex = (Math.random() * (quotes.length - 1)).toFixed();
    return (quotes[randomIndex]);
  });
}

/**
 * Retrives and returns a quote of a given type to the user
 * @param { DialogflowConversation } conv the current dialogflow conversation
 * @param { string } quoteType the type of quote to return to the user
 */
function sendQuote(conv: DialogflowConversation, quoteType: string) {
  getQuote(quoteType).then((quote: string | Array<string>) => {
    conv.ask('Here\'s a quote for you:');

    if (quote instanceof Array) {
      if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
        conv.ask(new BasicCard({
          title: quoteType + ' quote',
          image: new Image({
            url: quote[1],
            alt: quoteType + ' quote',
          }),
        }));
        conv.ask(new Suggestions(suggestions));
      }
      conv.ask(quote[0] + '.');
    } else {
      conv.ask(quote);
      if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
        conv.ask(new Suggestions(suggestions));
      }
    }
    conv.ask(anotherQuote);
  });
}

app.intent('WelcomeIntent', (conv) => {
  const resFancy = `I have a variety of different quotes so if you would like
     to hear one just ask me for one`;
  const res =
     `I can tell you a variety of different quotes such as Famous, Boook, 
     Inspirational or Google quotes, so if you would like hear one just ask 
     me for one`;

  if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.ask(resFancy);
    conv.ask(new Suggestions(suggestions));
  } else {
    conv.ask(res);
  }
});

app.intent('tellQuote', async (conv, {quoteType}) => {
  if (!(typeof quoteType === 'string')) {
    conv.ask(reprompt);
    return;
  }

  sendQuote(conv, quoteType);
});

app.intent('quote_yes', (conv, {quoteType}) => {
  if (!(typeof quoteType === 'string')) {
    conv.ask(reprompt);
    return;
  }
  sendQuote(conv, quoteType);
});

app.intent('Default Fallback Intent', (conv) => {
  conv.ask(reprompt);
});

exports.quotey = functions.https.onRequest(app);
