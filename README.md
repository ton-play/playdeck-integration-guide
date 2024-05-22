# Playdeck Integration

Your game runs in an iFrame inside our Wrapper.
The process of passing data between your game and our Wrapper is via `window.postMessage`.
[Window: postMessage() docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

> Your game can both transmit messages and listen to them.

## Release Notes:

**Dec 8. 2023**

- added [Unity integration sample](https://github.com/ton-play/playdeck-unity-integration)


### Methods that must/should be implemented:

- `loading()` . You need to call loading method within 0-3 sec from game loading started. This will be a signal to our wrapper that game start loading
- `setScore()`. It is preferable that your game use scores after each level/game over/session etc depending on mechanics
- The game should consider to use correct user locale for rendering proper UI texts. You can find locale by calling `getUser()` method OR use devices locale in order of prioriry: `(navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;`
- `sendAnalyticNewSession()`. You need to call the method to pass the information that the player is actually in the game. If the game has many game sessions (runner), then send a request for each game session.
- `sendAnalyticNewPayment()`. You can use this method to send information about in-game purchases.

### FAQ
----
Q: How do I know that my game is running inside telegram?

A: In case of iframe launch there is no way to detect it, but we pass `telegram=true` query parameter into every game url so you can check it and find out telegram startup

----

Q: How to determine exact response within multiple `getData()` calls ?

A: Each `getData()` response contains `key` field according to requested data `key`

----
Q: How much data can I store via `setData()` ?

A: We have limit for `data` = 10Kb and `key` length <= 50 symbols

----
Q: How do I know that user in my game is properly authenticated?

A: You have the method `getUser()` that returning `token` field . It is JWT format of token and you can easily [read it](https://ton-play-1.gitbook.io/ton-play/digital-assets-api/authentication/decode-jwt) and [validate](https://ton-play-1.gitbook.io/ton-play/digital-assets-api/authentication/validate-user-jwt) over API or inplace with public key

----
Q: How do I know that the Play button has been pressed?

A: By clicking on the Play button Wrapper sends a message. You can listen to it just like the rest of the methods.
The wrapper will send a payload with the following structure:
```
{ playdeck: { method: "play" } }
```
----

Q: How will I know that the download has been completed?

A: Upon reaching the end of the loading, the Wrapper will fire event `loaded`.

Q: What is a webapp and a gameapp?

A: These are two ways to launch games in telegram. In general, web app games are used in games with advertising, microtransactions, a referral system, and game app in simple games with scoring. Ask us what kind of launch your game has
Differences in methods:

| Method           | Webapp | Gameapp |
| -----------------| ------ | ------- |
| openTelegramLink |   ✅   |   ❌    |
| customShare      |   ✅   |   ❌    |
| getUrlParams     |   ✅   |   ❌    |
| setScore         |   ❌   |   ✅    |
| getScore         |   ❌   |   ✅    |
| getGlobalScore   |   ❌   |   ✅    |

The other methods are supported in both ways

Q: Is it possible to implement the functionality of a referral system or game rooms?

A: Yes. Our platform supports format links: https://t.me/playdeckbot/market?startapp=eyJnYW1lIjp7I... The params "startparam" contains a non-standard jwt. 
These links can be obtained inside the game using the "customShare" method, but only in webapp game

#### Let's look at an example of listening to messages and processing data from our Wrapper.

```javascript
window.addEventListener("message", ({ data }) => {
  if (!message || !message["playdeck"]) return;

  pdData = data["playdeck"];

  if (pdData.method === "isOpen") {
    window.playdeckIsOpen = data.value;
  }

  if (pdData.method === "play") {
    if (runner.crashed && runner.gameOverPanel) {
      runner.restart();
    } else {
      var e = new KeyboardEvent("keydown", { keyCode: 32, which: 32 });
      document.dispatchEvent(e);
    }
  }

  if (pdData.method === "pause") {
    runner.stop();
  }
});
```

#### By default, "playdeck" sends "{playdeck: {method: "play"}}" after pressing the play button in the playdeck-menu

#### In the following example, data transfer options and method calls are considered in our Wrapper.

```javascript
const parent = window.parent.window;

const loading = (value) =>
  parent.postMessage({ playdeck: { method: "loading", value: value } }, "*");
const getScore = () =>
  parent.postMessage({ playdeck: { method: "getScore" } }, "*");
loading(100); // It will call the wrapper method, which will start rendering the percentage loading of the progress bar.
```

#### Available Wrapper methods

```javascript
  /**
   * Get telegram user id & nickname
   * @deprecated - use getToken if you need to get user token
   * @return {Object}
   * `{"playdeck":
   *    {"method": "getUser", "value": {\"id\":\"74882337\",\"username\":\"Jack\"}}
   *  }`
   * */
  getUser: () => Object

  /**
   * Whether or not the bottom menu is open. Use to disable the game while a user is in the menu. @return {"playdeck": { "method": "isOpen", "value": boolean}}
  */
  getPlaydeckState: () => boolean

  /**
   * Set Loader Progress.
   * Use `loading(pct)`, to customize the bottom progress bar, pct in % [0..100].
   * Use this if you have a loader. **OR**
   * - Use `loading()` to start the animation from 0% to 80% and then wait
   * - Use `loading(100)` when all your assets have been downloaded to make the Play button available.
   * @param {number | undefined} pct
  */
  loading: (pct: number | undefined) => void

  /** Call a gameEnd */
  gameEnd: () => void

  /**
   * Get User Locale
   * @returns {"playdeck": {"method": "getUserLocale", "value": 'en' | 'ru'}}
  */
  getUserLocale: () => Object

  /**
   * Set Score
   * @param {number} score
   * @param {boolean} force - set this flag to `true` if the high score is allowed to decrease. This can be useful when fixing mistakes or banning cheaters
   * It is supported only in gameapp games
  */
  setScore: (score: number, force: boolean = false) => void

  /**
   * Get Score from the card
   * @return
   * {"playdeck":
   *   {"method":"getScore" , "value": {\"position\":1,\"score\":73}}
   * } **OR**
   * {"playdeck":
   *   {
   *      "method":"getScore",
   *      value: {"error":{"type":"OBJECT_NOT_FOUND","message":"Game score not found","error":true}}
   *   }
   * }
   * It is supported only in gameapp games
  */
  getScore: () => Object

  /**
   * Get Global Score (maximum top 50) from the card
   * @return
   * {
   *   "playdeck": {
   *     "method":"getScore" , "value": [{\"position\":1,\"score\":73}, \"username\":\"john\" ]
   *   }
   * }
   * It is supported only in gameapp games
  */
  getGlobalScore: (top: number = 10) => Object

  /**
   * Set Data - use to save arbitrary data in between sessions.
   * @param {string} data - value (limit 10Kb)
   * @param {string} key - key name (length limit 50 symbols) */
  setData: (key: string, data: string) => void

  /**
   * Get Data - use to obtain saved data.
   * @param {string} key - key name
   * @return
   * `{"playdeck":{
   *   "method":"getData",
   *   "value": {}}
   * }`
   * **OR**
   * `{"playdeck": {
   *   "method": "getData",
   *   "value": "value",
   *   "key": "key"}
   * }`
  */
  getData: (key: string) => Object

  /**
  * Device aware links opener (inside telegram clients only)
  * On Desktop clients open link in an external browser
  * On Mobile clients:
  * -- if link is telegram link (t.me, telegram.me) --> open inside internal telegram browser
  * -- if link to external resource (google.com, etc) --> open in an external browser
  * @param {string} url - url to resource that need to be opened
  * It is supported only in webapp games
  */
  openTelegramLink: (url:  string) =>  void

  /**
  * Send game event to our intergation platform
  * @param {Event} event - event object with analytics
  */
  sendAnalytics: (event: Event) => void

  /**
  * Get user profile
  * @return {Profile} profile - user profile
  */
  getUserProfile: () => Profile

  /**
  * Get the query string that the game opened with. You can also get these parameters via method getUserProfile
  * You can create a link with a query string using the customShare method
  * @return  {[key: string]: string}
  * It is supported only in webapp games
  */
  getUrlParams: () => Object

  /**
  * Get token
  * @return {string} - user JWT token
  */
  getToken: () => string

  /**
  * Creating a link with a query string and starts the share procedure 
  * You can get a query string from the game using the following methods getUrlParams and getUserProfile
  * @param {object} - parameters
  * @return {string} - link to the game with parameters
  * It is supported only in webapp games
  */
  customShare: () => string

  /**
  * Send payment data in analytics
  * @param {number} amount
  * @param {string} currency
  */
  sendAnalyticNewPayment: (amount: number, currency: string) => void

  /**
  * Send new session event in analytics
  */
  sendAnalyticNewSession: () => void
```

> Obviously, you can't call the method directly. We have saved the logic of constructing data for messages.
> For example, you want to use the `loading` method. To do this, you need to create an object with 2 fields: `method`, `value`
> Where the value of the `method` field will be the name of the method to be called, and the `value` field will be the loading state data.

#### Message Example

```javascript
const payload = {
  playdeck: {
    method: "loading",
    value: 100,
  },
};

parent.postMessage(payload, "*");
```

## Every method usage examples

[`getUser: () => { id, username, token }`](#get-user)
```javascript
// @deprecated - use getToken if you need to get user token
// To get user data, you must first request this data
// via postMessage from our integration environment.
// The method will also return a token that you can use
// to authenticate with your server.
const { parent } = window;
parent.postMessage({ playdeck: { method: "getUser" } }, "*");


// Then, to get this data, you need to create an event handler.
window.addEventListener("message", ({ data }) => {
  const playdeck = data?.playdeck;
  // All the data that our integration environment
  // passes is in an object whose key will be playdeck.
  if (!playdeck) return;

  // The `method` field stores a value that indicates
  // what the integration environment is responding to.
  if (playdeck.method === "getUser") {
    // In this block, we can read data from the `value` field.
    window.playdeckUser = playdeck.value;
  }
});
```

[`gameEnd: () => void`](#game-end)
```javascript
// This method is sent unilaterally only to our integration environment.
// It signals to our integration environment that the game has been over.
// After that we demonstrate the popup.

const { parent } = window;
parent.postMessage({ playdeck: { method: "gameEnd" } }, "*");
```

[`loading: (pct: number | undefined) => void`](#loading)
```javascript
// This method is sent unilaterally only to our integration environment.
// Causes our integration environment to display the download percentage of your game.
// Accepts values from 0 to 100 as a percentage. If you do not pass a value when calling at all,
// then the method will automatically simulate loading up to 80%.
// In order for the progressbar to become a Play button, you need to pass the value 100.

const { parent } = window;

// We call the loading method without passing a value
// so that the integration environment starts displaying the loading process
parent.postMessage({ playdeck: { method: "loading" } }, "*");
// Artificially slow down the download completion call by 1 second
setTimeout(() => {
  parent.postMessage({ playdeck: { method: "loading", value: 100 } }, "*");
}, 1000);
```

[`getPlaydeckState: () => boolean`](#get-playdeck-state)
```javascript
// This method will return you information about
// whether our integration environment overlay is currently open.

const { parent } = window;
parent.postMessage({ playdeck: { method: "getPlaydeckState" } }, "*");

window.addEventListener("message", ({ data }) => {
  const playdeck = data?.playdeck;
  if (!playdeck) return;

  if (playdeck.method === "getPlaydeckState") {
    window.isPlayDeckOpened = playdeck.value; // `value` === true or false;
  }
});
```

[`getUserLocale: () => Object`](#get-user-locale)
```javascript
// This method will query our integration framework for information about the user's locale.
// You can also get these parameters via method getUserProfile

const { parent } = window;
parent.postMessage({ playdeck: { method: "getUserLocale" } }, "*");

window.addEventListener("message", ({ data }) => {
  const playdeck = data?.playdeck;
  if (!playdeck) return;

  if (playdeck.method === "getUserLocale") {
    window.userLocale = playdeck.value;
  }
});
```

[`setScore: (score: number, force: boolean = false) => void`](#set-score)
```javascript
// This method will allow you to store progress data. For this we use our internal database.
// To get previously saved data, use the `getScore` method.
// The method works one-way and does not require reading the response.
// Set `force` flag to `true` if the high score is allowed to decrease.
// This can be useful when fixing mistakes or banning cheaters
//
// It is supported only in gameapp games

const { parent } = window;

parent.postMessage(
  { playdeck:
    {
      method: "setScore",
      value: "score",
      isForce: false,
    }
  }
, "*");
```

[`getScore: () => Object`](#get-score)
```javascript
// This method allows you to read a previously saved count value.
// Use the `setScore` method to store the score.
//
// It is supported only in gameapp games.

const { parent } = window;
parent.postMessage({ playdeck: { method: "getScore" } }, "*");

window.addEventListener("message", ({ data }) => {
  const playdeck = data?.playdeck;
  if (!playdeck) return;

  if (playdeck.method === "getScore") {
    window.playdeckScore = playdeck.value;
  }
});
```
[`setData: (key: string, data: string) => void`](#set-data)
```javascript
// This method will allow you to store any data you may need.
// Difference from the `setScore` method is that we use the cloud for `setData`.
// Data is saved by key. To retrieve previously saved data, use the `getData` method.

const { parent } = window;

parent.postMessage(
  { playdeck:
    {
      method: "setData",
      key: key,
      value: yourData,
    }
  }
, "*");
```
[`getData: (key: string) => { key: key, data: data }`](#get-data)
```javascript
// This method allows you to read previously written data by key.
// Use the `setData` method to save the data.

const { parent } = window;
parent.postMessage({ playdeck: { method: "getData", key: key } }, "*");

window.addEventListener("message", ({ data }) => {
  const playdeck = data?.playdeck;
  if (!playdeck) return;

  if (playdeck.method === "getData") {
    if (playdeck.key === "x") {
      window.customData = playdeck.value;
    } else {
      window.anotherCustomData = playdeck.value;
    }
  }
});
```

[`openTelegramLink: (url:  string) =>  void`](#open-telegram-link)
```javascript
// This method allows you to open links from within telegram clients
// Method is device aware:
// On Desktop clients links always open in an external browser (user's default browser in OS)
// On mobile clients:
// -- if link is telegram link (t.me, telegram.me) --> opens inside // telegram's internal browser
// -- if link to external resource (google.com, etc) --> open in an // external browser
// It is supported only in webapp games

const { parent } =  window;

// Desktop client opens such link in an extrnal browser
parent.postMessage({
  playdeck: {
  method:  'openTelegramLink',
    value:  'https://t.me/playdeckbot/market'
  }
}, "*")


// Mobile client opens such link in an internal telegram browser
parent.postMessage({

playdeck: {
  method:  'openTelegramLink',
    value:  'https://t.me/playdeckbot/market'
  }
}, "*")

```

[`sendAnalytics: (event:  Event) =>  void`](#send-analytics)
```javascript
/* This method allows you to send game events to our integration environment
 * Note, that user_properties.telegramId will be set by our platform
*/


const { parent } =  window;

type Event = {
  name: string;
  type: string;
  user_properties: Record<string, any>;
  event_properties: {
    name: string;
    [key: string]: any;
  };
}

const event_example: Event = {
  type: 'click',
  user_properties: {},
  event_properties: {
    name: 'play_button'
  }
}
parent.postMessage({ playdeck: { method:  'sendAnalytics', value:  event_example } }, "*")

```

[`getUserProfile: () => Profile`](#get-user-profile)
```javascript
// This method allows you to get user profile data

type Profile = {
  avatar: string;
  username: string;
  firstName: string;
  lastName: string;
  telegramId: number;
  locale: 'en'| 'ru';
  params: {[key: string]: string}; // the query string that the game opened with
  sessionId: string;
}

const { parent } = window;
parent.postMessage({ playdeck: { method: "getUserProfile" } }, "*");

window.addEventListener("message", ({ data }) => {
  const playdeck = data?.playdeck;
  if (!playdeck) return;

  if (playdeck.method === "getUserProfile") {
    console.log(playdeck.value) // Profile
  }
});
```

[`getToken: () => { token: token }`](#get-user-profile)
```javascript
// This method allows you to get user JWT token

const { parent } = window;
parent.postMessage({ playdeck: { method: "getToken" } }, "*");

window.addEventListener("message", ({ data }) => {
  const playdeck = data?.playdeck;
  if (!playdeck) return;

  if (playdeck.method === "getToken") {
    console.log(playdeck.value) // { token: '123456789...' }
  }
});
```

[`getUrlParams: () => Params`](#get-url-params)
```javascript
  // Get the query string that the game opened with. You can also get these parameters via method getUserProfile.
  // You can create a link with a query string to the game using the method customShare
  // It is supported only in webapp games

type Params = {
  [key: string]: string
}

const { parent } = window;
parent.postMessage({ playdeck: { method: "getUrlParams" } }, "*");

window.addEventListener("message", ({ data }) => {
  const playdeck = data?.playdeck;
  if (!playdeck) return;

  if (playdeck.method === "getUrlParams") {
    console.log(playdeck.value) // Params
  }
});
```

[`customShare: (object) => string`](#custom-share)
```javascript
  // Creating a telegram link with a query string and starts the share procedure
  // You can get a query string from the game using the following methods getUrlParams and getUserProfile
  // It is supported only in webapp games

const { parent } = window;
parent.postMessage({ playdeck: { method: "customShare", value: {[key: string]: string} } }, "*");

window.addEventListener("message", ({ data }) => {
  const playdeck = data?.playdeck;
  if (!playdeck) return;

  if (playdeck.method === "customShare") {
    console.log(playdeck.value) // link to the game
  }
});
```
